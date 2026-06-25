import express from "express";
import { sequelize } from "./config/database";

const app = express();
app.use(express.json());

// TODO: qui monterai le routes

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // per sviluppo va bene

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server:", err);
  }

}

start();
