import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../middlewares/errorHandler';
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

export { getUsers };
