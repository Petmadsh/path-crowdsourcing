import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import {
  PRIVATE_KEY,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} from "../config/jwt";
import createError from "http-errors";


export class AuthService { // Servizio per l'autenticazione degli utenti
  constructor(private userRepo: UserRepository) {}

  getUserRepository() {
    return this.userRepo;
  }

  async login(email: string, password: string) { // Metodo per il login dell'utente, verifica le credenziali e genera un token JWT
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw createError.Unauthorized("Credenziali non valide");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw createError.Unauthorized("Credenziali non valide");
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: JWT_ALGORITHM,
      expiresIn: JWT_EXPIRES_IN,
    });

    return { token, user };
  }
}