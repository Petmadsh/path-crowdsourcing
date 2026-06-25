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
}
