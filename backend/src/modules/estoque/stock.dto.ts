
import { z } from 'zod';
import { TipoMovimentacao } from '@prisma/client';

export const createMovimentacaoSchema = z.object({
  produtoId: z.string().uuid(),
  tipo: z.nativeEnum(TipoMovimentacao),
  quantidade: z.number().positive(),
  observacao: z.string().optional(),
});

export type CreateMovimentacaoDto = z.infer<typeof createMovimentacaoSchema>;
