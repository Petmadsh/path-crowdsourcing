import { User } from "../models/User";
import createError from "http-errors";

export class UserRepository {
  async findById(id: number) {
    return User.findByPk(id);
  }

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async decreaseTokens(userId: number, amount: number) {
    const user = await User.findByPk(userId);
    if (!user) throw createError.NotFound("Utente non trovato");

    if (user.tokens < amount) {
     throw createError.Unauthorized("Non hai abbastanza token per completare questa operazione");
    }

    user.tokens -= amount;
    await user.save();
  }

  async addTokensByEmail(email: string, amount: number) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw createError.NotFound("Utente non trovato");
    }

    user.tokens += amount; 
    await user.save();
    return user;
  }
}