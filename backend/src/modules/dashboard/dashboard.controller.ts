import { type Request, type Response } from "express";
import { DashboardService } from "./dashboard.service.ts";

export class DashboardController {
  static async getOverview(req: Request, res: Response) {
    try {
      const data = await DashboardService.getOverview();
      return res.status(200).json(data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || "Erro no servidor" });
    }
  }
}
