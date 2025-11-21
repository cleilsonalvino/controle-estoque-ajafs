import { z } from "zod";

export const CreateOrdemDeServicoSchema = z.object({
  clienteId: z.string().uuid(),
  responsavelId: z.string().uuid(),
  identificacaoItem: z.string().optional(),
  problemaRelatado: z.string(),
  observacoes: z.string().optional(),
  servicoId: z.string().uuid().optional(),
});

export const UpdateOrdemDeServicoSchema = z.object({
  responsavelId: z.string().uuid().optional(),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"]).optional(),
  identificacaoItem: z.string().optional(),
  problemaRelatado: z.string().optional(),
  observacoes: z.string().optional(),
});
