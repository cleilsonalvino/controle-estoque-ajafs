import { z } from "zod";

// ================================
// DTO para criar venda
// ================================
export const createVendaSchema = z.object({
  numero: z.string(),
  clienteId: z.string().optional(), // agora usamos clienteId
  vendedorId: z.string().optional(), // adicionar vendedorId
  total: z.number(),
  status: z.enum(["Pendente", "Concluída", "Cancelada"]).optional(),
  formaPagamento: z.enum(["Pix", "Cartão de Crédito", "Dinheiro"]).optional(),
  desconto: z.number().optional(),
  lucroEstimado: z.number().optional(),
  observacoes: z.string().optional(),
  itens: z.array(
    z.object({
      produtoId: z.string(),
      quantidade: z.number(),
      precoUnitario: z.number(),
    })
  ),
});

// ================================
// DTO para atualizar venda
// ================================
export const updateVendaSchema = z.object({
  clienteId: z.string().optional(),
  vendedorId: z.string().optional(),
  status: z.enum(["Pendente", "Concluída", "Cancelada"]).optional(),
  formaPagamento: z.enum(["Pix", "Cartão de Crédito", "Dinheiro"]).optional(),
  desconto: z.number().optional(),
  lucroEstimado: z.number().optional(),
  observacoes: z.string().optional(),
  total: z.number().optional(),
  itens: z
    .array(
      z.object({
        produtoId: z.string(),
        quantidade: z.number(),
        precoUnitario: z.number(),
      })
    )
    .optional(),
});


export type CreateVendaDto = z.infer<typeof createVendaSchema>;
export type UpdateVendaDto = z.infer<typeof updateVendaSchema>;
