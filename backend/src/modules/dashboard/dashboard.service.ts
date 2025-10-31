import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DashboardService {
  // Dados gerais do sistema
  static async getOverview() {
    try {
      const [
        totalProdutos,
        totalVendas,
        totalClientes,
        totalFornecedores,
        totalServicos,
        totalVendedores,
      ] = await Promise.all([
        prisma.produto.count(),
        prisma.venda.count(),
        prisma.cliente.count(),
        prisma.fornecedor.count(),
        prisma.servico.count(),
        prisma.vendedor.count(),
      ]);

      // Total de estoque (somando todos os lotes)
      const estoqueGeral = await prisma.lote.aggregate({
        _sum: { quantidadeAtual: true },
      });

      // Últimas 5 vendas
      const ultimasVendas = await prisma.venda.findMany({
        orderBy: { criadoEm: "desc" },
        take: 5,
        select: {
          numero: true,
          total: true,
          criadoEm: true,
          cliente: { select: { nome: true } },
          vendedor: { select: { nome: true } },
        },
      });

      const produtos = await prisma.produto.findMany({
        include: {
          lote: {
            select: { quantidadeAtual: true },
          },
        },
      });

      const produtosCriticos = produtos
        .map((p) => ({
          nome: p.nome,
          estoqueMinimo: Number(p.estoqueMinimo) || 0,
          quantidadeTotal: p.lote.reduce(
            (soma, l) => soma + Number(l.quantidadeAtual || 0),
            0
          ),
        }))
        .filter((p) => p.quantidadeTotal <= p.estoqueMinimo)
        .slice(0, 5);

      return {
        totalProdutos,
        totalVendas,
        totalClientes,
        totalFornecedores,
        totalServicos,
        totalVendedores,
        estoqueTotal: estoqueGeral._sum.quantidadeAtual ?? 0,
        ultimasVendas,
        produtosCriticos,
      };
    } catch (error) {
      console.error("Erro no DashboardService.getOverview:", error);
      throw new Error("Falha ao carregar dados do dashboard");
    }
  }
}
