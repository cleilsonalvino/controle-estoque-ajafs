import e from "express";
import { z } from "zod";

export const createSupplierSchema = z.object({
  nome: z.string(),
  email: z.string().email().optional().nullable(),
  contato: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  empresaId: z.string().uuid(),
});

export const updateSupplierSchema = z.object({
  nome: z.string(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  atualizadoEm: z.date().optional().default(new Date()),
  
});
