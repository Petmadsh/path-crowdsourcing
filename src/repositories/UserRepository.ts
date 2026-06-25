import { User } from "../models/User";

export class UserRepository {
  async findById(id: number) {
    return User.findByPk(id);
  }

  async findByEmail(email: string) {
    return User.findOne({ where: { email } });
  }

  async create(data: Partial<User>) {
    return User.create(data as any);
  }

  async updateTokens(userId: number, newAmount: number) {
    return User.update(
      { tokens: newAmount },
      { where: { id: userId } }
    );
  }

  async decreaseTokens(userId: number, amount: number) {
    const user = await this.findById(userId);
    if (!user) return null;

    user.tokens -= amount;
    await user.save();
    return user;
  }
}
