import dotenv from 'dotenv';
dotenv.config();

import swaggerAutogen from 'swagger-autogen';

import { BACKEND_SERVER_URL, NODE_ENV } from './env-variables';
import { version } from '../../package.json';

const doc = {
  info: {
    version,
    title: 'Social Media App',
    description: 'A social media app built with Node.js, Express, MongoDB, and TypeScript',
  },
  host: NODE_ENV === 'production' ? BACKEND_SERVER_URL : 'localhost:3000',
  basePath: '',
  schemes: NODE_ENV === 'production' ? ['https'] : ['http'],
  consumes: ['application/json', 'multipart/form-data'],
  produces: ['application/json'],
  tags: [
    {
      name: 'Auth',
      description: 'Authentication routes',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    '@schemas': {
      RegistrationRequest: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: "User's full name",
            example: '',
          },
          email: {
            type: 'string',
            format: 'email',
            description: "User's email address",
            example: '',
          },
          password: {
            type: 'string',
            format: 'password',
            description: "User's password",
            example: '',
          },
          confirmPassword: {
            type: 'string',
            format: 'password',
            description: 'Confirm password',
            example: '',
          },
          bio: {
            type: 'string',
            description: "User's bio",
            example: '',
          },
          profilePicture: {
            type: 'string',
            format: 'binary',
            description: '',
          },
        },
        required: ['name', 'email', 'password', 'confirmPassword', 'profilePicture'],
      },
      RegistrationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              bio: { type: 'string' },
              profilePicture: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              accessToken: { type: 'string' },
              expiresIn: { type: 'number' },
            },
          },
        },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: "User's email address",
            example: '',
          },
          password: {
            type: 'string',
            format: 'password',
            description: "User's password",
            example: '',
          },
        },
        required: ['email', 'password'],
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' },
              bio: { type: 'string' },
              profilePicture: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              accessToken: { type: 'string' },
              expiresIn: { type: 'number' },
            },
          },
        },
      },
      LogoutResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
      RefreshTokenResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              accessToken: { type: 'string' },
              expiresIn: { type: 'number' },
            },
          },
        },
      },
      ForgotPasswordRequest: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            format: 'email',
            description: "User's email address",
            example: '',
          },
          redirectUrl: {
            type: 'url',
            description: 'Redirect URL for password reset',
            example: '',
          },
        },
        required: ['email', 'redirectUrl'],
      },
      ForgotPasswordResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
      ResetPasswordRequest: {
        type: 'object',
        properties: {
          password: {
            type: 'string',
            format: 'password',
            description: "User's new password",
            example: '',
          },
          confirmPassword: {
            type: 'string',
            format: 'password',
            description: 'Confirm new password',
            example: '',
          },
        },
        required: ['password', 'confirmPassword'],
      },
      ResetPasswordResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
      BadRequestResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
      InternalServerErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
      UnauthorizedAccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
        },
      },
    },
    examples: {
      RegistrationResponse: {
        value: {
          success: true,
          message: 'Registration successful!',
          data: {
            id: '60d725b8b0d7c911b2f28f0c',
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'A short bio about me',
            profilePicture: 'https://example.com/profile.jpg',
            createdAt: '2023-06-22T10:00:00Z',
            updatedAt: '2023-06-22T10:00:00Z',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 3600,
          },
        },
      },
      LoginResponse: {
        value: {
          success: true,
          message: 'Login successful!',
          data: {
            id: '60d725b8b0d7c911b2f28f0c',
            name: 'John Doe',
            email: 'john@example.com',
            bio: 'A short bio about me',
            profilePicture: 'https://example.com/profile.jpg',
            createdAt: '2023-06-22T10:00:00Z',
            updatedAt: '2023-06-22T10:00:00Z',
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 3600,
          },
        },
      },
      LogoutResponse: {
        value: {
          success: true,
          message: 'Logout successful!',
          data: null,
        },
      },
      RefreshTokenResponse: {
        value: {
          success: true,
          message: 'Access token refreshed successfully!',
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            expiresIn: 3600,
          },
        },
      },
      ForgotPasswordResponse: {
        value: {
          success: true,
          message: 'Password reset email sent!',
          data: null,
        },
      },
      ResetPasswordResponse: {
        value: {
          success: true,
          message: 'Password reset successfully!',
          data: null,
        },
      },
      BadRequestResponse: {
        value: {
          success: false,
          message: 'Bad Request',
          data: null,
        },
      },
      InternalServerErrorResponse: {
        value: {
          success: false,
          message: 'Internal Server Error',
          data: null,
        },
      },
      UnauthorizedAccessResponse: {
        value: {
          success: false,
          message: 'Unauthorized access',
          data: null,
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  servers: [
    {
      url: BACKEND_SERVER_URL,
      description: NODE_ENV === 'production' ? 'Render server' : 'Local server',
    },
  ],
};

const outputFile = '../../swagger-output.json';
const routes = ['../../src/app.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
