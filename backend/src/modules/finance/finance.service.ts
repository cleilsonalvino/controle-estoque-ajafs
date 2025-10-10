import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

// LancamentoFinanceiro Services

export const createLancamentoFinanceiroService = async (data: any) => {
  const lancamento = await prisma.lancamentoFinanceiro.create({
    data,
  });
  return lancamento;
};

export const getLancamentosFinanceirosService = async () => {
  const lancamentos = await prisma.lancamentoFinanceiro.findMany();
  return lancamentos;
};

export const getLancamentoFinanceiroByIdService = async (id: string) => {
  const lancamento = await prisma.lancamentoFinanceiro.findUnique({
    where: { id },
  });
  if (!lancamento) {
    throw new AppError("Lançamento financeiro não encontrado", 404);
  }
  return lancamento;
};