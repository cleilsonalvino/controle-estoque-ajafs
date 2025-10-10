import { z } from "zod";

export const createProductSchema = z.object({
  sku: z.string(),
  nome: z.string(),
  unidadeMedida: z.string(),
  rastrearPorLote: z.boolean().optional(),
  estoqueMinimo: z.number().optional(),
  diasValidade: z.number().int().optional(),
});

export const updateProductSchema = z.object({
  sku: z.string().optional(),
  nome: z.string().optional(),
  unidadeMedida: z.string().optional(),
  rastrearPorLote: z.boolean().optional(),
  estoqueMinimo: z.number().optional(),
  diasValidade: z.number().int().optional(),
});
