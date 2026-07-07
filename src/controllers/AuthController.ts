import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import createError from "http-errors";


export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }; // Gestore per il login dell'utente


  refillTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, amount } = req.body;

      if (!email || amount === undefined || amount <= 0) {
        throw createError.BadRequest("Email e ammontare positivo obbligatori");
      }

      const updatedUser = await this.authService
      .getUserRepository().addTokensByEmail(email, Number(amount));

      res.json({
        message: `Ricarica completata con successo per ${email}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          tokens: updatedUser.tokens // Ritorna il nuovo saldo incrementato
        }
      });
    } catch (err) {
      next(err);
    }
  }; // Gestore per la ricarica dei token dell'utente
}