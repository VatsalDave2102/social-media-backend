import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import { ChatCursor } from '../types/chat.types';
import { USERS_BATCH } from '../utils/constants';
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
      where: { id: currentUser.userId },
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
          select: { id: true, name: true, profilePicture: true },
        },
        participant: {
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

export { getUsers, getUserChats };
