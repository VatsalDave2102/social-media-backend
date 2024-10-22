export const authSchemas = {
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
};
