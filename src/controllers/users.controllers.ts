import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { AppError } from '../middlewares/errorHandler';
import { ChatCursor } from '../types/chat.types';
import { USERS_BATCH } from '../utils/constants';
import cloudinary from '../config/cloudinary';
import prisma from '../config/db';

/**
 * Retrieves a paginated list of users.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract pagination parameters from query string
    const cursor = req.query.cursor as string;
    const take = Number(req.query.take) || USERS_BATCH;

    // Fetch users with pagination
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      take: take + 1, // Fetch one extra to determine if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: 'asc' },
    });

    // Check if users were found
    if (!users) throw new AppError('No users found', StatusCodes.NOT_FOUND);

    // Determine if there's a next page and get the next cursor
    const hasNextPage = users.length > take;
    const nextCursor = hasNextPage ? users[take - 1].id : null;
    const paginatedUsers = users.slice(0, take);

    // Get total count of users
    const totalCount = await prisma.user.count();

    // Send successful response
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users: paginatedUsers,
        pagination: { totalCount, hasNextPage, nextCursor },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves paginated chats for the current user, including both one-on-one and group chats.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getUserChats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract pagination parameters from query string
    const take = Number(req.query.take) || USERS_BATCH;
    const cursorString = req.query.cursor as string;
    const currentUser = req.user;

    // Parse the cursor if provided
    let cursor: ChatCursor | undefined;
    if (cursorString) {
      cursor = JSON.parse(Buffer.from(cursorString, 'base64').toString());
    }

    // Verify the current user exists
    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId, isDeleted: false },
    });

    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Fetch one-on-one chats
    const oneOnOneChats = await prisma.oneOnOneChat.findMany({
      where: {
        OR: [{ initiatorId: currentUser.userId }, { participantId: currentUser.userId }],
        lastMessageAt: cursor ? { lt: cursor.lastMessageAt } : undefined,
      },
      take: take + 1,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        initiator: {
          select: { id: true, name: true, profilePicture: true, isDeleted: true },
        },
        participant: {
          select: { id: true, name: true, profilePicture: true, isDeleted: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });

    // Fetch group chats
    const groupChats = await prisma.groupChat.findMany({
      where: {
        OR: [{ memberIds: { has: currentUser.userId } }, { ownerId: currentUser.userId }],
        updatedAt: cursor ? { lt: cursor.lastMessageAt } : undefined,
      },
      take: take + 1,

      orderBy: { updatedAt: 'desc' },
      include: {
        owner: {
          select: { id: true, name: true, profilePicture: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    // Combine and sort all chats
    const allChats = [
      ...oneOnOneChats.map((chat) => ({
        ...chat,
        type: 'ONE_ON_ONE',
        name: currentUser.userId === chat.initiatorId ? chat.participant.name : chat.initiator.name,
        lastMessageAt: chat.lastMessageAt,
      })),
      ...groupChats.map((chat) => ({ ...chat, type: 'GROUP', lastMessageAt: chat.updatedAt })),
    ].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

    // Determine if there's a next page and paginate the results
    const hasNextPage = allChats.length > take;
    const paginatedChats = allChats.slice(0, take);

    // Generate the next cursor if there are more results
    let nextCursor: string | null = null;
    if (hasNextPage) {
      const lastChat = paginatedChats[paginatedChats.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({ lastMessageAt: lastChat.lastMessageAt, id: lastChat.id }),
      ).toString('base64');
    }

    // Send the response
    res.json({
      success: true,
      message: 'User chats fetched successfully',
      data: {
        chats: paginatedChats,
        pagination: { hasNextPage, nextCursor },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves a single user by their ID.
 * @param {Request} req - Express request object containing the user ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user ID from the request parameters
    const { id } = req.params;

    // Fetch the user from the database using Prisma
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        profilePicture: true,
        friendIds: true,
        friendOfIds: true,
        memberOfGroupIds: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    // If the user is not found, throw a custom error
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Send a successful response with the user data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Updates a user's profile information including name, bio, and profile picture.
 * @param {Request} req - Express request object containing user ID in params, name and bio in body, and profile picture file
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user ID from request parameters
    const { id } = req.params;
    // Extract name and bio from request body
    const { name, bio } = req.body;
    // Get the uploaded profile picture file
    const profilePicture = req.file;
    // Get the current user's ID from the authenticated user object
    const { userId } = req.user;

    // Check if the user is trying to update their own profile
    if (id !== userId) {
      throw new AppError('You can only update your own profile', StatusCodes.FORBIDDEN);
    }

    // Fetch the current user from the database
    const user = await prisma.user.findUnique({ where: { id, isDeleted: false } });
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Prepare the data to be updated
    const updateData: Partial<Pick<User, 'name' | 'bio' | 'profilePicture'>> = { name, bio };

    // Handle profile picture update if a new file is provided
    if (profilePicture) {
      // Upload the new profile picture to Cloudinary
      const updatedProfilePicture = await cloudinary.uploader.upload(profilePicture.path, {
        folder: 'profile_image',
      });

      if (!updatedProfilePicture) {
        throw new AppError('Failed to update profile picture', StatusCodes.INTERNAL_SERVER_ERROR);
      }

      // Add the new profile picture URL to the update data
      updateData.profilePicture = updatedProfilePicture.secure_url;

      // Delete the old profile picture from Cloudinary if it exists
      if (user.profilePicture) {
        const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`profile_images/${publicId}`);
        }
      }
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // Send the response with the updated user data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Soft deletes a user by setting the isDeleted flag to true.
 * @param {Request} req - Express request object containing user ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user ID from request parameters
    const { id } = req.params;
    // Get the current user's ID from the authenticated user object
    const { userId } = req.user;

    // Check if the user is trying to delete their own profile
    if (id !== userId) {
      throw new AppError('You can only delete your own profile', StatusCodes.FORBIDDEN);
    }

    // Fetch the current user from the database
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Delete the old profile picture from Cloudinary if it exists
    if (user.profilePicture) {
      const publicId = user.profilePicture.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`profile_images/${publicId}`);
      }
    }

    // Update the user in the database, setting isDeleted to true
    await prisma.user.update({
      where: { id },
      data: {
        name: 'Anonymous User',
        email: `deleted@${new Date().toISOString()}.com`,
        profilePicture: null,
        bio: null,
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Remove all the sent and received friend requests of user
    await prisma.friendRequest.deleteMany({
      where: { OR: [{ senderId: id }, { receiverId: id }] },
    });

    // Send the response indicating successful deletion
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully',
      data: null,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Changes the user's password after verifying the old password.
 * @param {Request} req - Express request object containing oldPassword, newPassword, and confirmPassword in the body
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const { userId } = req.user;

    // Check if the user is trying to delete their own profile
    if (id !== userId) {
      throw new AppError('You can only delete your own profile', StatusCodes.FORBIDDEN);
    }

    // Fetch the user from the database
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Check if the old password is correct
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordCorrect) throw new AppError('Incorrect password!', StatusCodes.BAD_REQUEST);

    // Hash the user's new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Send success response
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password changed successfully',
      data: null,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { changePassword, deleteUser, getUsers, getUserChats, getUser, updateUser };
