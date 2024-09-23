import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import cloudinary from '../config/cloudinary';
import prisma from '../config/db';

const createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;
    if (!user) throw new AppError('User not found!', StatusCodes.NOT_FOUND);

    // Extract the ownerId, memberIds and name from the request body
    const { ownerId, memberIds, name, groupDescription } = req.body;

    // Extract file (groupIcon) from request
    const groupIcon = req.file;
    if (!groupIcon) throw new AppError('Group icon is required', StatusCodes.BAD_REQUEST);

    // Check if the ownerId and memberIds exist in the database
    const [owner, members] = await Promise.all([
      prisma.user.findUnique({ where: { id: ownerId } }),
      prisma.user.findMany({ where: { id: { in: memberIds } } }),
    ]);
    if (!owner || !members) throw new AppError('Admin or Member not found!', StatusCodes.NOT_FOUND);

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

    // Upload the group icon to Cloudinary
    const uploadedGroupIcon = await cloudinary.uploader.upload(groupIcon.path, {
      folder: 'group_icons',
    });
    if (!uploadedGroupIcon)
      throw new AppError('Error uploading group icon', StatusCodes.INTERNAL_SERVER_ERROR);

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
        groupDescription,
        groupIcon: uploadedGroupIcon.secure_url,
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

const getGroupChatDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;
    if (!user) throw new AppError('User not found!', StatusCodes.NOT_FOUND);

    // Extract the chatId from the request params
    const { chatId } = req.params;

    // Check if the chat exists in the database
    const existingChat = await prisma.groupChat.findUnique({
      where: { id: chatId },
    });
    if (!existingChat) throw new AppError('Group chat not found!', StatusCodes.NOT_FOUND);

    // Check if the user is either the owner or a member of the chat
    if (
      existingChat.ownerId !== user.userId &&
      !existingChat.memberIds.some((memberId) => memberId === user.userId)
    )
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

export { createGroupChat, getGroupChatDetails };
