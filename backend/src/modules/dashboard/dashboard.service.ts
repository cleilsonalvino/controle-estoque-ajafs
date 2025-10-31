import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DashboardService {
  static async getOverview(empresaId: string) {
    try {
      const where = { empresaId };

      const [
        totalProdutos,
        totalVendas,
        totalClientes,
        totalFornecedores,
        totalServicos,
        totalVendedores,
      ] = await Promise.all([
        prisma.produto.count({ where }),
        prisma.venda.count({ where }),
        prisma.cliente.count({ where }),
        prisma.fornecedor.count({ where }),
        prisma.servico.count({ where }),
        prisma.vendedor.count({ where }),
      ]);

      const estoqueGeral = await prisma.lote.aggregate({
        where,
        _sum: { quantidadeAtual: true },
      });

      const ultimasVendas = await prisma.venda.findMany({
        where,
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
        where,
        include: {
          lote: {
            where: { empresaId },
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

