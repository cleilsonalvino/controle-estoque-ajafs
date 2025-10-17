import { type Request, type Response } from 'express';
import { StockService } from './stock.service.ts';
import { createMovimentacaoSchema } from './stock.dto.ts';

const stockService = new StockService();

export class StockController {
  public async createSaida(req: Request, res: Response) {
    const data = createMovimentacaoSchema.parse(req.body);
    const result = await stockService.createSaida(data);
    res.status(201).json(result);
  }

  public async getMovimentacoesByProdutoId(req: Request, res: Response) {
    const { produtoId } = req.params;
    const movimentacoes = await stockService.getMovimentacoesByProdutoId(produtoId as string);
    res.status(200).json(movimentacoes);
  }

  public async getMovimentacoes(req: Request, res: Response) {
    const movimentacoes = await stockService.getMovimentacoes();
    res.status(200).json(movimentacoes);
  }
}