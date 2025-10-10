import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../../shared/errors.ts";

interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

// Extendendo a interface Request para incluir userId
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new AppError("Token não fornecido", 401);
  }

  const [token] = authorization.split(" ");

  try {
    const data = jwt.verify(token as string, process.env.JWT_SECRET ?? "secret") as jwt.JwtPayload;
    const { id } = data as TokenPayload;
    req.userId = id;
    return next();
  } catch {
    throw new AppError("Token inválido", 401);
  }
};
