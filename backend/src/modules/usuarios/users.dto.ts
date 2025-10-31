import { z } from "zod";

export const createUserSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6),
  papel: z.enum(["ADMINISTRADOR", "USUARIO"]).optional(),
  empresaId: z.string().uuid(),
});

export const updateUserSchema = z.object({
  nome: z.string().optional(),
  email: z.string().email().optional(),
  senha: z.string().min(6).optional(),
  papel: z.enum(["ADMINISTRADOR", "GERENTE", "USUARIO", "VISUALIZADOR"]).optional(),
  ativo: z.boolean().optional(),
  
});
