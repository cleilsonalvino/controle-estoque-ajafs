import { type Request, type Response } from 'express';
import { LoteService } from './lotes.service.ts';
import { type CreateLoteDto, type UpdateLoteDto, type CreateMovimentacaoLoteDto } from './lotes.dto.ts';

const loteService = new LoteService();

export class LoteController {
  async create(req: Request, res: Response) {
    const lote = await loteService.create(req.body as CreateLoteDto);
    res.status(201).json(lote);
  }

  async getAll(req: Request, res: Response) {
    const result = await loteService.getAll(req.query);
    res.status(200).json(result);
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const lote = await loteService.getById(id as string);
    res.status(200).json(lote);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const lote = await loteService.update(id as string, req.body as UpdateLoteDto);
    res.status(200).json(lote);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await loteService.delete(id as string);
    res.status(204).send();
  }

  async createMovimentacao(req: Request, res: Response) {
    const movimentacao = await loteService.createMovimentacao(
      req.body as CreateMovimentacaoLoteDto
    );
    res.status(201).json(movimentacao);
  }

  async getMovimentacoesByLoteId(req: Request, res: Response) {
    const { id } = req.params;
    const movimentacoes = await loteService.getMovimentacoesByLoteId(id as string);
    res.status(200).json(movimentacoes);
  }
}
