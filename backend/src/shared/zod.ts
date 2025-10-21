// shared/zod.ts
import { ZodError, type ZodTypeAny } from "zod";
import { type Request, type Response, type NextFunction } from "express";

export const validateBody = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("❌ Erro de validação Zod:", error.issues);
        return res.status(400).json({
          status: "error",
          message: "Erro de validação nos dados enviados.",
          errors: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        });
      }
      return res.status(500).json({
        status: "error",
        message: "Erro interno do servidor.",
      });
    }
  };
};
