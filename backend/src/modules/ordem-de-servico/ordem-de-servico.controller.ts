import { Response } from "express";
import { OrdemDeServicoService } from "./ordem-de-servico.service";
import { AuthenticatedRequest } from "app/middlewares/auth.middleware";
import { CustomError } from "@shared/errors";
import { CreateOrdemDeServicoSchema } from "./ordem-de-servico.dto";
import { Console } from "console";

const ordemDeServicoService = new OrdemDeServicoService();

export class OrdemDeServicoController {
  async findAll(req: AuthenticatedRequest, res: Response) {
    const empresaId = req.user!.empresaId;

    const ordens = await ordemDeServicoService.findAll(empresaId, req.query);
    return res.json(ordens);
  }

  async findOne(req: AuthenticatedRequest, res: Response) {
    const empresaId = req.user!.empresaId;

    const ordem = await ordemDeServicoService.findOne(req.params.id, empresaId);
    if (!ordem) throw new CustomError("Ordem não encontrada", 404);

    return res.json(ordem);
  }

  async create(req: AuthenticatedRequest, res: Response) {

    console.log("Requisição de criação de ordem de serviço recebida:", req.body);

    const empresaId = req.user!.empresaId;

    const data = CreateOrdemDeServicoSchema.parse(req.body);

    const ordem = await ordemDeServicoService.create(data, empresaId);

    return res.status(201).json(ordem);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const empresaId = req.user!.empresaId;

    const updated = await ordemDeServicoService.update(
      req.params.id,
      req.body,
      empresaId
    );

    return res.json(updated);
  }

  async delete(req: AuthenticatedRequest, res: Response) {
    const empresaId = req.user!.empresaId;

    await ordemDeServicoService.delete(req.params.id, empresaId);

    return res.status(204).send();
  }
}
