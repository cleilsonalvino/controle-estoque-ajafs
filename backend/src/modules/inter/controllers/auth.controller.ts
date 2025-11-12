import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  async gerarToken(_: Request, res: Response) {
    try {
      const service = new AuthService();
      const token = await service.getAccessToken();

      return res.status(200).json({ access_token: token });
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Erro ao autenticar com Banco Inter",
      });
    }
  }
}
