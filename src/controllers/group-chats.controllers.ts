import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import prisma from '../config/db';

const createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;
    if (!user) throw new AppError('User not found!', StatusCodes.NOT_FOUND);

    // Extract the ownerId, memberIds and name from the request body
    const { ownerId, memberIds, name } = req.body;

    // Check if the ownerId and memberIds exist in the database
    const [owner, members] = await Promise.all([
      prisma.user.findUnique({ where: { id: ownerId } }),
      prisma.user.findMany({ where: { id: { in: memberIds } } }),
    ]);
    if (!owner || !members) throw new AppError('Admin or Member not found!', StatusCodes.NOT_FOUND);

    // Check if the chat already exists
    const existingChat = await prisma.groupChat.findFirst({
      where: {
        name,
        ownerId,
        memberIds: {
          equals: [...memberIds, ownerId],
        },
      },
    });
    if (existingChat) throw new AppError('Group Chat already exists!', StatusCodes.CONFLICT);

    // Check if the members are friends of the owner
    const existingFriendship = await prisma.user.findFirst({
      where: {
        id: ownerId,
        AND: memberIds.map((memberId: string) => ({
          OR: [{ friendIds: { has: memberId } }, { friendOfIds: { has: memberId } }],
        })),
      },
    });
    if (!existingFriendship)
      throw new AppError(
        `You can't add members who aren't your friends in groups!`,
        StatusCodes.BAD_REQUEST,
      );

    // Create a new group chat
    const newChat = await prisma.groupChat.create({
      data: {
        name,
        owner: {
          connect: { id: ownerId },
        },
        members: {
          connect: [{ id: ownerId }, ...memberIds.map((id: string) => ({ id }))],
        },
      },
    });

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Group chat created successfully!',
      data: { chat: newChat },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { createGroupChat };
