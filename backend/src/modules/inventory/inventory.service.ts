import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

// Deposito Services

export const createDepositoService = async (data: any) => {
  const deposito = await prisma.deposito.create({
    data,
  });
  return deposito;
};

export const getDepositosService = async () => {
  const depositos = await prisma.deposito.findMany();
  return depositos;
};

export const getDepositoByIdService = async (id: string) => {
  const deposito = await prisma.deposito.findUnique({
    where: { id },
  });
  if (!deposito) {
    throw new AppError("Depósito não encontrado", 404);
  }
  return deposito;
};

export const updateDepositoService = async (id: string, data: any) => {
  const deposito = await prisma.deposito.update({
    where: { id },
    data,
  });
  return deposito;
};

export const deleteDepositoService = async (id: string) => {
  await prisma.deposito.delete({
    where: { id },
  });
};

// Lote Services

export const createLoteService = async (data: any) => {
  const lote = await prisma.lote.create({
    data,
  });
  return lote;
};

export const getLotesService = async () => {
  const lotes = await prisma.lote.findMany();
  return lotes;
};

export const getLoteByIdService = async (id: string) => {
  const lote = await prisma.lote.findUnique({
    where: { id },
  });
  if (!lote) {
    throw new AppError("Lote não encontrado", 404);
  }
  return lote;
};

export const updateLoteService = async (id: string, data: any) => {
  const lote = await prisma.lote.update({
    where: { id },
    data,
  });
  return lote;
};

export const deleteLoteService = async (id: string) => {
  await prisma.lote.delete({
    where: { id },
  });
};

// PosicaoEstoque Services

export const createPosicaoEstoqueService = async (data: any) => {
  const posicaoEstoque = await prisma.posicaoEstoque.create({
    data,
  });
  return posicaoEstoque;
};

export const getPosicoesEstoqueService = async () => {
  const posicoesEstoque = await prisma.posicaoEstoque.findMany();
  return posicoesEstoque;
};

export const getPosicaoEstoqueByIdService = async (id: string) => {
  const posicaoEstoque = await prisma.posicaoEstoque.findUnique({
    where: { id },
  });
  if (!posicaoEstoque) {
    throw new AppError("Posição de estoque não encontrada", 404);
  }
  return posicaoEstoque;
};

export const updatePosicaoEstoqueService = async (id: string, data: any) => {
  const posicaoEstoque = await prisma.posicaoEstoque.update({
    where: { id },
    data,
  });
  return posicaoEstoque;
};

export const deletePosicaoEstoqueService = async (id: string) => {
  await prisma.posicaoEstoque.delete({
    where: { id },
  });
};

// Movimentacao Services

export const createMovimentacaoService = async (data: any) => {
  const movimentacao = await prisma.movimentacao.create({
    data,
  });
  return movimentacao;
};

export const getMovimentacoesService = async () => {
  const movimentacoes = await prisma.movimentacao.findMany();
  return movimentacoes;
};

export const getMovimentacaoByIdService = async (id: string) => {
  const movimentacao = await prisma.movimentacao.findUnique({
    where: { id },
  });
  if (!movimentacao) {
    throw new AppError("Movimentação não encontrada", 404);
  }
  return movimentacao;
};