import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/UserRepository";
import createError from "http-errors";

const userRepo = new UserRepository();

export async function tokenCheckMiddleware( // Middleware per la verifica dei token dell'utente
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await userRepo.findById(req.user.id);
  if (!user) {
    return next(createError.NotFound("Utente non trovato"));
  }

  if (user.tokens <= 0) {
    return next(createError.Unauthorized("Token esauriti."));
  }

  next();
}