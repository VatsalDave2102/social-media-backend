import jwt from 'jsonwebtoken';
import { JwtUserPayload } from '../types/auth.types';
import {
  ACCESS_TOKEN_SECRET_KEY,
  NODE_ENV,
  REFRESH_TOKEN_SECRET_KEY,
  RESET_PASSWORD_SECRET_KEY,
} from './env-variables';
import { AppError } from '../middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';

/**
 * Generates an access token for the given user
 * @param {JwtUserPayload} user - User payload for JWT
 * @returns {Object} Object containing access token and expiration time
 */
const generateAccessToken = (user: JwtUserPayload) => {
  const accessTokenSecretKey = ACCESS_TOKEN_SECRET_KEY;
  const accessTokenExpiryDuration = 60 * 60; // 1 hour in seconds

  if (!accessTokenSecretKey) {
    const errorMessage =
      NODE_ENV === 'development'
        ? 'ACCESS TOKEN SECRET KEY is not defined'
        : 'Internal Server Error';
    throw new AppError(errorMessage, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const access_token = jwt.sign(
    user,
    accessTokenSecretKey,
    { expiresIn: accessTokenExpiryDuration }, // Access token expires in 1 hour
  );

  return { access_token, expires_in: accessTokenExpiryDuration };
};

/**
 * Generates a refresh token for the given user
 * @param {JwtUserPayload} user - User payload for JWT
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user: JwtUserPayload) => {
  const refreshTokenSecretKey = REFRESH_TOKEN_SECRET_KEY;
  const refreshTokenExpiryDuration = 60 * 60 * 24 * 7; // 7 days in seconds

  if (!refreshTokenSecretKey) {
    const errorMessage =
      NODE_ENV === 'development'
        ? 'REFRESH TOKEN SECRET KEY is not defined'
        : 'Internal Server Error';
    throw new AppError(errorMessage, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const refresh_token = jwt.sign(
    user,
    refreshTokenSecretKey,
    { expiresIn: refreshTokenExpiryDuration }, // Refresh token expires in 7 days
  );

  return { refresh_token, refreshTokenExpiryDuration };
};

/**
 * Generates a reset password token for the given user
 * @param {JwtUserPayload} user - User payload for JWT
 * @returns {string} Reset password token
 */
const generateResetPasswordToken = (user: JwtUserPayload) => {
  const resetPasswordSecretKey = RESET_PASSWORD_SECRET_KEY;
  const resetPasswordExpiryDuration = 60 * 15; // 15 minutes in seconds

  if (!resetPasswordSecretKey) {
    const errorMessage =
      NODE_ENV === 'development'
        ? 'RESET PASSWORD SECRET KEY is not defined'
        : 'Internal Server Error';
    throw new AppError(errorMessage, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  const reset_password_token = jwt.sign(
    user,
    resetPasswordSecretKey,
    { expiresIn: resetPasswordExpiryDuration }, // Reset password token expires in 15 minutes
  );

  return { reset_password_token };
};

const verifyResetPasswordToken = (token: string) => {
  const resetPasswordSecretKey = RESET_PASSWORD_SECRET_KEY;

  if (!resetPasswordSecretKey) {
    const errorMessage =
      NODE_ENV === 'development'
        ? 'RESET PASSWORD SECRET KEY is not defined'
        : 'Internal Server Error';
    throw new AppError(errorMessage, StatusCodes.INTERNAL_SERVER_ERROR);
  }

  try {
    // Decode the token to get the payload
    const decodedToken = jwt.verify(token, resetPasswordSecretKey) as CustomJwtPayload;
    if (!decodedToken) throw new AppError('Invalid token', StatusCodes.UNAUTHORIZED);

    // Return the decoded token
    return decodedToken;
  } catch (error) {
    throw new AppError('Invalid token', StatusCodes.UNAUTHORIZED);
  }
};

export {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  verifyResetPasswordToken,
};