import { type Request, type Response } from 'express';
import { StockService } from './stock.service.ts';
import { createMovimentacaoSchema } from './stock.dto.ts';

const stockService = new StockService();

export class StockController {

  public async createMovimentacao(req: Request, res: Response) {
    console.log('Creating movimentacao with data:', req.body);
    const data = createMovimentacaoSchema.parse(req.body);
    const result = await stockService.createMovimentacao(data);
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

  public async getValorEstoque(req: Request, res: Response) {
    const valorEstoque = await stockService.getValorEstoque();
    res.status(200).json({ valorEstoque });
  }

  public async getEstoqueProdutoId(req: Request, res: Response) {
    const { produtoId } = req.params;
    const estoque = await stockService.getEstoqueProdutoId(produtoId as string);
    res.status(200).json({ estoque });
  }

  public async deleteLote(req: Request, res: Response) {
    const { loteId, productId } = req.params;
    await stockService.deleteLote(loteId as string, productId as string);
    res.status(204).send();
  }

  public async getLucroMedioEstimado(req: Request, res: Response) {
    const custoMedioEstimado = await stockService.getLucroMedioEstimado();
    res.status(200).json({ custoMedioEstimado });
  }


}