import { User } from "../models/User";

export class UserRepository {
  async findById(id: number) {
    return User.findByPk(id);
  }

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async decreaseTokens(userId: number, amount: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    if (user.tokens < amount) {
      const err: any = new Error("Not enough tokens");
      err.status = 401;
      throw err;
    }

    user.tokens -= amount;
    await user.save();
  }

  async setTokensByEmail(email: string, tokens: number) {
    const user = await this.findByEmail(email);
    if (!user) throw new Error("User not found");

    user.tokens = tokens;
    await user.save();
    return user;
  }
}
