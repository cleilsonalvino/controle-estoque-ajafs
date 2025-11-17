import { url } from "inspector";
import { z } from "zod";

export const createProductSchema = z.object({
  nome: z.string(),
  descricao: z.string().optional(),
  precoVenda: z.coerce.number().optional(),
  codigoBarras: z.string().optional(),
  estoqueMinimo: z.coerce.number().nonnegative().optional().default(0),
  categoriaId: z.string().uuid('ID de categoria inválido').optional().nullable(),
  marcaId: z.string().uuid('ID de produto inválido').optional().nullable(),

}).strict();

export const updateProductSchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional().nullable(),
  precoVenda: z.coerce.number().optional(),
  codigoBarras: z.string().optional().nullable(),
  estoqueMinimo: z.coerce.number().nonnegative().optional(),
  categoriaId: z
  .string()
  .uuid()
  .or(z.literal(""))    // aceita ""
  .optional()
  .nullable(),
  urlImage: z.any().optional(),
  marcaId: z.string().uuid().optional(),
});

export type createProductDto = z.infer<typeof createProductSchema>;
export type updateProductDto = z.infer<typeof updateProductSchema>;
