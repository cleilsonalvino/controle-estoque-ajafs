import { z } from "zod";

export const createProductSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional().default("").nullable(),
  precoVenda: z.string().optional().default("").nullable(),
  urlImage: z.string().optional().default("").nullable(),
  codigoBarras: z.string().optional().nullable(),
  estoqueMinimo: z.number().nonnegative().optional().default(0).nullable(),
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
