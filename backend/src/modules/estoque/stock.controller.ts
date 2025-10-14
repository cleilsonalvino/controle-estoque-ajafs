import { type Request, type Response } from 'express';
import { 
  StockService
 } from './stock.service.ts';
import { createMovimentacaoSchema } from './stock.dto.ts';

const stockService = new StockService();

export class StockController {
  // Cria movimentação de entrada/saída/ajuste
  public async createMovimentacao(req: Request, res: Response) {
    const data = createMovimentacaoSchema.parse(req.body);
    const movimentacao = await stockService.createMovimentacao(data);
    res.status(201).json(movimentacao);
  }

  // Lista movimentações de um produto
  public async getMovimentacoesByProdutoId(req: Request, res: Response) {
    const { produtoId } = req.params;
    const movimentacoes = await stockService.getMovimentacoesByProdutoId(produtoId as string);
    res.status(200).json(movimentacoes);
  }

  public async getMovimentacoes(req: Request, res: Response) {
    const movimentacoes = await stockService.getMovimentacoes();
    res.status(200).json(movimentacoes);
  }

  // Total de estoque (quantidade total e valor total)
  public async getTotalEstoque(req: Request, res: Response) {
    const total = await stockService.getTotalEstoque();
    res.status(200).json(total);
  }

  // Giro de estoque geral ou por produto
  public async getGiroDeEstoque(req: Request, res: Response) {
    const { produtoId } = req.query;
    const giro = await stockService.getGiroDeEstoque(produtoId as string);
    res.status(200).json(giro);
  }

  // Produtos com estoque baixo
  public async getProdutosComBaixoEstoque(req: Request, res: Response) {
    const produtos = await stockService.getProdutosComBaixoEstoque();
    res.status(200).json(produtos);
  }

  // Histórico agregado de movimentações (entrada/saída por mês)
  public async getResumoMovimentacoes(req: Request, res: Response) {
    const historico = await stockService.getResumoMovimentacoes();
    res.status(200).json(historico);
  }

  // Valor total de estoque em reais (ou outra moeda)
  public async getValorTotalEstoque(req: Request, res: Response) {
    const valorTotal = await stockService.getValorTotalEstoque();
    res.status(200).json(valorTotal);
  }

  // Estatísticas gerais da dashboard
  public async getDashboardResumo(req: Request, res: Response) {
    const resumo = await stockService.getResumoMovimentacoes();
    res.status(200).json(resumo);
  }
}
