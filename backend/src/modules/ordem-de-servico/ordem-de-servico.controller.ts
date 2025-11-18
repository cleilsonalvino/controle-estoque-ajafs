
import { Request, Response } from 'express';
import { OrdemDeServicoService } from './ordem-de-servico.service';
import { CustomError } from '@shared/errors';
import { AuthenticatedRequest } from 'app/middlewares/auth.middleware';

const ordemDeServicoService = new OrdemDeServicoService();

export class OrdemDeServicoController {
  async findAll(req: AuthenticatedRequest, res: Response) {
    const empresaId = req.user!.empresaId;
    if (!empresaId) {
      throw new CustomError('ID da empresa não encontrado no token.', 401);
    }
    const ordens = await ordemDeServicoService.findAll(empresaId, req.query);
    return res.json(ordens);
  }

  async findOne(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const empresaId = req.user!.empresaId;
    if (!empresaId) {
      throw new CustomError('ID da empresa não encontrado no token.', 401);
    }
    const ordem = await ordemDeServicoService.findOne(id, empresaId);
    if (!ordem) {
      throw new CustomError('Ordem de serviço não encontrada.', 404);
    }
    return res.json(ordem);
  }

  async update(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const empresaId = req.user!.empresaId;
    if (!empresaId) {
      throw new CustomError('ID da empresa não encontrado no token.', 401);
    }
    const updatedOrdem = await ordemDeServicoService.update(id, req.body, empresaId);
    return res.json(updatedOrdem);
  }
}
