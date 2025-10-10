import { z } from "zod";

export const createDepositoSchema = z.object({
  codigo: z.string(),
  nome: z.string(),
});

export const updateDepositoSchema = z.object({
  codigo: z.string().optional(),
  nome: z.string().optional(),
});

export const createLoteSchema = z.object({
  produtoId: z.string(),
  codigo: z.string(),
  validadeEm: z.string().datetime().optional(),
});

export const updateLoteSchema = z.object({
  codigo: z.string().optional(),
  validadeEm: z.string().datetime().optional(),
});

export const createPosicaoEstoqueSchema = z.object({
  produtoId: z.string(),
  depositoId: z.string(),
  loteId: z.string().optional(),
  quantidade: z.number(),
  reservado: z.number().optional(),
  custoMedio: z.number().optional(),
});

export const updatePosicaoEstoqueSchema = z.object({
  quantidade: z.number().optional(),
  reservado: z.number().optional(),
  custoMedio: z.number().optional(),
});

export const createMovimentacaoSchema = z.object({
  produtoId: z.string(),
  depositoId: z.string(),
  loteId: z.string().optional(),
  fornecedorId: z.string().optional(),
  tipo: z.enum(["ENTRADA", "SAIDA", "TRANSFERENCIA", "AJUSTE", "RESERVA", "LIBERACAO", "CONSUMO"]),
  quantidade: z.number(),
  custoUnitario: z.number().optional(),
  referencia: z.string().optional(),
  meta: z.any().optional(),
});
