import { type Request, type Response } from "express";
import { loginService } from "./auth.service.ts";

export const loginController = async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const result = await loginService({ email, senha });
  res.status(200).json(result);
};