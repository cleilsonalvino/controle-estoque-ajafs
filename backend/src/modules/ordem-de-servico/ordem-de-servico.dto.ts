
import { z } from 'zod';

export const OrdemDeServicoSchema = z.object({
  id: z.string().uuid(),
  servicoId: z.string().uuid(),
  vendaId: z.string().uuid(),
  clienteId: z.string().uuid().optional().nullable(),
  responsavelId: z.string().uuid().optional().nullable(),
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']),
  observacoes: z.string().optional().nullable(),
  criadoEm: z.date(),
  atualizadoEm: z.date(),
  empresaId: z.string().uuid(),
});

export const CreateOrdemDeServicoSchema = z.object({
  servicoId: z.string().uuid(),
  vendaId: z.string().uuid(),
  clienteId: z.string().uuid().optional(),
  responsavelId: z.string().uuid().optional(),
  observacoes: z.string().optional(),
});

export const UpdateOrdemDeServicoSchema = z.object({
  responsavelId: z.string().uuid().optional(),
  status: z.enum(['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO']).optional(),
  observacoes: z.string().optional(),
});
