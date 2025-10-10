import { z } from "zod";

export const createVendaSchema = z.object({
  numero: z.string(),
  nomeCliente: z.string().optional(),
  total: z.number(),
  itens: z.array(z.object({
    produtoId: z.string(),
    quantidade: z.number(),
    precoUnitario: z.number(),
    custoNaVenda: z.number(),
  })),
});

export const updateVendaSchema = z.object({
  nomeCliente: z.string().optional(),
});
