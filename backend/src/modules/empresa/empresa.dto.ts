  import { z } from "zod";

  export const EmpresaSchema = z.object({
    nome_fantasia: z.string().min(3),
    cnpj: z.string(),
    telefone: z.string(),
    email: z.string().email().optional().nullable(),
    razao_social: z.string(),
    inscEstadual: z.string(),
    inscMunicipal: z.string(),
    cnae: z.string(),

    // endereço
    cep: z.string(),
    estado: z.string(),
    cidade: z.string(),
    endereco: z.string(),
    numero: z.string(),
    complemento: z.string().optional().nullable(),
    bairro: z.string(),
  });

  export const CreateEmpresaSchema = EmpresaSchema;
  export const UpdateEmpresaSchema = EmpresaSchema.partial();

  export type EmpresaDto = z.infer<typeof EmpresaSchema>;
  export type CreateEmpresaDto = z.infer<typeof CreateEmpresaSchema>;
  export type UpdateEmpresaDto = z.infer<typeof UpdateEmpresaSchema>;

