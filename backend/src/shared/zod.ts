import type { NextFunction } from 'express';
import { z } from 'zod';

export const validate =
  (schema: z.ZodObject<any, any>) =>
  async (req: any, res: Response, next: NextFunction) => {
    try { 
      const parsedBody = await schema.parseAsync(req.body);
      req.body = parsedBody; // Atribui o corpo validado de volta ao req.body
      next(); // Chama next() sem argumentos para continuar para o próximo middleware/rota
    } catch (error: any) {
      return console.log(error); 
    }
  };
