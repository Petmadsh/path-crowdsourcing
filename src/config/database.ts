import { Sequelize } from "sequelize";

const storagePath = "/app/data/database.sqlite";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: storagePath,
  logging: false,
});