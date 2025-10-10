import { z } from "zod";

export const createSupplierSchema = z.object({
  nome: z.string(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  descricao: z.string().optional(),
});

export const updateSupplierSchema = z.object({
  nome: z.string().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  descricao: z.string().optional(),
});
