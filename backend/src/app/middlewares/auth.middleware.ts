    import jwt from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'

export interface AuthRequest extends Request {
  user: { id: string; empresaId: string; papel: string }
}


export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      empresaId: string;
      papel: string;
    };

    req.user = decoded; // sempre definido agora

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Sessão expirada. Faça login novamente." });
    }
    return res.status(401).json({ message: "Token inválido." });
  }
}


export type AuthenticatedRequest = AuthRequest;
