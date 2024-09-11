import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
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
    if (!user) throw new AppError('User not found!', StatusCodes.NOT_FOUND);

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
    const existingChat = await prisma.oneOnOneChat.findUnique({
      where: {
        initiatorId_participantId: {
          initiatorId,
          participantId,
        },
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
      data: { chat_id: newChat.id },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { createOneOnOneChat };
