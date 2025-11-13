import { z } from "zod";
import {
  FinanceiroTipoCategoria,
  FinanceiroTipoConta,
  FinanceiroStatusConta,
  FinanceiroPeriodicidadeRecorrencia,
  FinanceiroTipoMovimentacao,
  FinanceiroStatusMovimentacao,
} from "@prisma/client";

// =================================
// 1. CATEGORIA FINANCEIRA
// =================================
export const CreateCategoriaFinanceiraDTO = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  tipo: z.nativeEnum(FinanceiroTipoCategoria),
  descricao: z.string().optional(),
});

export const UpdateCategoriaFinanceiraDTO =
  CreateCategoriaFinanceiraDTO.partial();

// =================================
// 2. CONTA BANCÁRIA
// =================================
export const CreateContaBancariaDTO = z.object({
  nome: z.string().min(3),
  banco: z.string().optional(),
  tipoConta: z.nativeEnum(FinanceiroTipoConta),
  saldoInicial: z.number().positive(),
});

export const UpdateContaBancariaDTO = CreateContaBancariaDTO.omit({
  saldoInicial: true,
}).partial();

export const TransferenciaEntreContasDTO = z.object({
  contaOrigemId: z.string().uuid(),
  contaDestinoId: z.string().uuid(),
  valor: z.number().positive(),
  data: z.string().datetime(),
  descricao: z.string().optional(),
});

// =================================
// 3. MOVIMENTAÇÃO FINANCEIRA
// =================================
export const CreateMovimentacaoFinanceiraDTO = z.object({
  tipo: z.nativeEnum(FinanceiroTipoMovimentacao),
  descricao: z.string().optional(),
  valor: z.number().positive(),
  data: z.string().datetime(),
  status: z.nativeEnum(FinanceiroStatusMovimentacao).default("LIQUIDADA"),
  metodoPagamento: z.string().optional(),
  categoriaId: z.string().uuid(),
  contaBancariaId: z.string().uuid(),
  vendaId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
});

export const UpdateMovimentacaoFinanceiraDTO =
  CreateMovimentacaoFinanceiraDTO.partial();

// =================================
// 4. CONTA A PAGAR
// =================================
export const CreateContaPagarDTO = z.object({
  descricao: z.string().min(3),
  fornecedor: z.string().optional(),
  valorTotal: z.number().positive(),
  dataVencimento: z.string().datetime(),
  status: z.nativeEnum(FinanceiroStatusConta).default("PENDENTE"),
  recorrente: z.boolean().default(false),
  periodicidadeRecorrencia: z
    .nativeEnum(FinanceiroPeriodicidadeRecorrencia)
    .optional(),
  categoriaId: z.string().uuid(),
  contaBancariaId: z.string().uuid().optional(),
});

export const UpdateContaPagarDTO = CreateContaPagarDTO.partial();

export const MarcarContaPagaDTO = z.object({
  dataPagamento: z.string().datetime(),
  valorPago: z.number().positive(),
  contaBancariaId: z.string().uuid(),
  metodoPagamento: z.string().optional(),
});

// =================================
// 5. CONTA A RECEBER
// =================================
export const CreateContaReceberDTO = z.object({
  descricao: z.string().min(3),
  valorTotal: z.number().positive(),
  dataVencimento: z.string().datetime(),
  status: z.nativeEnum(FinanceiroStatusConta).default("PENDENTE"),
  recorrente: z.boolean().default(false),
  periodicidadeRecorrencia: z
    .nativeEnum(FinanceiroPeriodicidadeRecorrencia)
    .optional(),
  categoriaId: z.string().uuid(),
  contaBancariaId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  vendaId: z.string().uuid().optional(),
});

export const UpdateContaReceberDTO = CreateContaReceberDTO.partial();

export const MarcarContaRecebidaDTO = z.object({
  dataRecebimento: z.string().datetime(),
  valorRecebido: z.number().positive(),
  contaBancariaId: z.string().uuid(),
  metodoPagamento: z.string().optional(),
});

// =================================
// 💡 TIPOS INFERIDOS (CORREÇÃO TS2749)
// =================================
// Estes tipos devem ser usados nas assinaturas de função (services)
// para resolver o erro "refere-se a um valor, mas está sendo usado como um tipo".
export type typeCreateCategoriaFinanceiraDTO = z.infer<
  typeof CreateCategoriaFinanceiraDTO
>;
export type typeUpdateCategoriaFinanceiraDTO = z.infer<
  typeof UpdateCategoriaFinanceiraDTO
>;

export type typeCreateContaBancariaDTO = z.infer<
  typeof CreateContaBancariaDTO
>;
export type typeUpdateContaBancariaDTO = z.infer<
  typeof UpdateContaBancariaDTO
>;
export type typeTransferenciaEntreContasDTO = z.infer<
  typeof TransferenciaEntreContasDTO
>;

export type typeCreateMovimentacaoFinanceiraDTO = z.infer<
  typeof CreateMovimentacaoFinanceiraDTO
>;
export type typeUpdateMovimentacaoFinanceiraDTO = z.infer<
  typeof UpdateMovimentacaoFinanceiraDTO
>;

export type typeCreateContaPagarDTO = z.infer<typeof CreateContaPagarDTO>;
export type typeUpdateContaPagarDTO = z.infer<typeof UpdateContaPagarDTO>;
export type typeMarcarContaPagaDTO = z.infer<typeof MarcarContaPagaDTO>;

export type typeCreateContaReceberDTO = z.infer<
  typeof CreateContaReceberDTO
>;
export type typeUpdateContaReceberDTO = z.infer<
  typeof UpdateContaReceberDTO
>;
export type typeMarcarContaRecebidaDTO = z.infer<
  typeof MarcarContaRecebidaDTO
>;