import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import { GroupChatSettings } from '../types/group-chats.types';
import cloudinary from '../config/cloudinary';
import prisma from '../config/db';
import { MESSAGES_BATCH } from '../utils/constants';

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

const updateGroupChatSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let uploadedUpdatedGroupIcon, updatedSettings: GroupChatSettings;

    // Extract the user from the request
    const { user } = req;
    if (!user) throw new AppError('User not found!', StatusCodes.NOT_FOUND);

    // Extract the chatId from the request params
    const { chatId } = req.params;

    // Check if the settings are provided in the request body
    const { settings } = req.body;
    if (!settings) throw new AppError('No settings provided!', StatusCodes.BAD_REQUEST);

    // Check if the settings are in the correct format
    try {
      updatedSettings = JSON.parse(settings);
    } catch (err) {
      throw new AppError('Invalid settings!', StatusCodes.BAD_REQUEST);
    }

    // Extract the groupIcon from the request if provided
    const groupIcon = req.file;
    if (groupIcon) {
      // Upload the group icon to Cloudinary
      uploadedUpdatedGroupIcon = await cloudinary.uploader.upload(groupIcon.path, {
        folder: 'group_icons',
      });
      if (!uploadedUpdatedGroupIcon)
        throw new AppError('Error uploading group icon', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Check if the chat exists in the database
    const existingChat = await prisma.groupChat.findUnique({
      where: { id: chatId },
    });
    if (!existingChat) throw new AppError('Group chat not found!', StatusCodes.NOT_FOUND);

    // Check if the user is the owner of the chat
    if (user.userId !== existingChat.ownerId)
      throw new AppError(
        `You don't have permission to update this chat's settings!`,
        StatusCodes.FORBIDDEN,
      );

    // Update the chat settings
    await prisma.groupChat.update({
      where: { id: chatId },
      data: { ...updatedSettings, groupIcon: uploadedUpdatedGroupIcon?.secure_url },
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

const getGroupChatMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chatId from the request params
    const { chatId } = req.params;

    // Extract the cursor from the query parameters
    const cursor = req.query.cursor as string;

    // Extract the searcch query from the query parameters
    const search = req.query.search as string;

    // Set the take value
    const take = Number(req.query.take) || MESSAGES_BATCH;

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

    // Get the chat messages
    const chatMessages = await prisma.message.findMany({
      where: {
        ...(search && { content: { contains: search, mode: 'insensitive' } }),
        groupChatId: chatId,
      },
      take: take + 1, // Fetch one extra to determine if there are more messages
      skip: cursor ? 1 : undefined,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.message.count({
      where: {
        ...(search && { content: { contains: search, mode: 'insensitive' } }),
        groupChatId: chatId,
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

export { createGroupChat, getGroupChatDetails, updateGroupChatSettings, getGroupChatMessages };
