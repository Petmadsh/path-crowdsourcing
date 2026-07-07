import { Sequelize } from "sequelize";
import path from "path";

const storagePath = path.join(process.cwd(), "data", "database.sqlite"); 

// Creazione di un'istanza di Sequelize per connettersi al database SQLite
export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false,
});