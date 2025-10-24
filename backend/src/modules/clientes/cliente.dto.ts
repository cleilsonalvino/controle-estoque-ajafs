import { z } from 'zod';

export const ClienteSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
});

export type ClienteDto = z.infer<typeof ClienteSchema>;

export const CreateClienteSchema = ClienteSchema.omit({ id: true });
export type CreateClienteDto = z.infer<typeof CreateClienteSchema>;

export const UpdateClienteSchema = ClienteSchema.partial();
export type UpdateClienteDto = z.infer<typeof UpdateClienteSchema>;
