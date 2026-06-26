import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PUBLIC_KEY, JWT_ALGORITHM } from "../config/jwt";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      error: "Missing Authorization header",
    });
  }

  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) {
    return res.status(401).json({
      error: "Invalid Authorization format",
    });
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
      return res.status(401).json({
        error: "Token expired",
      });
    }

    return res.status(401).json({
      error: "Invalid token",
    });
  }
}