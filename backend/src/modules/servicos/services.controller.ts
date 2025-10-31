import { type Request, type Response } from "express";
import { ServiceService } from "./services.service";
import {
  type CreateServiceDto,
  type UpdateServiceDto,
} from "./services.dto";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

const serviceService = new ServiceService();

export class ServiceController {
  async create(req: AuthenticatedRequest, res: Response) {
    const { empresaId } = req.user!;
    const service = await serviceService.create(
      req.body as CreateServiceDto,
      empresaId
    );
    res.status(201).json(service);
  }

  async getAll(req: AuthenticatedRequest, res: Response) {
    const { empresaId } = req.user!;
    console.log("Empresa ID no getAll:", empresaId);
    const result = await serviceService.getAll(empresaId);
    res.status(200).json(result);
  }

  async getById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { empresaId } = req.user!;
    const service = await serviceService.getById(id as string, empresaId);
    res.status(200).json(service);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { empresaId } = req.user!;

    try {
      const service = await serviceService.update(
        id as string,
        req.body as UpdateServiceDto,
        empresaId
      );
      res.status(200).json(service);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const { empresaId } = req.user!;
    await serviceService.delete(id as string, empresaId);
    res.status(204).send();
  }
}
