import { Request, Response } from 'express';
import logger from '../utils/logger';
import { StatusCodes } from 'http-status-codes';

class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err: Error, req: Request, res: Response) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  logger.error(err.stack);

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Internal server error',
    data: null,
  });
};

export { AppError, errorHandler };
