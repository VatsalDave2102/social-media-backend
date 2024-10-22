import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import {
  ACCESS_TOKEN_SECRET_KEY,
  NODE_ENV,
  REFRESH_TOKEN_SECRET_KEY
} from '../utils/env-variables';
import { JwtVerifyCallbackError, TokenType, isCustomJwtPayload } from '../types/auth.types';
import { AppError } from './errorHandler';

/**
 * Middleware to verify JWT tokens
 * @param {string} tokenType - Type of token to verify ('accessToken' or 'refreshToken')
 * @returns {Function} Express middleware function
 */
const verifyToken = (tokenType: TokenType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the token from the request headers/cookies
      const token =
        tokenType === 'accessToken'
          ? req.headers.authorization?.split(' ')[1]
          : req.cookies.refreshToken;
      if (!token) throw new AppError('Token is missing', StatusCodes.UNAUTHORIZED);

      // Verify the token using the secret key
      const SECRET_KEY =
        tokenType === 'accessToken' ? ACCESS_TOKEN_SECRET_KEY : REFRESH_TOKEN_SECRET_KEY;

      if (!SECRET_KEY) {
        const errorMessage =
          NODE_ENV === 'development' ? 'SECRET_KEY is not defined' : 'Internal Server Error';
        throw new AppError(errorMessage, StatusCodes.INTERNAL_SERVER_ERROR);
      }

      // Decode the token to get the payload
      jwt.verify(token, SECRET_KEY, (err: JwtVerifyCallbackError, decoded: unknown) => {
        if (err) throw new AppError('Invalid token', StatusCodes.UNAUTHORIZED);

        // Verify if the decoded token matches with Custom JWT payload
        if (isCustomJwtPayload(decoded)) {
          // Attach the decoded user information to the object
          req.user = { userId: decoded.id, email: decoded.email };
        } else throw new AppError('Invalid token', StatusCodes.UNAUTHORIZED);
      });
      return next();
    } catch (error) {
      // Pass any errors to the error handling middleware
      next(error);
    }
  };
};

export default verifyToken;
