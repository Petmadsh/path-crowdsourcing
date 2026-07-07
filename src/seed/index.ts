import { sequelize } from "../config/database";
import { seedUsers } from "./users.seed";
import { seedModels } from "./models.seed";
import { seedUpdates } from "./updates.seed";

async function runSeed() { // Funzione principale per eseguire il seeding del database
  try {
    console.log("Reset database...");
    await sequelize.sync({ force: true });

    console.log("Seeding users...");
    const users = await seedUsers();

    console.log("Seeding models...");
    const models = await seedModels(users);

    console.log("Seeding update requests...");
    await seedUpdates(models, users);

    console.log("Seed completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

runSeed();
