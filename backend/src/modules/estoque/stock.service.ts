import { PrismaClient, TipoMovimentacao } from '@prisma/client';
import { type CreateMovimentacaoDto } from './stock.dto.ts';
import { CustomError } from '../../shared/errors.ts';

const prisma = new PrismaClient();

export class StockService {
  public async createSaida(data: CreateMovimentacaoDto) {
    const { produtoId, quantidade, observacao } = data;

    return prisma.$transaction(async (tx) => {
      const produto = await tx.produto.findUnique({
        where: { id: produtoId },
        include: {
          Lote: {
            where: { quantidadeAtual: { gt: 0 } },
            orderBy: { dataCompra: 'asc' },
          },
        },
      });

      if (!produto) {
        throw new CustomError('Produto não encontrado', 404);
      }

      const estoqueTotal = produto.Lote.reduce(
        (acc, lote) => acc + lote.quantidadeAtual.toNumber(),
        0
      );

      if (estoqueTotal < quantidade) {
        throw new CustomError('Estoque insuficiente', 400);
      }

      let quantidadeRestante = quantidade;
      const movimentacoesLote = [];

      for (const lote of produto.Lote) {
        if (quantidadeRestante <= 0) break;

        const quantidadeASerRetirada = Math.min(
          lote.quantidadeAtual.toNumber(),
          quantidadeRestante
        );

        const novaQuantidadeLote = lote.quantidadeAtual.toNumber() - quantidadeASerRetirada;

        await tx.lote.update({
          where: { id: lote.id },
          data: { quantidadeAtual: novaQuantidadeLote },
        });

        const movimentacaoLote = await tx.movimentacaoLote.create({
          data: {
            loteId: lote.id,
            tipo: TipoMovimentacao.SAIDA,
            quantidade: quantidadeASerRetirada, // Ensure quantity is a number
            observacao: observacao ?? null, // Ensure observacao is string or null
          },
        });

        movimentacoesLote.push(movimentacaoLote);

        quantidadeRestante -= quantidadeASerRetirada;
      }

      const novoEstoqueProduto = produto.estoqueAtual.toNumber() - quantidade;

      await tx.produto.update({
        where: { id: produtoId },
        data: { estoqueAtual: novoEstoqueProduto },
      });

      // Cria uma movimentação geral para referência
      const movimentacaoGeral = await tx.movimentacao.create({
        data: {
          produtoId,
          tipo: TipoMovimentacao.SAIDA,
          quantidade,
          observacao: observacao ?? null,
        },
      });

      return { movimentacaoGeral, movimentacoesLote };
    });
  }

  public async getMovimentacoesByProdutoId(produtoId: string) {
    return prisma.movimentacao.findMany({
      where: { produtoId },
      orderBy: { criadoEm: 'desc' },
    });
  }

  public async getMovimentacoes() {
    return prisma.movimentacao.findMany({
      orderBy: { criadoEm: 'desc' },
      include: {
        produto: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  }
}