import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
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
        status: 'PENDING',
      },
    });

    // Create a new friend request
    if (existingFriendRequest) {
      throw new AppError(
        'You have already sent a friend request to this user',
        StatusCodes.BAD_REQUEST,
      );
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING',
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

export { sendFriendRequest };
