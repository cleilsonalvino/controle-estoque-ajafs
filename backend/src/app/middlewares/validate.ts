
import { type Request, type Response, type NextFunction } from 'express';
import { type AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    console.log(req.body);
    res.status(400).json(error);
  }
};
