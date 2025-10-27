// stock.dto.ts
import { z } from "zod";
import { TipoMovimentacao } from "@prisma/client";

export const createMovimentacaoSchema = z
  .object({
    produtoId: z.string({invalid_type_error: "Produto inválido ou faltando"}).uuid(),
    tipo: z.nativeEnum(TipoMovimentacao),
    quantidade: z.number({invalid_type_error: "Quantidade inválida"}).positive(),
    observacao: z.string().optional().nullable(),
    fornecedorId: z.string({invalid_type_error: "Fornecedor inválido ou faltando"}).uuid("Deve ser ter um UUID válido").optional().nullable(),
    precoCusto: z.string({invalid_type_error: "Preço de custo inválido"}).optional().nullable(),
    validade: z
      .union([z.string({invalid_type_error: "Data de validade inválida"}).datetime(), z.string().date(), z.date()])
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === TipoMovimentacao.ENTRADA) {
      if (!data.fornecedorId) {
        ctx.addIssue({
          code: "custom",
          message: "Fornecedor é obrigatório em movimentações de entrada.",
          path: ["fornecedorId"],
        });
      }
      if (data.precoCusto === undefined) {
        ctx.addIssue({
          code: "custom",
          message: "Preço de custo é obrigatório em movimentações de entrada.",
          path: ["precoCusto"],
        });
      }
    }
  });

export type CreateMovimentacaoDto = z.infer<typeof createMovimentacaoSchema>;
