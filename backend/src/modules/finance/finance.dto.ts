import { z } from "zod";

export const createLancamentoFinanceiroSchema = z.object({
  tipo: z.enum(["RECEITA", "DESPESA"]),
  data: z.string().datetime(),
  valor: z.number(),
  categoria: z.string().optional(),
  referencia: z.string().optional(),
  meta: z.any().optional(),
});
