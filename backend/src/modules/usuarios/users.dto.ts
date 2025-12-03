import { z } from "zod";

export const createUserSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6),
  papel: z.enum(["ADMINISTRADOR", "USUARIO"]).optional(),
  telasPermitidas: z.array(z.string()).optional(),
  urlImagem: z.string().optional(),
});

export const updateUserSchema = z.object({
  nome: z.string().optional(),
  email: z.string().email().optional(),
  papel: z.enum(["ADMINISTRADOR", "GERENTE", "USUARIO", "VISUALIZADOR"]).optional(),
  telasPermitidas: z.array(z.string()).optional(),
  urlImagem: z.string().optional(),
});
