import e from "express";
import { z } from "zod";

export const createSupplierSchema = z.object({
  nome: z.string(),
  email: z.string().email().optional().nullable(),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional().nullable(),
});

export const updateSupplierSchema = z.object({
  nome: z.string(),
  email: z.string().email().optional().nullable(),
  telefone: z.string().optional().nullable(),
  descricao: z.string().optional().nullable(),
  atualizadoEm: z.date().optional().default(new Date()),
  
});
