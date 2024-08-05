import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { generateAccessToken, generateRefreshToken } from '../utils/token';
import { AppError } from '../middlewares/errorHandler';
import cloudinary from '../config/cloudinary';
import { NODE_ENV } from '../utils/env-variables';

/**
 * Register a new user
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next middleware function
 * @returns {Promise<void>}
 */
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user data from request body
    const { name, email, password, bio } = req.body;

    // Extract file from request
    const profilePicture = req.file;
    if (!profilePicture) throw new AppError('Profile picture is required', StatusCodes.BAD_REQUEST);

    // Check if the email is already in use
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AppError('Email already in use', StatusCodes.BAD_REQUEST);

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload the user's profile picture to Cloudinary
    const uploadedProfilePicture = await cloudinary.uploader.upload(profilePicture.path, {
      folder: 'profile_images',
    });
    if (!uploadedProfilePicture) {
      throw new AppError('Error uploading profile picture', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    // Create a new user and save to the database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        bio,
        profilePicture: uploadedProfilePicture.secure_url,
      },
    });

    // If the user was not created, throw an error
    if (!newUser) throw new AppError('Error registering user', StatusCodes.INTERNAL_SERVER_ERROR);

    // Create a payload for the access token and refresh token
    const userPayload = { id: newUser.id, email: newUser.email };
    const { access_token, expires_in } = generateAccessToken(userPayload);
    const { refresh_token, refreshTokenExpiryDuration } = generateRefreshToken(userPayload);

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: refreshTokenExpiryDuration,
    });

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Registration successful!',
      data: { user: newUser, access_token, expires_in },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Login a user
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<void>}
 */
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user data from request body
    const { email, password } = req.body;

    // Check if the user exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser) throw new AppError('User does not exist!', StatusCodes.BAD_REQUEST);

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) throw new AppError('Incorrect password!', StatusCodes.BAD_REQUEST);

    // Create a payload for the access token and refresh token
    const userPayload = { id: existingUser.id, email: existingUser.email };
    const { access_token, expires_in } = generateAccessToken(userPayload);
    const { refresh_token, refreshTokenExpiryDuration } = generateRefreshToken(userPayload);

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: refreshTokenExpiryDuration,
    });

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful!',
      data: { user: existingUser, access_token, expires_in },
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Logout a user
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<void>}
 */
const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete the refresh token cookie
    res.clearCookie('refresh_token');

    // Respond with success message
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout successful!',
      data: null,
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { register, login, logout };
