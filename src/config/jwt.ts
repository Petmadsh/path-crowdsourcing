import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import type { Algorithm, SignOptions } from "jsonwebtoken";

dotenv.config();

function loadKeyFromFile(envVar: string): string {
  const filePath = process.env[envVar];

  if (!filePath) {
    throw new Error(`Missing ${envVar} in .env`);
  }

  const resolved = path.resolve(filePath);

  if (!fs.existsSync(resolved)) {
    throw new Error(`Key file not found: ${resolved}`);
  }

  return fs.readFileSync(resolved, "utf8");
}

export const PRIVATE_KEY = loadKeyFromFile("JWT_PRIVATE_KEY");
export const PUBLIC_KEY = loadKeyFromFile("JWT_PUBLIC_KEY");

export const JWT_ALGORITHM: Algorithm =
  (process.env.JWT_ALGORITHM as Algorithm) ?? "RS256";

export const JWT_EXPIRES_IN =
  (process.env.JWT_EXPIRES_IN ?? "24h") as NonNullable<
    SignOptions["expiresIn"]
  >;