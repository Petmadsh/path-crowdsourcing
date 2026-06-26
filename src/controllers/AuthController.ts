import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";

export class AuthController {
  constructor(private authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };

  /**
   * NUOVO METODO: Gestisce l'endpoint di ricarica accessibile solo all'Admin.
   * Aspetta nel body: { "email": "utente@esempio.com", "amount": 50 }
   */
  refillTokens = async (req: Request, res: Response) => {
    try {
      const { email, amount } = req.body;

      if (!email || amount === undefined || amount <= 0) {
        return res.status(400).json({ error: "Email e ammontare positivo obbligatori" });
      }

      // Interfacciamento diretto con il UserRepository aggiornato
      const updatedUser = await this.authService.getUserRepository().addTokensByEmail(email, Number(amount));

      res.json({
        message: `Ricarica completata con successo per ${email}`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          tokens: updatedUser.tokens // Ritorna il nuovo saldo incrementato
        }
      });
    } catch (err: any) {
      res.status(err.status || 400).json({ error: err.message });
    }
  };
}