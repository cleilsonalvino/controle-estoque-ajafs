import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import os from "os";

const prisma = new PrismaClient();

export const empresaService = {
  // 🔹 Listar todas as empresas (modo Super Admin)
  getAll: async () => {
    return prisma.empresa.findMany({
      orderBy: { criadoEm: "desc" },
      include: {
        usuarios: true,
        produtos: true,
        vendas: true,
      },
    });
  },

  // 🔹 Criar uma nova empresa
  create: async (data: any) => {
    if (!data.nome_fantasia && !data.razao_social) {
      throw new CustomError(
        "Nome Fantasia ou Razão Social são obrigatórios.",
        400
      );
    }

    if (!data.cnpj) {
      throw new CustomError("CNPJ é obrigatório.", 400);
    }

    // gerar senha provisória
    const senhaProvisoria = "admin123";
    const senhaHash = await bcrypt.hash(senhaProvisoria, 10);

    // transação → cria empresa + usuário
    const result = await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.create({
        data: {
          nome_fantasia: data.nome_fantasia,
          cnpj: data.cnpj,
          telefone: data.telefone,
          email: data.email,
          razao_social: data.razao_social,
          inscEstadual: data.inscEstadual,
          inscMunicipal: data.inscMunicipal,
          cnae: data.cnae,
          cep: data.cep,
          estado: data.estado,
          cidade: data.cidade,
          endereco: data.endereco,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
        },
      });

      const usuario = await tx.usuario.create({
        data: {
          nome: empresa.nome_fantasia,
          email: empresa.email ?? `${empresa.cnpj}@empresa.com`,
          senha: senhaHash,
          papel: "ADMINISTRADOR",
          empresaId: empresa.id,
          telasPermitidas: [
            "/",
            "/estoque",
            "/dashboard-sales",
            "/pos-venda",
            "/sales",
            "/ordens-de-servico",
            "/products",
            "/categories",
            "/movements",
            "/suppliers",
            "/tipos-servicos",
            "/service-categories",
            "/clientes",
            "/vendedores",
            "/financeiro",
            "/financeiro/movimentacoes",
            "/financeiro/contas-a-pagar",
            "/financeiro/contas-a-receber",
            "/financeiro/contas-bancarias",
            "/financeiro/categorias",
            "/financeiro/relatorios",
            "/settings",
          ],
        },
      });

      return {
        empresa,
        usuario: {
          nome: usuario.nome,
          email: usuario.email,
          papel: usuario.papel,
        },
        senhaProvisoria,
      };
    });

    return result;
  },

  // 🔹 Buscar empresa por ID (com acesso restrito)
  getById: async (id: string, empresaId?: string, superAdmin = false) => {
    if (!superAdmin && id !== empresaId) {
      throw new CustomError("Acesso não autorizado.", 403);
    }

    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: {
        usuarios: true,
        produtos: true,
        vendas: true,
      },
    });

    if (!empresa) {
      throw new CustomError("Empresa não encontrada.", 404);
    }

    return empresa;
  },

  // 🔹 Atualizar empresa (com controle opcional de acesso)
  update: async (
    id: string,
    data: any,
  ) => {

    const oldEmpresa = await prisma.empresa.findUnique({ where: { id } });
    if (!oldEmpresa) {
      throw new CustomError("Empresa não encontrada.", 404);
    }

    // Se uma nova imagem foi enviada, deleta a antiga
    if (data.logoEmpresa && oldEmpresa.logoEmpresa) {
      const oldImagePath = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        oldEmpresa.logoEmpresa
      );
      fs.unlink(oldImagePath, (err) => {
        if (err) console.error("Erro ao deletar logo antigo:", err);
      });
    }

    return prisma.empresa.update({
      where: { id },
      data,
    });
  },

  // 🔹 Deletar empresa (somente super-admin)
  remove: async (id: string, superAdmin = false) => {
    if (!superAdmin) {
      throw new CustomError(
        "Acesso negado. Apenas o Super Admin pode remover empresas.",
        403
      );
    }

    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new CustomError("Empresa não encontrada.", 404);
    }

    await prisma.empresa.delete({ where: { id } });

    // Deleta a imagem associada
    if (empresa.logoEmpresa) {
      const imagePath = path.resolve(
        __dirname,
        "..",
        "..",
        "..",
        empresa.logoEmpresa
      );
      fs.unlink(imagePath, (err) => {
        if (err) console.error("Erro ao deletar logo da empresa:", err);
      });
    }
  },

  // =============================================================
  // 📊 SUPER DASHBOARD MULTIEMPRESA – COMPLETO (12 GRUPOS)
  // =============================================================
  getDashboardStats: async () => {
    // -----------------------------------------
    // 1) EMPRESAS E USUÁRIOS
    // -----------------------------------------
    const totalEmpresas = await prisma.empresa.count();
    const totalUsuarios = await prisma.usuario.count();

    const usuariosPorPapel = await prisma.usuario.groupBy({
      by: ["papel"],
      _count: { id: true },
    });

    // -----------------------------------------
    // 2) PRODUTOS E ESTOQUE
    // -----------------------------------------
    const totalProdutos = await prisma.produto.count();

    const estoqueCritico = await prisma.produto.count({
      where: {
        estoqueMinimo: { not: null },
        lote: {
          some: {
            quantidadeAtual: { lte: 0 }, // Ajusta conforme sua lógica
          },
        },
      },
    });

    const lotesProximosVencimento = await prisma.lote.count({
      where: {
        validade: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
        },
      },
    });

    const movimentacoesEstoqueHoje = await prisma.movimentacao.count({
      where: { criadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    });

    // -----------------------------------------
    // 3) VENDAS
    // -----------------------------------------
    const totalVendas = await prisma.venda.count();

    const vendasHoje = await prisma.venda.count({
      where: {
        criadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    const vendasUltimos7Dias = await prisma.venda.count({
      where: {
        criadoEm: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const ticketMedioGeralQuery = await prisma.venda.aggregate({
      _avg: { total: true },
    });

    const ticketMedioGeral = ticketMedioGeralQuery._avg.total ?? 0;

    // Ranking
    const topEmpresasRaw = await prisma.venda.groupBy({
      by: ["empresaId"],
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const topEmpresas = await Promise.all(
      topEmpresasRaw.map(async (r) => {
        const emp = await prisma.empresa.findUnique({
          where: { id: r.empresaId },
        });
        return {
          id: r.empresaId,
          nome_fantasia: emp?.nome_fantasia ?? "",
          cidade: emp?.cidade ?? "",
          totalVendas: Number(r._sum.total ?? 0),
        };
      })
    );

    // Vendas mensais (últimos 6 meses)
    const vendasMensais = await prisma.$queryRawUnsafe(`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', v."criadoEm"), 'YYYY-MM') as mes,
      SUM(v.total)::numeric AS total
    FROM "Venda" v
    WHERE v."criadoEm" >= NOW() - INTERVAL '6 months'
    GROUP BY mes
    ORDER BY mes ASC;
  `);

    // Vendas por forma de pagamento
    const vendasPorFormaPagamento = await prisma.venda.groupBy({
      by: ["formaPagamento"],
      _sum: { total: true },
    });

    // Vendas por empresa no mês atual
    const vendasPorEmpresaMesAtual = await prisma.$queryRawUnsafe(`
    SELECT
      e.id AS "empresaId",
      e.nome_fantasia AS "empresaNome",
      SUM(v.total) AS total
    FROM "Venda" v
    JOIN "Empresa" e ON e.id = v."empresaId"
    WHERE DATE_TRUNC('month', v."criadoEm") = DATE_TRUNC('month', NOW())
    GROUP BY e.id, e.nome_fantasia
    ORDER BY total DESC;
  `);

    // Produtos mais vendidos
    const topProdutos = await prisma.$queryRawUnsafe(`
    SELECT 
      p.id,
      p.nome,
      SUM(iv.quantidade) AS "totalVendido"
    FROM "ItemVenda" iv
    JOIN "Produto" p ON p.id = iv."produtoId"
    GROUP BY p.id, p.nome
    ORDER BY "totalVendido" DESC
    LIMIT 5;
  `);

    // Vendedores mais fortes
    const topVendedores = await prisma.$queryRawUnsafe(`
    SELECT 
      vdr.id,
      vdr.nome,
      SUM(v.total) as "totalVendido"
    FROM "Venda" v
    JOIN "Vendedor" vdr ON vdr.id = v."vendedorId"
    GROUP BY vdr.id, vdr.nome
    ORDER BY "totalVendido" DESC
    LIMIT 5;
  `);

    // -----------------------------------------
    // 4) FINANCEIRO
    // -----------------------------------------

    const saldoFinanceiroGlobal = await prisma.$queryRawUnsafe<
      { saldo: number }[]
    >(`
  SELECT COALESCE(SUM("saldoAtual"), 0) AS saldo 
  FROM "ContaBancaria";
`);

    const totalContasPagarAbertas = await prisma.contaPagar.count({
      where: { status: "PENDENTE" },
    });

    const totalContasReceberAbertas = await prisma.contaReceber.count({
      where: { status: "PENDENTE" },
    });

    const valorContasPagarAtrasadasQuery = await prisma.$queryRawUnsafe<
      { total: number }[]
    >(`
  SELECT COALESCE(SUM("valorTotal" - "valorPago"), 0) AS total
  FROM "ContaPagar"
  WHERE "dataVencimento" < NOW() AND status != 'PAGO';
`);

    const valorContasReceberVencendoQuery = await prisma.$queryRawUnsafe<
      { total: number }[]
    >(`
  SELECT COALESCE(SUM("valorTotal" - "valorRecebido"), 0) AS total
  FROM "ContaReceber"
  WHERE "dataVencimento" BETWEEN NOW() AND NOW() + INTERVAL '5 days';
`);

    const fluxoCaixaMensal = await prisma.$queryRawUnsafe(`
    SELECT 
      TO_CHAR(DATE_TRUNC('month', data), 'YYYY-MM') AS competencia,
      SUM(CASE WHEN tipo = 'ENTRADA' THEN valor ELSE 0 END) AS entradas,
      SUM(CASE WHEN tipo = 'SAIDA' THEN valor ELSE 0 END) AS saidas
    FROM "MovimentacaoFinanceira"
    GROUP BY competencia
    ORDER BY competencia ASC;
  `);

    // -----------------------------------------
    // 6) CLIENTES
    // -----------------------------------------
    const totalClientes = await prisma.cliente.count();

    const clientesNovosUltimos30Dias = await prisma.cliente.count({
      where: {
        criadoEm: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    const topClientes = await prisma.$queryRawUnsafe(`
    SELECT 
      c.id,
      c.nome,
      SUM(v.total) AS "totalComprado"
    FROM "Venda" v
    JOIN "Cliente" c ON c.id = v."clienteId"
    GROUP BY c.id, c.nome
    ORDER BY "totalComprado" DESC
    LIMIT 5;
  `);

    // -----------------------------------------
    // 7) ORDENS DE SERVIÇO
    // -----------------------------------------
    const totalOrdensServico = await prisma.ordemDeServico.count();

    const ordensServicoPorStatus = await prisma.ordemDeServico.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // -----------------------------------------
    // 8) PÓS-VENDA
    // -----------------------------------------
    const totalPosVendas = await prisma.posVenda.count();

    const posVendaPorStatus = await prisma.posVenda.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const satisfacaoMediaQuery = await prisma.feedbackCliente.aggregate({
      _avg: { avaliacao: true },
    });

    const satisfacaoMedia = satisfacaoMediaQuery._avg.avaliacao ?? 0;

    // -----------------------------------------
    // 10) FORNECEDORES & LOTES
    // -----------------------------------------
    const totalFornecedores = await prisma.fornecedor.count();
    const totalLotes = await prisma.lote.count();

    // -----------------------------------------
    // 11) INFRAESTRUTURA (mock / futuro)
    // -----------------------------------------
    const apiStatus = "OK";
    const apiLatenciaMediaMs = 42;
    const apiRequests24h = 12487;
    const apiErros24h = 4;

    // -----------------------------------------
    // 12) ATIVIDADES RECENTES
    // -----------------------------------------
    const atividadesRecentes = await prisma.$queryRawUnsafe(`
  SELECT 
    v.id,
    'VENDA' as tipo,
    'Nova venda registrada' as descricao,
    v."criadoEm" as data,
    e.nome_fantasia AS "empresaNome",
    e.id   AS "empresaId"
  FROM "Venda" v
  JOIN "Empresa" e ON e.id = v."empresaId"
  ORDER BY v."criadoEm" DESC
  LIMIT 10;
`);

    // ==========================================================
    // RETORNO FINAL (tudo no formato DashboardStats)
    // ==========================================================
    return {
      totalEmpresas,
      totalUsuarios,
      usuariosPorPapel: usuariosPorPapel.map((u) => ({
        papel: u.papel,
        total: u._count.id,
      })),

      totalProdutos,
      estoqueCritico,
      lotesProximosVencimento,
      movimentacoesEstoqueHoje,

      totalVendas,
      vendasHoje,
      vendasUltimos7Dias,
      ticketMedioGeral,
      topEmpresas,
      vendasMensais,
      vendasPorFormaPagamento: vendasPorFormaPagamento.map((v) => ({
        forma: v.formaPagamento ?? "Indefinido",
        total: Number(v._sum.total ?? 0),
      })),
      vendasPorEmpresaMesAtual,
      topProdutos,
      topVendedores,

      saldoFinanceiroGlobal: Number(saldoFinanceiroGlobal[0]?.saldo ?? 0),
      totalContasPagarAbertas,
      totalContasReceberAbertas,
      valorContasPagarAtrasadas: Number(
        valorContasPagarAtrasadasQuery[0]?.total ?? 0
      ),
      valorContasReceberVencendo: Number(
        valorContasReceberVencendoQuery[0]?.total ?? 0
      ),
      fluxoCaixaMensal,

      totalClientes,
      clientesNovosUltimos30Dias,
      topClientes,

      totalOrdensServico,
      ordensServicoPorStatus: ordensServicoPorStatus.map((o) => ({
        status: o.status,
        quantidade: o._count.id,
      })),

      totalPosVendas,
      posVendaPorStatus: posVendaPorStatus.map((p) => ({
        status: p.status,
        quantidade: p._count.id,
      })),
      satisfacaoMedia,

      totalFornecedores,
      totalLotes,

      apiStatus,
      apiLatenciaMediaMs,
      apiRequests24h,
      apiErros24h,

      atividadesRecentes,
    };
  },
};
