import { z } from "zod";

export const createPosVendaSchema = z.object({
  vendaId: z.string(),
  clienteId: z.string().optional(),
  usuarioId: z.string().optional(),
  dataContato: z.string().datetime().optional(),
  tipoContato: z.string().optional(),
  status: z.enum(["PENDENTE", "EM_ANDAMENTO", "FINALIZADO"]).optional(),
  satisfacao: z.number().int().min(1).max(5).optional(),
  observacoes: z.string().optional(),
});

export const updatePosVendaSchema = createPosVendaSchema.partial().extend({
  retornoCliente: z.boolean().optional(),
});

export const createFollowUpSchema = z.object({
  posVendaId: z.string(),
  dataAgendada: z
    .string()
    .transform((v) => {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
        v = v + ":00"; // adiciona segundos
      }
      return new Date(v);
    })
    .refine((d) => !isNaN(d.getTime()), { message: "Data inválida" }),

  tipoAcao: z.string().optional(),
  observacao: z.string().optional(),
});

export const updateFollowUpSchema = createFollowUpSchema.partial().extend({
  realizado: z.boolean().optional(),
});

export const createFeedbackSchema = z.object({
  avaliacao: z.number().int().min(1).max(5),
  comentario: z.string().optional(),
});

export type CreatePosVendaDto = z.infer<typeof createPosVendaSchema>;
export type UpdatePosVendaDto = z.infer<typeof updatePosVendaSchema>;
export type CreateFollowUpDto = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpDto = z.infer<typeof updateFollowUpSchema>;
export type CreateFeedbackDto = z.infer<typeof createFeedbackSchema>;
