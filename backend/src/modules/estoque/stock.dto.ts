// stock.dto.ts
import { z } from "zod";
import { TipoMovimentacao } from "@prisma/client";

export const createMovimentacaoSchema = z
  .object({
    produtoId: z.string().uuid(),
    tipo: z.nativeEnum(TipoMovimentacao),
    quantidade: z.number().positive(),
    observacao: z.string().optional(),
    fornecedorId: z.string().uuid().optional(),
    precoCusto: z.number().nonnegative().optional(),
    validade: z
      .union([z.string().datetime(), z.string().date(), z.date()])
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
