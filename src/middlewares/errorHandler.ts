import { ErrorRequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

import { NODE_ENV } from '../utils/env-variables';
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

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || StatusCodes[statusCode];

  const response = {
    success: false,
    message,
    data: null,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  };

  if (NODE_ENV === 'development') {
    logger.error(err);
  } else {
    logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  }

  res.status(statusCode).json(response);
};

export { AppError, errorHandler };
