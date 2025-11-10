import { type Request, type Response } from "express";
import { loginService, getUserDataFromToken } from "./auth.service";

export const loginController = async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  const result = await loginService({ email, senha });
  res.status(200).json(result);
};

export const loginMeController = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token de autenticação ausente" });
    }

    const token = authHeader.split(" ")[1];
    const userData = await getUserDataFromToken(token as string);

    res.status(200).json({
      message: "Usuário autenticado com sucesso",
      user: userData,
    });
  } catch (error: any) {
    console.error("Erro interno em /auth/me:", error);
    res.status(error.statusCode || error.status || 500).json({ message: error.message });

  }
};
