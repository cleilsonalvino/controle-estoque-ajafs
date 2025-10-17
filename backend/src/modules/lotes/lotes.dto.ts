import { z } from 'zod';
import { generalSchema } from '../../shared/dto.ts';
import { TipoMovimentacao } from '@prisma/client';

// Schema para criação de um novo lote
export const createLoteSchema = z.object({
  produtoId: z.string().uuid('O ID do produto deve ser um UUID válido'),
  fornecedorId: z.string().uuid('O ID do fornecedor deve ser um UUID válido').optional(),
  precoCusto: z.number().min(0, 'O preço de custo não pode ser negativo'),
  quantidadeTotal: z.number().min(0, 'A quantidade total deve ser positiva'),
  quantidadeAtual: z.number().min(0, 'A quantidade atual deve ser positiva'),
  dataCompra: z.string().datetime('A data da compra deve ser uma data válida').optional(),
  validade: z.string().datetime('A data de validade deve ser uma data válida').optional(),
});

// Schema para atualização de um lote
export const updateLoteSchema = createLoteSchema.partial();

// Schema para os parâmetros de rota (ex: /lotes/:id)
export const loteIdParamSchema = z.object({
  id: z.string().uuid('O ID do lote deve ser um UUID válido'),
});

export const listLoteSchema = z.object({
  query: generalSchema,
});

// Schema para movimentação de lote
export const createMovimentacaoLoteSchema = z.object({
  loteId: z.string().uuid('O ID do lote é obrigatório'),
  tipo: z.nativeEnum(TipoMovimentacao),
  quantidade: z.number().min(0.001, 'A quantidade deve ser maior que zero'),
  observacao: z.string().optional(),
});

export type CreateLoteDto = z.infer<typeof createLoteSchema>;
export type UpdateLoteDto = z.infer<typeof updateLoteSchema>;
export type CreateMovimentacaoLoteDto = z.infer<typeof createMovimentacaoLoteSchema>;
