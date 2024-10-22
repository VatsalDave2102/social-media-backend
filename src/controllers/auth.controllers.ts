import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';

import {
  generateAccessToken,
  generateRefreshToken,
  generateResetPasswordToken,
  verifyResetPasswordToken
} from '../utils/token';
import { AppError } from '../middlewares/errorHandler';
import { NODE_ENV } from '../utils/env-variables';
import cloudinary from '../config/cloudinary';
import prisma from '../config/db';
import { sendEmail } from '../utils/email';

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
      folder: 'profile_images'
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
        profilePicture: uploadedProfilePicture.secure_url
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // If the user was not created, throw an error
    if (!newUser) throw new AppError('Error registering user', StatusCodes.INTERNAL_SERVER_ERROR);

    // Create a payload for the access token and refresh token
    const userPayload = { id: newUser.id, email: newUser.email };
    const { accessToken, expiresIn } = generateAccessToken(userPayload);
    const { refreshToken, refreshTokenExpiryDuration } = generateRefreshToken(userPayload);

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: refreshTokenExpiryDuration
    });

    // Respond with success message and data
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Registration successful!',
      data: { ...newUser, accessToken, expiresIn }
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
    const existingUser = await prisma.user.findUnique({
      where: { email, isDeleted: false },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        password: true
      }
    });

    if (!existingUser) throw new AppError('User does not exist!', StatusCodes.BAD_REQUEST);

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) throw new AppError('Incorrect password!', StatusCodes.BAD_REQUEST);

    // Create a payload for the access token and refresh token
    const userPayload = { id: existingUser.id, email: existingUser.email };
    const { accessToken, expiresIn } = generateAccessToken(userPayload);
    const { refreshToken, refreshTokenExpiryDuration } = generateRefreshToken(userPayload);

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict',
      maxAge: refreshTokenExpiryDuration
    });

    // Exclude the password from the user object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = existingUser;

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login successful!',
      data: { ...userWithoutPassword, accessToken, expiresIn }
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
    res.clearCookie('refreshToken');

    // Respond with success message
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout successful!',
      data: null
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Generate a new access token using a refresh token
 * @param req Express request object
 * @param res Express response object
 * @param next Express next middleware function
 * @returns {Promise<void>}
 */
const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user data from request body
    const { userId, email } = req.user;

    // Create a payload for the access token
    const userPayload = { id: userId, email: email };
    const { accessToken, expiresIn } = generateAccessToken(userPayload);

    // Respond with success message and data
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Access token refreshed successfully!',
      data: { accessToken, expiresIn }
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Send a password reset email to the user
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<void>}
 */
const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract user email from request body
    const { email } = req.body;

    // Extract the redirectUrl from the request body
    const { redirectUrl } = req.body;

    // Check if the user exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email, isDeleted: false } });
    if (!existingUser) throw new AppError('User does not exist!', StatusCodes.BAD_REQUEST);

    // Create a payload for the reset password token
    const userPayload = { id: existingUser.id, email: existingUser.email };
    const { resetPasswordToken } = generateResetPasswordToken(userPayload);

    // Create a reset password URL with the reset password token
    const resetPasswordUrl = `${redirectUrl}?token=${resetPasswordToken}`;

    // Construct the email Subject and Body
    const emailSubject = 'Reset your password';
    const emailBody = `
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetPasswordUrl}">Reset Password</a>
    <p>If you didn't request this, please ignore this email.</p>
  `;

    // Send the email to the user
    await sendEmail(email, emailSubject, emailBody);

    // Respond with success message
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset email sent!',
      data: null
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

/**
 * Reset a user's password
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 * @returns {Promise<void>}
 */
const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract password from request body
    const { password } = req.body;

    // Extract reset password token from request query
    const { token } = req.query;

    // Verify the reset password token
    if (typeof token !== 'string') {
      throw new AppError('Invalid token', StatusCodes.BAD_REQUEST);
    }
    const decodedToken = verifyResetPasswordToken(token);

    // Extract user id and email from decoded token
    const { id, email } = decodedToken;

    // Check if the user exists in the database
    const existingUser = await prisma.user.findUnique({ where: { id, email, isDeleted: false } });
    if (!existingUser) throw new AppError('User does not exist!', StatusCodes.BAD_REQUEST);

    // Hash the user's new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // Respond with success message
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset successfully!',
      data: null
    });
  } catch (error) {
    // Pass any errors to the error handling middleware
    next(error);
  }
};

export { forgotPassword, login, logout, refreshToken, register, resetPassword };
