import app from "./app";
import { sequelize } from "./config/database";
import dotenv from "dotenv";

dotenv.config();

// Gestione dinamica della porta
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // 1. Autentica e sincronizza il database SQLite prima di accettare richieste
    console.log("Connecting to the database...");
    await sequelize.authenticate();
    await sequelize.sync(); // Crea le tabelle se non esistono
    console.log("Database synchronized successfully.");

    // 2. Avvia l'applicazione Express configurata in app.ts
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server due to database error:", err);
    process.exit(1); // Chiude l'applicazione in caso di errore critico
  }
}

start();