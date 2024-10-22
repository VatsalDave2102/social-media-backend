export const authExamples = {
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
        expiresIn: 3600
      }
    }
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
        expiresIn: 3600
      }
    }
  },
  LogoutResponse: {
    value: {
      success: true,
      message: 'Logout successful!',
      data: null
    }
  },
  RefreshTokenResponse: {
    value: {
      success: true,
      message: 'Access token refreshed successfully!',
      data: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600
      }
    }
  },
  ForgotPasswordResponse: {
    value: {
      success: true,
      message: 'Password reset email sent!',
      data: null
    }
  },
  ResetPasswordResponse: {
    value: {
      success: true,
      message: 'Password reset successfully!',
      data: null
    }
  }
};
