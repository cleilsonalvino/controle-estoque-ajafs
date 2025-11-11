import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";

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
    if (!data.nome || !data.cnpj) {
      throw new CustomError("Nome e CNPJ são obrigatórios.", 400);
    }
    return prisma.empresa.create({ data });
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
  update: async (id: string, data: any, empresaId?: string, superAdmin = false) => {
    if (!superAdmin && id !== empresaId) {
      throw new CustomError("Acesso não autorizado.", 403);
    }

    const exists = await prisma.empresa.findUnique({ where: { id } });
    if (!exists) {
      throw new CustomError("Empresa não encontrada.", 404);
    }

    return prisma.empresa.update({
      where: { id },
      data,
    });
  },

  // 🔹 Deletar empresa (somente super-admin)
  remove: async (id: string, superAdmin = false) => {
    if (!superAdmin) {
      throw new CustomError("Acesso negado. Apenas o Super Admin pode remover empresas.", 403);
    }

    const empresa = await prisma.empresa.findUnique({ where: { id } });
    if (!empresa) {
      throw new CustomError("Empresa não encontrada.", 404);
    }

    return prisma.empresa.delete({ where: { id } });
  },

  // 🔹 🔥 Estatísticas para o painel de gestão
  getDashboardStats: async () => {
    const totalEmpresas = await prisma.empresa.count();
    const totalUsuarios = await prisma.usuario.count();
    const totalProdutos = await prisma.produto.count();
    const totalVendas = await prisma.venda.count();
    const empresas = await prisma.empresa.findMany();

    const topEmpresas = await prisma.venda.groupBy({
      by: ["empresaId"],
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    });

    const vendasMensais = await prisma.$queryRawUnsafe(`
      SELECT 
        e.nome as empresa,
        DATE_TRUNC('month', v."criadoEm") as mes,
        SUM(v.total) as total
      FROM "Venda" v
      JOIN "Empresa" e ON e.id = v."empresaId"
      WHERE v."criadoEm" > NOW() - INTERVAL '6 months'
      GROUP BY e.nome, mes
      ORDER BY mes ASC;
    `);

    return {
      totalEmpresas,
      totalUsuarios,
      totalProdutos,
      totalVendas,
      topEmpresas,
      vendasMensais,
      empresas,
    };
  },
};
