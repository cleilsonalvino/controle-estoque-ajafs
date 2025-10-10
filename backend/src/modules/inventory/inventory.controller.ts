import { type Request, type Response } from "express";
import {
  createDepositoService,
  getDepositosService,
  getDepositoByIdService,
  updateDepositoService,
  deleteDepositoService,
  createLoteService,
  getLotesService,
  getLoteByIdService,
  updateLoteService,
  deleteLoteService,
  createPosicaoEstoqueService,
  getPosicoesEstoqueService,
  getPosicaoEstoqueByIdService,
  updatePosicaoEstoqueService,
  deletePosicaoEstoqueService,
  createMovimentacaoService,
  getMovimentacoesService,
  getMovimentacaoByIdService,

  
} from "./inventory.service.ts";

// Deposito Controllers

export const createDepositoController = async (req: Request, res: Response) => {
  const deposito = await createDepositoService(req.body);
  res.status(201).json(deposito);
};

export const getDepositosController = async (req: Request, res: Response) => {
  const depositos = await getDepositosService();
  res.status(200).json(depositos);
};

export const getDepositoByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deposito = await getDepositoByIdService(id as string);
  res.status(200).json(deposito);
};

export const updateDepositoController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deposito = await updateDepositoService(id as string, req.body);
  res.status(200).json(deposito);
};

export const deleteDepositoController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteDepositoService(id as string);
  res.status(204).send();
};

// Lote Controllers

export const createLoteController = async (req: Request, res: Response) => {
  const lote = await createLoteService(req.body);
  res.status(201).json(lote);
};

export const getLotesController = async (req: Request, res: Response) => {
  const lotes = await getLotesService();
  res.status(200).json(lotes);
};

export const getLoteByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const lote = await getLoteByIdService(id as string);
  res.status(200).json(lote);
};

export const updateLoteController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const lote = await updateLoteService(id as string, req.body);
  res.status(200).json(lote);
};

export const deleteLoteController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteLoteService(id as string);
  res.status(204).send();
};

// PosicaoEstoque Controllers

export const createPosicaoEstoqueController = async (req: Request, res: Response) => {
  const posicaoEstoque = await createPosicaoEstoqueService(req.body);
  res.status(201).json(posicaoEstoque);
};

export const getPosicoesEstoqueController = async (req: Request, res: Response) => {
  const posicoesEstoque = await getPosicoesEstoqueService();
  res.status(200).json(posicoesEstoque);
};

export const getPosicaoEstoqueByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const posicaoEstoque = await getPosicaoEstoqueByIdService(id as string);
  res.status(200).json(posicaoEstoque);
};

export const updatePosicaoEstoqueController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const posicaoEstoque = await updatePosicaoEstoqueService(id as string, req.body);
  res.status(200).json(posicaoEstoque);
};

export const deletePosicaoEstoqueController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deletePosicaoEstoqueService(id as string);
  res.status(204).send();
};

// Movimentacao Controllers

export const createMovimentacaoController = async (req: Request, res: Response) => {
  const movimentacao = await createMovimentacaoService(req.body);
  res.status(201).json(movimentacao);
};

export const getMovimentacoesController = async (req: Request, res: Response) => {
  const movimentacoes = await getMovimentacoesService();
  res.status(200).json(movimentacoes);
};

export const getMovimentacaoByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const movimentacao = await getMovimentacaoByIdService(id as string);
  res.status(200).json(movimentacao);
};