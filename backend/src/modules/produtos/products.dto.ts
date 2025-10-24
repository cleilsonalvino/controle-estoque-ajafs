import { z } from "zod";

export const createProductSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional().default(""),
  precoVenda: z.number().nonnegative().optional().default(0),
  urlImage: z.string().optional().default(""),
  codigoBarras: z.string().optional(),
  estoqueMinimo: z.number().nonnegative().optional().default(0),
  categoriaId: z.string().uuid().optional(),
}).strict();

export const updateProductSchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional(),
  precoVenda: z.number().nonnegative(),
  urlImage: z.string().url().optional(),
  estoqueMinimo: z.number().optional(),
  categoriaId: z.string().uuid().optional(),
});

export type createProductDto = z.infer<typeof createProductSchema>;
export type updateProductDto = z.infer<typeof updateProductSchema>;
