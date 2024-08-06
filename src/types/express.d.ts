declare namespace Express {
  interface Request {
    user: { userId: string; email: string };
  }
}

// Define a custom interface for the JWT payload
interface CustomJwtPayload extends jwt.JwtPayload {
  id: string;
  email: string;
}
