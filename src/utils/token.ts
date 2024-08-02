import jwt from 'jsonwebtoken';
import { JwtUserPayload } from '../types/auth.types';
import { ACCESS_TOKEN_SECRET_KEY, REFRESH_TOKEN_SECRET_KEY } from './env-variables';
import { AppError } from '../middlewares/errorHandler';
import { StatusCodes } from 'http-status-codes';
/**
 * Generates an access token for the given user
 * @param {JwtUserPayload} user - User payload for JWT
 * @returns {Object} Object containing access token and expiration time
 */
const generateAccessToken = (user: JwtUserPayload) => {
  const accessTokenSecretKey = ACCESS_TOKEN_SECRET_KEY;
  // TODO: Update expiration time to 1 hour
  const accessTokenExpiryDuration = 60 * 1; // 1 minute (for testing)
  if (!accessTokenSecretKey) {
    throw new AppError('ACCESS TOKEN SECRET KEY is not defined', StatusCodes.INTERNAL_SERVER_ERROR);
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
    throw new AppError(
      'REFRESH TOKEN SECRET KEY is not defined',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  }

  const refresh_token = jwt.sign(
    user,
    refreshTokenSecretKey,
    { expiresIn: refreshTokenExpiryDuration }, // Refresh token expires in 7 days
  );

  return { refresh_token, refreshTokenExpiryDuration };
};

export { generateAccessToken, generateRefreshToken };
