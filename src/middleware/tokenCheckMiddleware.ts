import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";

const userRepo = new UserRepository();

export async function tokenCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await userRepo.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.tokens <= 0) {
    return res.status(401).json({ error: "Unauthorized: tokens finished" });
  }

  next();
}
