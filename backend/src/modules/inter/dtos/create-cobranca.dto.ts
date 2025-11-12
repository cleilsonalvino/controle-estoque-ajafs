import { z } from "zod";

export const CreateCobrancaSchema = z.object({
  seuNumero: z.string().min(1),
  valorNominal: z.number().positive(),
  dataVencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pagador: z.object({
    cpfCnpj: z.string().min(11),
    nome: z.string(),
    email: z.string().email().optional(),
    endereco: z.object({
      logradouro: z.string(),
      numero: z.string(),
      bairro: z.string(),
      cidade: z.string(),
      uf: z.string().length(2),
      cep: z.string().length(8),
    }),
  }),
});

export type CreateCobrancaDTO = z.infer<typeof CreateCobrancaSchema>;
