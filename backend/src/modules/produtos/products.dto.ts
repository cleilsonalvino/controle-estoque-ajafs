import { z } from "zod";

export const createProductSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional(),
  precoVenda: z.string().optional(),
  urlImage: z.string().optional(),
  codigoBarras: z.string().optional(),
  estoqueMinimo: z.number().nonnegative().optional().default(0),
  categoriaId: z.string().uuid('ID de categoria inválido').optional().nullable(),
  marcaId: z.string().uuid('ID de produto inválido').optional().nullable(),

}).strict();

export const updateProductSchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional().nullable(),
  precoVenda: z.string().optional(),
  urlImage: z.string().optional().nullable(),
  codigoBarras: z.string().optional().nullable(),
  estoqueMinimo: z.number().nonnegative().optional(),
  categoriaId: z.string().uuid().optional(),
  marcaId: z.string().uuid().optional(),
});

export type createProductDto = z.infer<typeof createProductSchema>;
export type updateProductDto = z.infer<typeof updateProductSchema>;
