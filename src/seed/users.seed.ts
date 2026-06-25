import { User } from "../models/User";
import bcrypt from "bcrypt";

export async function seedUsers() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await User.create({
    email: "admin@example.com",
    passwordHash: password,
    role: "admin",
    tokens: 9999
  });

  const user1 = await User.create({
    email: "user1@example.com",
    passwordHash: password,
    role: "user",
    tokens: 200
  });

  const user2 = await User.create({
    email: "user2@example.com",
    passwordHash: password,
    role: "user",
    tokens: 150
  });

  return { admin, user1, user2 };
}
