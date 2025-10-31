import { z } from 'zod';
import { generalSchema } from '../../shared/dto';

// Schema para criação de um novo serviço
export const createServiceSchema = z.object({
  nome: z.string().min(1, 'O nome é obrigatório'),
  descricao: z.string().optional(),
  precoCusto: z.coerce.number().min(0, 'O preço de custo não pode ser negativo').default(0),
  precoVenda: z.coerce.number().min(0, 'O preço de venda não pode ser negativo').default(0),
  duracaoMinutos: z.coerce.number().int().min(0, 'A duração deve ser um número positivo').optional(),
  categoriaId: z.string().uuid('O ID da categoria deve ser um UUID válido').optional().nullable(),
  
});


// Schema para atualização de um serviço
export const updateServiceSchema = createServiceSchema.partial();

// Schema para os parâmetros de rota (ex: /services/:id)
export const serviceIdParamSchema = z.object({
  id: z.string().uuid('O ID do serviço deve ser um UUID válido'),
});

export const listServiceSchema = z.object({
  query: generalSchema,
});

export type CreateServiceDto = z.infer<typeof createServiceSchema>;
export type UpdateServiceDto = z.infer<typeof updateServiceSchema>;
