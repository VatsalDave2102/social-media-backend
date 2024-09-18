import jwt from 'jsonwebtoken';

// Represents the payload structure for JSON Web Tokens (JWT) in the application.
export type JwtUserPayload = {
  id: string;
  email: string;
};

export type TokenType = 'accessToken' | 'refreshToken';

// Types for the JWT verify callback function(declared based on the jwt.VerifyCallback type)
export type JwtVerifyCallbackDecoded = jwt.Jwt | jwt.JwtPayload | string | undefined;

export type JwtVerifyCallbackError = jwt.VerifyErrors | null;
