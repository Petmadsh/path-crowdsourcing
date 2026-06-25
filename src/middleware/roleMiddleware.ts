import { Request, Response, NextFunction } from "express";

export function roleMiddleware(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }
    next();
  };
}
