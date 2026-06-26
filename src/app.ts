import express from "express";
import authRoutes from "./routes/authRoutes";
import modelRoutes from "./routes/modelRoutes";
import updateRequestRoutes from "./routes/updateRequestRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/models", modelRoutes);
app.use("/updates", updateRequestRoutes);

app.use(errorMiddleware);

export default app;
