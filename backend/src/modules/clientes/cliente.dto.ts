import { z } from 'zod';

export const ClienteSchema = z.object({
  id: z.string().optional(),

  nome: z
    .string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .nullable(),

  cpf: z
    .string()
    .transform((v) => v?.replace(/\D/g, "")) // remove máscara
    .refine((v) => !v || v.length === 11, {
      message: "CPF deve ter 11 dígitos numéricos",
    })
    .optional()
    .nullable(),

  telefone: z
    .string()
    .transform((v) => v?.replace(/\D/g, "")) // remove máscara
    .refine((v) => !v || (v.length >= 10 && v.length <= 11), {
      message: "Telefone inválido (use DDD + número)",
    })
    .optional(),

  endereco: z.string().optional(),
});


export type ClienteDto = z.infer<typeof ClienteSchema>;

export const CreateClienteSchema = ClienteSchema.omit({ id: true });
export type CreateClienteDto = z.infer<typeof CreateClienteSchema>;

export const UpdateClienteSchema = ClienteSchema.partial();
export type UpdateClienteDto = z.infer<typeof UpdateClienteSchema>;
