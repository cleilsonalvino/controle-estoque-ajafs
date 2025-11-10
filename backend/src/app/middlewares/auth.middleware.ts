    import jwt from 'jsonwebtoken'
import { type Request, type Response, type NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: { id: string; empresaId: string; papel: string }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' })

  const [, token] = authHeader.split(' ')

  if (token) {
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; empresaId: string; papel: string };
  req.user = decoded;
  next();
} catch (error: any) {
  if (error.name === "TokenExpiredError") {
    console.warn("Token expirado:", error.expiredAt);
    return res.status(401).json({ message: "Sessão expirada. Faça login novamente." });
  }

  console.error("Falha na autenticação:", error.message);
  return res.status(401).json({ message: "Token inválido." });
}

  } else {
    return res.status(401).json({ message: 'Token malformado' })
  }
}

export type AuthenticatedRequest = AuthRequest;
