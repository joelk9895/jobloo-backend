// Extend the Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: import('./dto/user.dto').UserResponseDto;
    }
  }
}

export {};
