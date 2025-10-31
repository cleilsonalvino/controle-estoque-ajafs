import { type Request, type Response } from "express";
import { DashboardService } from "./dashboard.service.ts";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware.ts";

export class DashboardController {
  static async getOverview(req: AuthenticatedRequest, res: Response) {
    try {
      const { empresaId } = req.user!;
      const data = await DashboardService.getOverview(empresaId);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error(error);
      return res
        .status(500)
        .json({ error: error.message || "Erro no servidor" });
    }
  }
}
