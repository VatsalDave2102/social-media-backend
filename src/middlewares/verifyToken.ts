import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET_KEY,
  NODE_ENV,
  REFRESH_TOKEN_SECRET_KEY,
} from '../utils/env-variables';
import { AppError } from './errorHandler';

/**
 * Middleware to verify JWT tokens
 * @param {string} tokenType - Type of token to verify ('accessToken' or 'refreshToken')
 * @returns {Function} Express middleware function
 */
const verifyToken = (tokenType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract the token from the request headers/cookies
    const token = tokenType === 'accessToken' ? req.headers.authorization?.split(' ')[1] : req.cookies.refresh_token;
    if (!token) throw new AppError('Token is missing', StatusCodes.UNAUTHORIZED);

    try {
      // Verify the token using the secret key
      const SECRET_KEY =
        tokenType === 'accessToken' ? ACCESS_TOKEN_SECRET_KEY : REFRESH_TOKEN_SECRET_KEY;

      if (!SECRET_KEY) {
        if (NODE_ENV === 'development') {
          throw new AppError('SECRET_KEY is not defined', StatusCodes.INTERNAL_SERVER_ERROR);
        } else {
          throw new AppError('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
        }
      }

      // Decode the token to get the payload
      const decodedToken = jwt.verify(token, SECRET_KEY) as CustomJwtPayload;
      if (!decodedToken) throw new AppError('Invalid token', StatusCodes.UNAUTHORIZED);

      // Attach the decoded user information to the request object
      req.user = { userId: decodedToken.id, email: decodedToken.email };
      return next();
    } catch (error) {
      // Pass any errors to the error handling middleware
      next(error);
    }
  };
};

export default verifyToken;