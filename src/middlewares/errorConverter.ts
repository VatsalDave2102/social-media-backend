import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';

import { AppError } from './errorHandler';

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof AppError)) {
    const statusCode =
      error.statusCode || error instanceof Prisma.PrismaClientKnownRequestError
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || StatusCodes[statusCode];
    error = new AppError(message, statusCode);
  }
  next(error);
};
