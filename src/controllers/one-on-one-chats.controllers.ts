import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import { MESSAGES_BATCH } from '../utils/constants';
import { OneOnOneChatSettings } from '../types/one-on-one-chats.types';
import prisma from '../config/db';

/**
 * Creates a new one-on-one chat between two users who are friends.
 *
 * @async
 * @function createOneOnOneChat
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if users are not found/friends or chat already exists
 * @returns {Promise<void>}
 */
const createOneOnOneChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the initiator and participant ids from the request body
    const { initiatorId, participantId } = req.body;

    // Check if the initiator and participant exist in the database
    const [initiator, participant] = await Promise.all([
      prisma.user.findUnique({ where: { id: initiatorId } }),
      prisma.user.findUnique({ where: { id: participantId } }),
    ]);
    if (!initiator || !participant) throw new AppError('User not found!', StatusCodes.NOT_FOUND);

    // Check if the user is the initiator
    if (user.userId !== initiatorId)
      throw new AppError(`You're not allowed to create this chat!`, StatusCodes.BAD_REQUEST);

    // Check if the chat already exists
    const existingChat = await prisma.oneOnOneChat.findFirst({
      where: {
        OR: [
          {
            initiatorId,
            participantId,
          },
          {
            initiatorId: participantId,
            participantId: initiatorId,
          },
        ],
      },
    });
    if (existingChat) throw new AppError('Chat already exists!', StatusCodes.CONFLICT);

    // Check if the initiator and participant are friends
    const existingFriendship = await prisma.user.findFirst({
      where: {
        id: initiatorId,
        OR: [{ friendIds: { has: participantId } }, { friendOfIds: { has: participantId } }],
      },
    });
    if (!existingFriendship)
      throw new AppError(
        `You can't initiate chats with users who are not your friends!`,
        StatusCodes.BAD_REQUEST,
      );

    // Create a new one-on-one chat
    const newChat = await prisma.oneOnOneChat.create({
      data: {
        initiatorId,
        participantId,
      },
    });

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Chat created successfully!',
      data: { chat: newChat },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves details of a specific one-on-one chat.
 *
 * @async
 * @function getOneOnOneChat
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if the chat is not found or the user is not allowed to view it
 * @returns {Promise<void>}
 */
const getOneOnOneChatDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chat id from the url
    const { chatId } = req.params;
    if (!chatId) throw new AppError('Chat ID is missing!', StatusCodes.NOT_FOUND);

    // Check if the chat exists in the database
    const existingChat = await prisma.oneOnOneChat.findUnique({
      where: { id: chatId },
    });
    if (!existingChat) throw new AppError('Chat not found!', StatusCodes.NOT_FOUND);

    // Check if the user is either the initiator or the participant of the chat
    if (existingChat.initiatorId !== user.userId && existingChat.participantId !== user.userId)
      throw new AppError('You are not allowed to view this chat!', StatusCodes.FORBIDDEN);

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Chat details retrieved successfully!',
      data: { chat: existingChat },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Updates the settings of a specific one-on-one chat.
 *
 * @param req - Express Request object containing user information and chat settings
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @throws {AppError} - If the chat is not found or the user is not allowed to view the messages
 * @returns {Promise<void>}
 */
const updateOneOnOneChatSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chat id from the url
    const { chatId } = req.params;
    if (!chatId) throw new AppError('Chat ID is missing!', StatusCodes.NOT_FOUND);

    // Check if the settings are provided in the request body
    if (!req.body.settings || typeof req.body.settings !== 'object') {
      throw new AppError('Missing or invalid settings!', StatusCodes.BAD_REQUEST);
    }

    // Extract the settings from the request body
    const settings: OneOnOneChatSettings = req.body.settings;

    // Check if the chat exists in the database
    const existingChat = await prisma.oneOnOneChat.findUnique({
      where: { id: chatId },
    });
    if (!existingChat) throw new AppError('Chat not found!', StatusCodes.NOT_FOUND);

    // Check if the user is the initiiator or participant of the chat
    if (user.userId !== existingChat.initiatorId && user.userId !== existingChat.participantId) {
      throw new AppError(
        `You are not allowed to update this chat's settings!`,
        StatusCodes.FORBIDDEN,
      );
    }

    // Update the chat settings
    await prisma.oneOnOneChat.update({
      where: { id: chatId },
      data: settings,
    });

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Chat settings updated successfully!',
      data: null,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves messages for a one-on-one chat with pagination support and search functionality.
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 * @throws {AppError} - If the chat is not found or the user is not authorized to view the messages
 * @returns {Promise<void>}
 */
const getOneOnOneChatMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chat id from the url
    const { chatId } = req.params;
    if (!chatId) throw new AppError('Chat ID is missing!', StatusCodes.NOT_FOUND);

    // Extract the cursor from the query parameters
    const cursor = req.query.cursor as string;

    // Extract the search query from the query parameters
    const search = req.query.search as string;

    // Set the take value
    const take = Number(req.query.take) || MESSAGES_BATCH;

    // Check if the chat exists in the database
    const existingChat = await prisma.oneOnOneChat.findUnique({
      where: { id: chatId },
    });
    if (!existingChat) throw new AppError('Chat not found!', StatusCodes.NOT_FOUND);

    // Check if the user is either the initiator or the participant of the chat
    if (existingChat.initiatorId !== user.userId && existingChat.participantId !== user.userId)
      throw new AppError(
        'You are not allowed to view the messages of this chat!',
        StatusCodes.FORBIDDEN,
      );

    // Get the chat messages
    const chatMessages = await prisma.message.findMany({
      where: {
        ...(search && { content: { contains: search, mode: 'insensitive' } }),
        oneOnOneChatId: chatId,
      },
      take: take + 1, // Fetch one extra to determine if there are more messages
      skip: cursor ? 1 : undefined,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    // Determine if there are more messages and get the next cursor
    const totalCount = await prisma.message.count({
      where: {
        ...(search && { content: { contains: search, mode: 'insensitive' } }),
        oneOnOneChatId: chatId,
      },
    });
    const hasNextPage = chatMessages.length > take;
    const nextCursor = hasNextPage ? chatMessages[take - 1].id : null;

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Chat messages retrieved successfully!',
      data: {
        messages: chatMessages.slice(0, take),
        pagination: { totalCount, hasNextPage, nextCursor },
      },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export {
  createOneOnOneChat,
  getOneOnOneChatDetails,
  updateOneOnOneChatSettings,
  getOneOnOneChatMessages,
};
