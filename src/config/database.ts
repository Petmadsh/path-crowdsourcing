import { Sequelize } from "sequelize";
import path from "path";

const storagePath = path.join(process.cwd(), "data", "database.sqlite");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false,
});