import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
import { GroupChatSettings } from '../types/group-chats.types';
import { MESSAGES_BATCH } from '../utils/constants';
import cloudinary from '../config/cloudinary';
import prisma from '../config/db';

/**
 * Creates a new group chat with specified members, name, description, and icon.
 *
 * @async
 * @function createGroupChat
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if user lacks permission, members aren't friends with owner or creation process encounters issues
 * @returns {Promise<void>}
 */
const createGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the ownerId, memberIds and name from the request body
    const { ownerId, memberIds, name, groupDescription } = req.body;

    // Extract file (groupIcon) from request
    const groupIcon = req.file;
    if (!groupIcon) throw new AppError('Group icon is required', StatusCodes.BAD_REQUEST);

    // Check if the ownerId and memberIds exist in the database
    const [owner, members] = await Promise.all([
      prisma.user.findUnique({ where: { id: ownerId, isDeleted: false } }),
      prisma.user.findMany({ where: { id: { in: memberIds }, isDeleted: false } })
    ]);
    if (!owner || !members) throw new AppError('Admin or Member not found!', StatusCodes.NOT_FOUND);

    // Check if the user is the owner of the chat
    if (user.userId !== ownerId)
      throw new AppError(
        `You don't have permission to create a group chat!`,
        StatusCodes.FORBIDDEN
      );

    // Check if the members are friends of the owner
    const existingFriendship = await prisma.user.findFirst({
      where: {
        id: ownerId,
        AND: memberIds.map((memberId: string) => ({
          OR: [{ friendIds: { has: memberId } }, { friendOfIds: { has: memberId } }]
        }))
      }
    });
    if (!existingFriendship)
      throw new AppError(
        `You can't add members who aren't your friends in groups!`,
        StatusCodes.BAD_REQUEST
      );

    // Upload the group icon to Cloudinary
    const uploadedGroupIcon = await cloudinary.uploader.upload(groupIcon.path, {
      folder: 'group_icons'
    });
    if (!uploadedGroupIcon)
      throw new AppError('Error uploading group icon', StatusCodes.INTERNAL_SERVER_ERROR);

    // Create a new group chat
    const newChat = await prisma.groupChat.create({
      data: {
        name,
        owner: {
          connect: { id: ownerId }
        },
        members: {
          connect: [{ id: ownerId }, ...memberIds.map((id: string) => ({ id }))]
        },
        groupDescription,
        groupIcon: uploadedGroupIcon.secure_url
      }
    });

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Group chat created successfully!',
      data: newChat
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves details of a specific group chat.
 *
 * @async
 * @function getGroupChatDetails
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if the chat doesn't exist or user lacks permission
 * @returns {Promise<void>}
 */
const getGroupChatDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chatId from the request params
    const { chatId } = req.params;

    // Check if the chat exists in the database
    const existingChat = await prisma.groupChat.findUnique({
      where: { id: chatId }
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
      data: existingChat
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Updates the settings of a group chat.
 *
 * @async
 * @function updateGroupChatSettings
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if the chat doesn't exist, user lacks permission or update process fails
 * @returns {Promise<void>}
 */
const updateGroupChatSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let uploadedUpdatedGroupIcon, updatedSettings: GroupChatSettings;

    // Extract the user from the request
    const { user } = req;

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
        folder: 'group_icons'
      });
      if (!uploadedUpdatedGroupIcon)
        throw new AppError('Error uploading group icon', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Check if the chat exists in the database
    const existingChat = await prisma.groupChat.findUnique({
      where: { id: chatId }
    });
    if (!existingChat) throw new AppError('Group chat not found!', StatusCodes.NOT_FOUND);

    // Check if the user is the owner of the chat
    if (user.userId !== existingChat.ownerId)
      throw new AppError(
        `You don't have permission to update this chat's settings!`,
        StatusCodes.FORBIDDEN
      );

    // Update the chat settings
    await prisma.groupChat.update({
      where: { id: chatId },
      data: { ...updatedSettings, groupIcon: uploadedUpdatedGroupIcon?.secure_url }
    });

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Chat settings updated successfully!',
      data: null
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Retrieves messages from a group chat with pagination and search functionality.
 *
 * @async
 * @function getGroupChatMessages
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if chat doesn't exist or user lacks permission
 * @returns {Promise<void>}
 */
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
      where: { id: chatId }
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
        groupChatId: chatId
      },
      take: take + 1, // Fetch one extra to determine if there are more messages
      skip: cursor ? 1 : undefined,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' }
    });

    const totalCount = await prisma.message.count({
      where: {
        ...(search && { content: { contains: search, mode: 'insensitive' } }),
        groupChatId: chatId
      }
    });
    const hasNextPage = chatMessages.length > take;
    const nextCursor = hasNextPage ? chatMessages[take - 1].id : null;

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Chat messages retrieved successfully!',
      data: {
        messages: chatMessages.slice(0, take),
        pagination: { totalCount, hasNextPage, nextCursor }
      }
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Adds new members to an existing group chat.
 *
 * @async
 * @function addMembersToGroupChat
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if chat doesn't exist, members not found, user lacks permission or members aren't friends with the owner
 * @returns {Promise<void>}
 */
const addMembersToGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chatId from the request params
    const { chatId } = req.params;

    // Extract the ownerId and memberId from the request body
    const { ownerId, memberIds } = req.body;

    // Check if the chat exists in the database
    const existingChat = await prisma.groupChat.findUnique({
      where: { id: chatId }
    });
    if (!existingChat) throw new AppError('Group chat not found!', StatusCodes.NOT_FOUND);

    // Check if the owner and members exist in the database
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: [ownerId, ...memberIds] }, isDeleted: false }
    });

    // Owner is also a member of the chat
    if (existingUsers.length !== memberIds.length + 1)
      throw new AppError('One or more members not found!', StatusCodes.NOT_FOUND);

    // Check if the owner has permission to add members to the chat
    if (ownerId !== user.userId && ownerId !== existingChat.ownerId)
      throw new AppError(
        `You don't have permission to add members to this chat!`,
        StatusCodes.FORBIDDEN
      );

    // Filter out existing members
    const existingUserIds = existingUsers.map((user) => user.id);
    const existingMemberIds = existingChat.memberIds;
    const newMemberIds = existingUserIds.filter((id) => !existingMemberIds.includes(id));

    // Check if the members are friends of the owner
    const existingFriendship = await prisma.user.findFirst({
      where: {
        id: ownerId,
        AND: newMemberIds.map((memberId: string) => ({
          OR: [{ friendIds: { has: memberId } }, { friendOfIds: { has: memberId } }]
        }))
      }
    });
    if (!existingFriendship)
      throw new AppError(
        `You can't add members who aren't your friends in groups!`,
        StatusCodes.BAD_REQUEST
      );

    // Add the members to the chat
    await prisma.groupChat.update({
      where: { id: chatId },
      data: {
        members: {
          connect: newMemberIds.map((id: string) => ({ id }))
        }
      }
    });

    const responseMessage =
      newMemberIds.length === 0
        ? `No new members added, all members already exist`
        : newMemberIds.length > 1
          ? `${newMemberIds.length} Members added successfully!`
          : `Member added successfully!`;

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: responseMessage,
      data: null
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Removes a member from an existing group chat.
 *
 * @async
 * @function removeMemberFromGroupChat
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @throws {AppError} - Throws an error if chat doesn't exist, member not found, user lacks permission or member is the owner
 * @returns {Promise<void>}
 */
const removeMemberFromGroupChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract the user from the request
    const { user } = req;

    // Extract the chatId from the request params
    const { chatId } = req.params;

    // Extract the ownerId and memberId from the request body
    const { ownerId, memberId } = req.body;

    // Check if the chat exists in the database
    const existingChat = await prisma.groupChat.findUnique({
      where: { id: chatId }
    });
    if (!existingChat) throw new AppError('Group chat not found!', StatusCodes.NOT_FOUND);

    // Check if the member is not the owner
    if (memberId === existingChat.ownerId)
      throw new AppError('You cannot delete the owner of the chat!', StatusCodes.FORBIDDEN);

    // Check if the owner and member exist in the database
    const existingUsers = await prisma.user.findMany({
      where: { id: { in: [ownerId, memberId] }, isDeleted: false }
    });
    if (existingUsers.length !== 2)
      throw new AppError('Admin or member not found!', StatusCodes.NOT_FOUND);

    // Check if the owner has permission to delete members from the chat
    if (ownerId !== user.userId && ownerId !== existingChat.ownerId)
      throw new AppError(
        `You don't have permission to delete members from this chat!`,
        StatusCodes.FORBIDDEN
      );

    // Check if the member is already not in the chat
    const existingMembersInChat = await prisma.groupChat.findFirst({
      where: {
        id: chatId,
        memberIds: {
          has: memberId
        }
      }
    });
    if (!existingMembersInChat)
      throw new AppError('The member is not in the chat!', StatusCodes.CONFLICT);

    // Delete the member from the chat
    await prisma.groupChat.update({
      where: { id: chatId },
      data: {
        members: {
          disconnect: { id: memberId }
        }
      }
    });

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Member deleted successfully!',
      data: null
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export {
  createGroupChat,
  getGroupChatDetails,
  updateGroupChatSettings,
  getGroupChatMessages,
  addMembersToGroupChat,
  removeMemberFromGroupChat
};
