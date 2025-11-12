import { Request, Response } from "express";
import { CreateCobrancaService } from "../services/create-cobranca.service";
import { CreateCobrancaSchema } from "../dtos/create-cobranca.dto";

export class CobrancaController {
  async create(req: Request, res: Response) {
    try {
      const parsed = CreateCobrancaSchema.parse(req.body);
      const service = new CreateCobrancaService();
      const result = await service.execute(parsed);

      return res.status(201).json(result);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({
        error: error?.issues || error?.response?.data || error?.message,
      });
    }
  }
}
