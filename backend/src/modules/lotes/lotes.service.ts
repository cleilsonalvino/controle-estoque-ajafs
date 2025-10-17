import { Prisma, PrismaClient, TipoMovimentacao } from '@prisma/client';
import { type CreateLoteDto, type UpdateLoteDto, type CreateMovimentacaoLoteDto } from './lotes.dto.ts';
import { CustomError } from '../../shared/errors.ts';

const prisma = new PrismaClient();

export class LoteService {
  async create(data: CreateLoteDto) {
    return prisma.$transaction(async (tx) => {
      const lote = await tx.lote.create({
        data:{
          precoCusto: data.precoCusto,
          quantidadeAtual: data.quantidadeTotal,
          quantidadeTotal: data.quantidadeTotal,
          dataCompra: data.dataCompra,
          validade: data.validade,

        } as Prisma.LoteCreateInput
      });

      await tx.produto.update({
        where: { id: data.produtoId },
        data: {
          estoqueAtual: {
            increment: data.quantidadeTotal,
          },
        },
      });

      await tx.movimentacao.create({
        data: {
          produtoId: data.produtoId,
          tipo: TipoMovimentacao.ENTRADA,
          quantidade: data.quantidadeTotal,
          observacao: `Lote ${lote.id} adicionado.`,
        },
      });

      return lote;
    });
  }

  async getAll(query: any) {
    const { page = 1, limit = 10, sortBy = 'dataCompra', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const lotes = await prisma.lote.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        [sortBy]: order,
      },
      include: { produto: true, fornecedor: true },
    });

    const total = await prisma.lote.count();

    return { data: lotes, total };
  }

  async getById(id: string) {
    const lote = await prisma.lote.findUnique({
      where: { id },
      include: { produto: true, fornecedor: true, movimentacoes: true },
    });

    if (!lote) {
      throw new CustomError('Lote não encontrado.', 404);
    }

    return lote;
  }

  async update(id: string, data: UpdateLoteDto) {
    return prisma.$transaction(async (tx) => {
      const loteExistente = await tx.lote.findUnique({ where: { id } });
      if (!loteExistente) {
        throw new CustomError('Lote não encontrado.', 404);
      }

      const diferencaQuantidade = 
        (data.quantidadeTotal ?? loteExistente.quantidadeTotal.toNumber()) - 
        loteExistente.quantidadeTotal.toNumber();

      const lote = await tx.lote.update({
        where: { id },
        data:{
          precoCusto: data.precoCusto ?? loteExistente.precoCusto,
          quantidadeTotal: data.quantidadeTotal ?? loteExistente.quantidadeTotal,
          quantidadeAtual: loteExistente.quantidadeAtual.toNumber() + diferencaQuantidade,
          dataCompra: data.dataCompra ?? loteExistente.dataCompra,
          validade: data.validade ?? loteExistente.validade,
        } as Prisma.LoteUpdateInput
      });

      if (diferencaQuantidade !== 0) {
        await tx.produto.update({
          where: { id: lote.produtoId },
          data: {
            estoqueAtual: {
              increment: diferencaQuantidade,
            },
          },
        });
      }

      return lote;
    });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      const lote = await tx.lote.findUnique({ where: { id } });
      if (!lote) {
        throw new CustomError('Lote não encontrado.', 404);
      }

      await tx.lote.delete({
        where: { id },
      });

      await tx.produto.update({
        where: { id: lote.produtoId },
        data: {
          estoqueAtual: {
            decrement: lote.quantidadeTotal.toNumber(),
          },
        },
      });
    });
  }

  async createMovimentacao(data: CreateMovimentacaoLoteDto) {
    const { loteId, tipo, quantidade } = data;

    return await prisma.$transaction(async (tx) => {
      const lote = await tx.lote.findUnique({
        where: { id: loteId },
      });

      if (!lote) {
        throw new CustomError('Lote não encontrado.', 404);
      }

      let novaQuantidade = lote.quantidadeAtual.toNumber();
      let incrementoProduto = 0;

      if (tipo === TipoMovimentacao.SAIDA) {
        novaQuantidade -= quantidade;
        incrementoProduto = -quantidade;
        if (novaQuantidade < 0) {
          throw new CustomError('A quantidade em estoque do lote não pode ser negativa.', 400);
        }
      } else if (tipo === TipoMovimentacao.AJUSTE || tipo === TipoMovimentacao.ENTRADA) {
        novaQuantidade += quantidade;
        incrementoProduto = quantidade;
      }

      const movimentacao = await tx.movimentacaoLote.create({
        data: {
          loteId,
          tipo,
          quantidade,
        },
      });

      await tx.lote.update({
        where: { id: loteId },
        data: { quantidadeAtual: novaQuantidade },
      });

      await tx.produto.update({
        where: { id: lote.produtoId },
        data: {
          estoqueAtual: {
            increment: incrementoProduto,
          },
        },
      });

      return movimentacao;
    });
  }

  async getMovimentacoesByLoteId(loteId: string) {
    await this.getById(loteId); // Garante que o lote existe
    return await prisma.movimentacaoLote.findMany({
      where: { loteId },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }
}