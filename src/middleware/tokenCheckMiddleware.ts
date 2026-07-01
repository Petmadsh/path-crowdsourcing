import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";
import createError from "http-errors";

const userRepo = new UserRepository();

export async function tokenCheckMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await userRepo.findById(req.user.id);
  if (!user) {
    throw createError.Unauthorized("Utente non trovato");
  }

  if (user.tokens <= 0) {
    throw createError.Unauthorized("Token esauriti. Non puoi completare questa operazione");
  }

  next();
}