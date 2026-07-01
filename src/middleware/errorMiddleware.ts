import { Request, Response, NextFunction } from "express";
import { HttpError } from "http-errors";


export function errorMiddleware(
  err: HttpError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = (err as HttpError).status || (err as HttpError).statusCode || 500;
  const message = err.message || "Internal server error";

  console.error("Error:", err);

  res.status(status).json({ error: message });
}
