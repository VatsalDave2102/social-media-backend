import jwt from 'jsonwebtoken';

// Represents the payload structure for JSON Web Tokens (JWT) in the application.
export type JwtUserPayload = {
  id: string;
  email: string;
};

export type TokenType = 'accessToken' | 'refreshToken';

export type JwtVerifyCallbackError = jwt.VerifyErrors | null;

export const isCustomJwtPayload = (data: any): data is CustomJwtPayload => {
  return 'id' in data && 'email' in data;
};
