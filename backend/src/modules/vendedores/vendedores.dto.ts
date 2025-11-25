import { z } from 'zod';

export const VendedorSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido').optional().nullable(),
  meta: z.coerce.number().min(0, 'A meta deve ser um número maior ou igual a zero'),
  urlImagem: z.string().optional(),
});

export type VendedorDto = z.infer<typeof VendedorSchema>;

export const CreateVendedorSchema = VendedorSchema.omit({ id: true });
export type CreateVendedorDto = z.infer<typeof CreateVendedorSchema>;

export const UpdateVendedorSchema = VendedorSchema.partial();
export type UpdateVendedorDto = z.infer<typeof UpdateVendedorSchema>;
