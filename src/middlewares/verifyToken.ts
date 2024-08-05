import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } from '../utils/env-variables';

const verifyToken = (tokenType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Extract the token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'No token provided',
        data: null,
      });
    }

    try {
      // Verify the token using the secret key
      const SECRET_KEY =
        tokenType === 'accessToken' ? ACCESS_TOKEN_SECRET_KEY : REFRESH_TOKEN_SECRET_KEY;
      if (!SECRET_KEY) throw new Error('SECRET_KEY is not defined');

      jwt.verify(token, SECRET_KEY);
      return next();
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token',
        data: null,
      });
    }
  };
};

export default verifyToken;
