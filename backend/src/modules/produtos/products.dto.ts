import { z } from "zod";

export const createProductSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional().default(""),
  precoCusto: z.number().nonnegative().optional().default(0),
  precoVenda: z.number().nonnegative().optional().default(0),
  estoqueAtual: z.number().nonnegative().optional().default(0),
  estoqueMinimo: z.number().nonnegative().optional().default(0),
  fornecedorId: z.string().uuid().optional(),
  categoriaId: z.string().uuid().optional(),
}).strict();

export const updateProductSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional(),
  preco: z.number().nonnegative(),
  estoqueAtual: z.number().nonnegative().optional(),
  estoqueMinimo: z.number().optional(),
  fornecedorId: z.string().uuid().optional(),
  categoriaId: z.string().uuid().optional(),
});

export type createProductDto = z.infer<typeof createProductSchema>;
export type updateProductDto = z.infer<typeof updateProductSchema>;
