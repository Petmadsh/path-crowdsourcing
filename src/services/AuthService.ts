import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/UserRepository";
import {
  PRIVATE_KEY,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN,
} from "../config/jwt";

export class AuthService {

getUserRepository() {
  return this.userRepo;
}

  
  constructor(private userRepo: UserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      throw new Error("Invalid credentials");
    }

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, PRIVATE_KEY, {
      algorithm: JWT_ALGORITHM,
      expiresIn: JWT_EXPIRES_IN,
    });

    return {
      token,
      user,
    };
  }
}