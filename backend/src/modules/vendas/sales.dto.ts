import { z } from "zod";

// ================================
// DTO para criar venda
// ================================
export const createVendaSchema = z.object({
  clienteId: z.string({invalid_type_error: "Cliente inválido ou faltando"}).optional().nullable(), // agora usamos clienteId
  vendedorId: z.string({invalid_type_error: "Vendedor inválido ou faltando"}).optional(), // adicionar vendedorId
  status: z.enum(["Pendente", "Concluída", "Cancelada"]).optional(),
  formaPagamento: z.enum(["Pix", "Cartão de Crédito", "Dinheiro"]).optional(),
  desconto: z.number({invalid_type_error: "Desconto inválido"}).nonnegative({message: "Desconto não pode ser negativo"}).optional(),
  lucroEstimado: z.number({invalid_type_error: "Lucro estimado inválido"}).nonnegative({message: "Lucro estimado não pode ser negativo"}).optional(),
  observacoes: z.string({invalid_type_error: "Observações inválidas"}).optional(),
  
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
