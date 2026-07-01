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
    throw createError.Unauthorized("mancante header di autorizzazione");
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    throw createError.Unauthorized("Formato di autorizzazione non valido");
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
      throw createError.Unauthorized("Token scaduto");
    }

    throw createError.Unauthorized("Token non valido");
  }
}