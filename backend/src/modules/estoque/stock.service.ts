import { PrismaClient } from '@prisma/client';
import { type CreateMovimentacaoDto } from './stock.dto.ts';
import { AppError } from '../../shared/errors.ts';

const prisma = new PrismaClient();

export class StockService {
  // ========== Movimentações ==========
    public async createMovimentacao(data: CreateMovimentacaoDto) {
      const { produtoId, tipo, quantidade, observacao } = data;

      return prisma.$transaction(async (tx) => {
        const produto = await tx.produto.findUnique({
          where: { id: produtoId },
        });

        if (!produto) {
          throw new AppError('Produto não encontrado', 404);
        }

        let novoEstoque = produto.estoqueAtual.toNumber();

        switch (tipo) {
          case 'ENTRADA':
            novoEstoque += quantidade;  
            break;
          case 'SAIDA':
            novoEstoque -= quantidade;
            break;
          case 'AJUSTE':
            novoEstoque = quantidade;
            break;
          default:
            throw new AppError('Tipo de movimentação inválido', 400);
        }

        if (novoEstoque < 0) {
          throw new AppError('Estoque insuficiente', 400);
        }

        const movimentacao = await tx.movimentacao.create({
          data: {
            produtoId,
            tipo,
            quantidade,
            observacao: observacao ?? null,
          },
        });

        await tx.produto.update({
          where: { id: produtoId },
          data: { estoqueAtual: novoEstoque },
        });

        return movimentacao;
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

  // ========== Indicadores de Gestão de Estoque ==========

  /** Soma total de unidades no estoque (quantitativo) */
  public async getTotalEstoque() {
    const produtos = await prisma.produto.findMany({
      select: { estoqueAtual: true },
    });

    return produtos.reduce((total, p) => total + p.estoqueAtual.toNumber(), 0);
  }

  /** Valor financeiro total do estoque (quantidade * custoUnitario) */
  public async getValorTotalEstoque() {
    const produtos = await prisma.produto.findMany({
      select: { estoqueAtual: true, preco: true },
    });

    return produtos.reduce(
      (total, p) => total + p.estoqueAtual.toNumber() * (p.preco?.toNumber() ?? 0),
      0
    );
  }

  /** Produtos com estoque abaixo de um limite */
public async getProdutosComBaixoEstoque() {
  return prisma.produto.findMany({
    where: {
      // Verifica se estoqueAtual é menor ou igual ao estoqueMinimo definido
      AND: [
        { estoqueMinimo: { not: null } }, // só considera produtos com estoqueMinimo definido
        { estoqueAtual: { lte: prisma.produto.fields.estoqueMinimo } } // <= estoqueMinimo
      ]
    },
    select: {
      id: true,
      nome: true,
      estoqueAtual: true,
      estoqueMinimo: true,
    },
    orderBy: { estoqueAtual: 'asc' },
  });
}


  /** Giro de estoque: saídas / estoque médio em um período */
  public async getGiroDeEstoque(produtoId: string, periodoDias = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodoDias);

    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      select: { estoqueAtual: true },
    });

    if (!produto) throw new AppError('Produto não encontrado', 404);

    const saidas = await prisma.movimentacao.aggregate({
      _sum: { quantidade: true },
      where: {
        produtoId,
        tipo: 'SAIDA',
        criadoEm: { gte: dataInicio },
      },
    });

    const saidasTotais = Number(saidas._sum.quantidade ?? 0);
    const estoqueMedio = produto.estoqueAtual.toNumber() / 2; // simplificação

    return estoqueMedio > 0 ? saidasTotais / estoqueMedio : 0;
  }

  /** Resumo de movimentações em um período */
  public async getResumoMovimentacoes(periodoDias = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodoDias);

    const agregados = await prisma.movimentacao.groupBy({
      by: ['tipo'],
      _sum: { quantidade: true },
      where: { criadoEm: { gte: dataInicio } },
    });

    return {
      entradas: agregados.find(a => a.tipo === 'ENTRADA')?._sum.quantidade ?? 0,
      saidas: agregados.find(a => a.tipo === 'SAIDA')?._sum.quantidade ?? 0,
      ajustes: agregados.find(a => a.tipo === 'AJUSTE')?._sum.quantidade ?? 0,
    };
  }

  /** Histórico de variação de estoque de um produto */
  public async getEvolucaoEstoque(produtoId: string, periodoDias = 30) {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - periodoDias);

    return prisma.movimentacao.findMany({
      where: { produtoId, criadoEm: { gte: dataInicio } },
      orderBy: { criadoEm: 'asc' },
      select: {
        tipo: true,
        quantidade: true,
        criadoEm: true,
      },
    });
  }
}
