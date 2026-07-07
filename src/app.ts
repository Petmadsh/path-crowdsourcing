import express from "express";
import authRoutes from "./routes/authRoutes";
import modelRoutes from "./routes/modelRoutes";
import updateRequestRoutes from "./routes/updateRequestRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import createError from "http-errors";
import dotenv from "dotenv";

dotenv.config();

const app = express(); // Crea un'app Express
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/models", modelRoutes);
app.use("/updates", updateRequestRoutes);


app.use((req, res, next) => {
  next(createError.NotFound(`Route ${req.method} ${req.originalUrl} non trovata`));
});


app.use(errorMiddleware);

export default app;
