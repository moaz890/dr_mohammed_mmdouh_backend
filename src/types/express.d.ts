// Augment Express's Request interface to include req.user
// Why: TypeScript doesn't know about req.user by default.
// Without this, every file that uses req.user would need a type cast.
// By declaring it here once, it's available everywhere automatically.
declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: string;
    };
  }
}
