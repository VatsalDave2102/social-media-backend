import { Request, Response } from 'express';
import logger from '../utils/logger';

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
      status: 'error',
      message: err.message,
    });
  }

  logger.error(err.stack);

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
};

export { AppError, errorHandler };
