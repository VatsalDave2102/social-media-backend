import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import prisma from '../config/db';

/**
 * Sends a message in either a one-on-one chat or a group chat.
 *
 * @async
 * @function sendMessage
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} Throws an error if the sender is not found, not authorized, or if the chat doesn't exist
 * @returns {Promise<void>}
 */
const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the content, sender, and chat id from the request body
    const { content, senderId, oneOnOneChatId, groupChatId } = req.body;

    // Check if the sender is an existing user in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: senderId, isDeleted: false },
    });
    if (!existingUser) throw new AppError('Sender not found!', StatusCodes.NOT_FOUND);

    // Check if the userId is the sender of the message
    if (senderId !== user.userId)
      throw new AppError(
        'You are not allowed to send messages in this chat!',
        StatusCodes.FORBIDDEN,
      );

    // Check if the chat exists in the database and the user is a member of the chat
    if (oneOnOneChatId) {
      const existingChat = await prisma.oneOnOneChat.findUnique({
        where: {
          id: oneOnOneChatId,
          OR: [{ initiatorId: user.userId }, { participantId: user.userId }],
        },
      });
      if (!existingChat) throw new AppError('Chat not found!', StatusCodes.NOT_FOUND);
    }

    if (groupChatId) {
      const existingChat = await prisma.groupChat.findUnique({
        where: { id: groupChatId, memberIds: { has: user.userId } },
      });
      if (!existingChat) throw new AppError('Chat not found!', StatusCodes.NOT_FOUND);
    }

    // Create a new message
    const newMessage = await prisma.$transaction(async (prisma) => {
      const message = await prisma.message.create({
        data: {
          content,
          senderId,
          ...(oneOnOneChatId ? { oneOnOneChatId } : { groupChatId }),
        },
      });

      if (oneOnOneChatId) {
        await prisma.oneOnOneChat.update({
          where: { id: oneOnOneChatId },
          data: { lastMessageAt: message.createdAt },
        });
      } else if (groupChatId) {
        await prisma.groupChat.update({
          where: { id: groupChatId },
          data: { lastMessageAt: message.createdAt },
        });
      }

      return message;
    });

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { sendMessage };
