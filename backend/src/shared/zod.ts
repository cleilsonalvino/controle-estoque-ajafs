import { type Request, type Response, type NextFunction } from 'express';
import { ZodError, z } from 'zod';

export const validate = (schema: z.AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(
          error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          }))
        );
      }
      // Pode-se adicionar um tratamento para outros tipos de erro aqui
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};