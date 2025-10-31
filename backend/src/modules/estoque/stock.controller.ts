import { type Response } from "express";
import { StockService } from "./stock.service.ts";
import { createMovimentacaoSchema } from "./stock.dto.ts";
import { type AuthenticatedRequest } from "../../app/middlewares/auth.middleware.ts";

const stockService = new StockService();

export class StockController {
  // ============================================================
  // 🔹 Criação de Movimentação
  // ============================================================
  public async createMovimentacao(req: AuthenticatedRequest, res: Response) {
    try {
      const data = createMovimentacaoSchema.parse(req.body);
      const empresaId = req.user!.empresaId;

      const result = await stockService.createMovimentacao(data, empresaId);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  // ============================================================
  // 🔹 Lista movimentações de um produto
  // ============================================================
  public async getMovimentacoesByProdutoId(req: AuthenticatedRequest, res: Response) {
    try {
      const { produtoId } = req.params;
      const empresaId = req.user!.empresaId;

      const movimentacoes = await stockService.getMovimentacoesByProdutoId(produtoId as string, empresaId);
      res.status(200).json(movimentacoes);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  // ============================================================
  // 🔹 Lista todas as movimentações
  // ============================================================
  public async getMovimentacoes(req: AuthenticatedRequest, res: Response) {
    try {
      const empresaId = req.user!.empresaId;
      const movimentacoes = await stockService.getMovimentacoes(empresaId);
      res.status(200).json(movimentacoes);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  // ============================================================
  // 🔹 Valor total do estoque
  // ============================================================
  public async getValorEstoque(req: AuthenticatedRequest, res: Response) {
    try {
      const empresaId = req.user!.empresaId;
      const valorEstoque = await stockService.getValorEstoque(empresaId);
      res.status(200).json(valorEstoque);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  // ============================================================
  // 🔹 Estoque de um produto específico
  // ============================================================
  public async getEstoqueProdutoId(req: AuthenticatedRequest, res: Response) {
    try {
      const { produtoId } = req.params;
      const empresaId = req.user!.empresaId;

      const estoque = await stockService.getEstoqueProdutoId(produtoId as string, empresaId);
      res.status(200).json(estoque);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  // ============================================================
  // 🔹 Excluir lote
  // ============================================================
  public async deleteLote(req: AuthenticatedRequest, res: Response) {
    try {
      const { loteId, produtoId } = req.params;
      const empresaId = req.user!.empresaId;

      await stockService.deleteLote(loteId as string, produtoId as string, empresaId);
      res.status(204).send();
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  // ============================================================
  // 🔹 Lucro médio estimado
  // ============================================================
  public async getLucroMedioEstimado(req: AuthenticatedRequest, res: Response) {
    try {
      const empresaId = req.user!.empresaId;
      const lucro = await stockService.getLucroMedioEstimado(empresaId);
      res.status(200).json(lucro);
    } catch (error: any) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}