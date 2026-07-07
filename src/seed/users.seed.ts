import { User } from "../models/User";
import bcrypt from "bcrypt";

export async function seedUsers() { // Funzione per eseguire il seeding degli utenti User nel database
  const password = await bcrypt.hash("password123", 10);

  const admin = await User.create({ // Creazione di un utente amministratore
    email: "admin@example.com",
    passwordHash: password,
    role: "admin"
  });

  const user1 = await User.create({ // Creazione di un utente normale
    email: "user1@example.com",
    passwordHash: password,
    role: "user",
    tokens: 3
  });

  const user2 = await User.create({
    email: "user2@example.com",
    passwordHash: password,
    role: "user",
    tokens: 5
  });

  return { admin, user1, user2 };
}
