import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PUBLIC_KEY, JWT_ALGORITHM } from "../config/jwt";
import createError from "http-errors";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return next(createError.Unauthorized("mancante header di autorizzazione"));
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return next(createError.Unauthorized("Formato di autorizzazione non valido"));
  }

  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, {
      algorithms: [JWT_ALGORITHM],
    }) as {
      id: number;
      role: string;
    };

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      return next(createError.Unauthorized("Token scaduto"));
    }
    return next(createError.Unauthorized("Token non valido"));
  }
}