import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { FRIENDS_BATCH, USERS_BATCH } from '../utils/constants';
import { AppError } from '../middlewares/errorHandler';
import { ChatCursor } from '../types/chat.types';
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

    // Check if the user is trying to change their own password
    if (id !== userId) {
      throw new AppError('You can only change your own password', StatusCodes.FORBIDDEN);
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

/**
 * Retrieves a paginated list of friends for a specific user.
 * @param {Request} req - Express request object containing user ID in params and pagination details in query
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getFriends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Extract pagination parameters from query string
    const cursor = req.query.cursor as string;
    const take = Number(req.query.take) || FRIENDS_BATCH;

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Fetch friends with pagination
    const friends = await prisma.user.findMany({
      where: {
        OR: [
          { friendIds: { has: id }, isDeleted: false },
          { friendOfIds: { has: id }, isDeleted: false },
        ],
      },
      take: take + 1, // Fetch one extra to determine if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor as string },
      }),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
      distinct: ['id'],
    });

    // Determine if there's a next page and prepare pagination info
    const hasNextPage = friends.length > take;
    const nextCursor = hasNextPage ? friends[take - 1].id : null;
    const paginatedFriends = friends.slice(0, take);

    // Send response with friends data and pagination info
    res.json({
      success: true,
      message: 'Friends fetched successfully',
      data: {
        friends: paginatedFriends,
        pagination: {
          pagination: { hasNextPage, nextCursor },
        },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves a paginated list of pending friend requests for a specific user.
 * @param {Request} req - Express request object containing user ID in params and pagination details in query
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getFriendRequests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Extract pagination parameters from query string
    const cursor = req.query.cursor as string;
    const take = Number(req.query.take) || FRIENDS_BATCH;

    const { userId } = req.user;

    // Ensure the user is requesting their own friend requests
    if (id !== userId) {
      throw new AppError('You can only fetch your own friend requests', StatusCodes.FORBIDDEN);
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Fetch friend requests with pagination
    const friendRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: id,
        status: 'PENDING',
        sender: { isDeleted: false },
      },
      take: take + 1, // Fetch one extra to determine if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, profilePicture: true },
        },
      },
    });

    // Determine if there's a next page and prepare pagination info
    const hasNextPage = friendRequests.length > take;
    const nextCursor = hasNextPage ? friendRequests[take - 1].id : null;
    const paginatedFriendRequests = friendRequests.slice(0, take);

    // Send response with friend requests data and pagination info
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Friend Request fetched successfully',
      data: {
        friendRequests: paginatedFriendRequests,
        pagination: {
          hasNextPage,
          nextCursor,
        },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Removes a friend relationship between two users.
 * @param {Request} req - Express request object containing user ID and friend ID in params
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const unfriendUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, friendId } = req.params;
    const { userId } = req.user;

    // Ensure the user is attempting to unfriend their own friend
    if (id !== userId) {
      throw new AppError('You can only unfriend your friends', StatusCodes.FORBIDDEN);
    }

    // Ensure user is not attempting to unfriend himself
    if (id === friendId) {
      throw new AppError('You cannot unfriend yourself', StatusCodes.FORBIDDEN);
    }

    // Fetch both users simultaneously
    const [user, friend] = await Promise.all([
      prisma.user.findUnique({
        where: { id, isDeleted: false },
      }),
      prisma.user.findUnique({ where: { id: friendId, isDeleted: false } }),
    ]);

    // Verify both users exist
    if (!user || !friend) {
      throw new AppError('User or friend not found', StatusCodes.NOT_FOUND);
    }

    // Check if the users are actually friends
    const areFriends = user.friendIds.includes(friendId) || user.friendOfIds.includes(friendId);

    if (!areFriends) {
      throw new AppError('You are not friends with this user', StatusCodes.NOT_FOUND);
    }

    // Perform the unfriend operation in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          friendIds: { set: user.friendIds.filter((id) => id !== friendId) },
          friendOfIds: {
            set: user.friendOfIds.filter((id) => id !== friendId),
          },
        },
      }),
      prisma.user.update({
        where: { id: friendId },
        data: {
          friendIds: { set: friend.friendIds.filter((id) => id !== userId) },
          friendOfIds: {
            set: friend.friendOfIds.filter((id) => id !== userId),
          },
        },
      }),
      prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: userId, receiverId: friendId },
            { senderId: friendId, receiverId: userId },
          ],
        },
      }),
    ]);

    // Send successful response
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Friend removed successfully',
      data: null,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves a paginated list of suggested friends for a specific user.
 * Suggested friends are users who are friends of the user's friends but not yet friends with the user.
 * @param {Request} req - Express request object containing user ID in params and pagination details in query
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getSuggestedFriends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Extract pagination parameters from query string
    const cursor = req.query.cursor as string;
    const take = Number(req.query.take) || FRIENDS_BATCH;

    const { userId } = req.user;

    // Ensure the user is requesting their own suggested friends
    if (id !== userId) {
      throw new AppError('You can only fetch your suggested friends', StatusCodes.FORBIDDEN);
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Combine friendIds and friendOfIds to get all existing friend IDs
    const existingFriendIds = Array.from([...user.friendIds, ...user.friendOfIds]);

    // Fetch suggested friends with pagination
    const suggestedFriends = await prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: [...existingFriendIds, id] }, isDeleted: false },
          {
            OR: [
              { friendIds: { hasSome: existingFriendIds } },
              { friendOfIds: { hasSome: existingFriendIds } },
            ],
          },
        ],
      },
      take: take + 1, // Fetch one extra to determine if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
    });

    // Determine if there's a next page and prepare pagination info
    const hasNextPage = suggestedFriends.length > take;
    const nextCursor = hasNextPage ? suggestedFriends[take - 1].id : null;
    const paginatedSuggestions = suggestedFriends.slice(0, take);

    // Send response with suggested friends data and pagination info
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Suggested friends fetched successfully',
      data: {
        suggestedFriends: paginatedSuggestions,
        pagination: { hasNextPage, nextCursor },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves a paginated list of mutual friends between the current user and another user.
 * Mutual friends are users who are friends with both the current user and the specified other user.
 * @param {Request} req - Express request object containing user IDs in params and pagination details in query
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const getMutualFriends = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, otherUserId } = req.params;

    // Extract pagination parameters from query string
    const cursor = req.query.cursor as string;
    const take = Number(req.query.take) || FRIENDS_BATCH;

    const { userId } = req.user;

    // Ensure the user is requesting their own mutual friends
    if (id !== userId) {
      throw new AppError('You can only fetch your mutual friends', StatusCodes.FORBIDDEN);
    }

    // Validate that both user IDs are provided
    if (!id || !otherUserId) {
      throw new AppError('Both IDs are required', StatusCodes.BAD_REQUEST);
    }

    // Fetch both users simultaneously
    const [user1, user2] = await Promise.all([
      prisma.user.findUnique({ where: { id, isDeleted: false } }),
      prisma.user.findUnique({ where: { id: otherUserId, isDeleted: false } }),
    ]);

    // Verify both users exist
    if (!user1 || !user2) {
      throw new AppError('One or both users not found', StatusCodes.NOT_FOUND);
    }

    // Fetch mutual friends with pagination
    const mutualFriends = await prisma.user.findMany({
      where: {
        AND: [
          // Friends of the current user
          { OR: [{ friendIds: { has: id } }, { friendOfIds: { has: id } }] },
          // Friends of the other user
          {
            OR: [{ friendIds: { has: otherUserId } }, { friendOfIds: { has: otherUserId } }],
          },
        ],
        isDeleted: false,
      },
      take: take + 1, // Fetch one extra to determine if there's a next page
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true,
      },
    });

    // Determine if there's a next page and prepare pagination info
    const hasNextPage = mutualFriends.length > take;
    const nextCursor = hasNextPage ? mutualFriends[take - 1].id : null;
    const paginatedMutualFriends = mutualFriends.slice(0, take);

    // Send response with mutual friends data and pagination info
    res.json({
      success: true,
      message: 'Mutual friends fetched successfully',
      data: {
        mutualFriends: paginatedMutualFriends,
        pagination: { hasNextPage, nextCursor },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export {
  changePassword,
  deleteUser,
  getFriends,
  getFriendRequests,
  getMutualFriends,
  getSuggestedFriends,
  getUsers,
  getUserChats,
  getUser,
  unfriendUser,
  updateUser,
};
