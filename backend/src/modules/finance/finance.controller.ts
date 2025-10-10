import { type Request, type Response } from "express";
import {
  createLancamentoFinanceiroService,
  getLancamentosFinanceirosService,
  getLancamentoFinanceiroByIdService,
} from "./finance.service.ts";

// LancamentoFinanceiro Controllers

export const createLancamentoFinanceiroController = async (req: Request, res: Response) => {
  const lancamento = await createLancamentoFinanceiroService(req.body);
  res.status(201).json(lancamento);
};

export const getLancamentosFinanceirosController = async (req: Request, res: Response) => {
  const lancamentos = await getLancamentosFinanceirosService();
  res.status(200).json(lancamentos);
};

export const getLancamentoFinanceiroByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const lancamento = await getLancamentoFinanceiroByIdService(id as string);
  res.status(200).json(lancamento);
};