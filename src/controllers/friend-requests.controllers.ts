import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import { FriendRequestStatus } from '@prisma/client';
import prisma from '../config/db';

/**
 * Sends a friend request from one user to another.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * @throws {AppError} If sender or receiver not found, already friends, or request already sent
 */
const sendFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extracting sender and receiver IDs
    const { senderId, receiverId } = req.body;

    // Find both sender and receiver users
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId, isDeleted: false } }),
      prisma.user.findUnique({ where: { id: receiverId, isDeleted: false } }),
    ]);

    // Check if both users exist
    if (!sender || !receiver) {
      throw new AppError('Sender or Receiver not found', StatusCodes.NOT_FOUND);
    }

    // Check if users are already friends
    const existingFriendship = await prisma.user.findUnique({
      where: {
        id: senderId,
        OR: [{ friendIds: { has: receiverId } }, { friendOfIds: { has: receiverId } }],
      },
    });

    if (existingFriendship) {
      throw new AppError('You are already friends with this user', StatusCodes.BAD_REQUEST);
    }

    // Check if a friend request already exists
    const existingFriendRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        status: FriendRequestStatus.PENDING,
      },
    });

    // Create a new friend request
    if (existingFriendRequest) {
      throw new AppError('You have a friend request with this user', StatusCodes.BAD_REQUEST);
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: FriendRequestStatus.PENDING,
      },
    });

    // Send successful response
    res.status(StatusCodes.CREATED).json({
      message: 'Friend request sent successfully',
      data: { friendRequest },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Updates the status of a friend request.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * @throws {AppError} If friend request not found, already processed, or user is not the receiver
 */
const updateFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { userId } = req.user;

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id },
    });

    // Check if the friend request exists
    if (!friendRequest) {
      throw new AppError('Friend request not found', StatusCodes.NOT_FOUND);
    }

    // Check if the friend request is still pending
    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new AppError('Friend request has already been processed', StatusCodes.BAD_REQUEST);
    }

    // Ensure the current user is the receiver of the friend request
    if (friendRequest.receiverId !== userId) {
      throw new AppError('You are not the receiver of this friend request', StatusCodes.FORBIDDEN);
    }

    if (status === FriendRequestStatus.ACCEPTED) {
      // Accept the friend request
      await prisma.$transaction([
        // Update sender's friendIds
        prisma.user.update({
          where: { id: friendRequest.senderId },
          data: { friendIds: { push: friendRequest.receiverId } },
        }),
        // Update receiver's friendOfIds
        prisma.user.update({
          where: { id: friendRequest.receiverId },
          data: {
            friendOfIds: { push: friendRequest.senderId },
          },
        }),
        // Update friend request status
        prisma.friendRequest.update({
          where: { id: friendRequest.id },
          data: { status: FriendRequestStatus.ACCEPTED },
        }),
      ]);

      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Friend request accepted successfully',
        data: null,
      });
    } else if (status === FriendRequestStatus.REJECTED) {
      // Reject the friend request by deleting it
      await prisma.friendRequest.delete({ where: { id } });
      return res.status(200).json({
        success: true,
        message: 'Friend request rejected successfully',
        data: null,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Cancels a pending friend request sent by the current user.
 *
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 * @throws {AppError} If friend request not found, already processed, or user is not the sender
 */
const cancelFriendRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Find the friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id },
    });

    // Check if the friend request exists
    if (!friendRequest) {
      throw new AppError('Friend request not found', StatusCodes.NOT_FOUND);
    }

    // Ensure the current user is the sender of the friend request
    if (friendRequest.senderId !== userId) {
      throw new AppError('You are not the sender of this friend request', StatusCodes.FORBIDDEN);
    }

    // Check if the friend request is still pending
    if (friendRequest.status !== 'PENDING') {
      throw new AppError('Friend request has already been processed', StatusCodes.BAD_REQUEST);
    }

    // Delete the friend request
    await prisma.friendRequest.delete({
      where: { id },
    });

    // Send successful response
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Friend request cancelled successfully',
      data: null,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { cancelFriendRequest, sendFriendRequest, updateFriendRequest };
