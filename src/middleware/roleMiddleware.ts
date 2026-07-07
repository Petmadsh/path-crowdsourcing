import { Request, Response, NextFunction } from "express";
import createError from "http-errors";


export function roleMiddleware(requiredRole: string) { // Middleware per la verifica del ruolo dell'utente
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role !== requiredRole) {
      throw createError.Forbidden("Accesso negato: ruolo non autorizzato");
    }
    next();
  };
}
