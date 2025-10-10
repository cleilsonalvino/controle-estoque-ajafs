import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

// Venda Services

export const createVendaService = async (data: any) => {
  const { itens, ...vendaData } = data;

  const venda = await prisma.$transaction(async (prisma) => {
    const novaVenda = await prisma.venda.create({
      data: vendaData,
    });

    const itensVenda = itens.map((item: any) => ({
      ...item,
      vendaId: novaVenda.id,
    }));

    await prisma.itemVenda.createMany({
      data: itensVenda,
    });

    return novaVenda;
  });

  return venda;
};

export const getVendasService = async () => {
  const vendas = await prisma.venda.findMany({ include: { itens: true } });
  return vendas;
};

export const getVendaByIdService = async (id: string) => {
  const venda = await prisma.venda.findUnique({
    where: { id },
    include: { itens: true },
  });
  if (!venda) {
    throw new AppError("Venda não encontrada", 404);
  }
  return venda;
};

export const updateVendaService = async (id: string, data: any) => {
  const venda = await prisma.venda.update({
    where: { id },
    data,
  });
  return venda;
};

export const deleteVendaService = async (id: string) => {
  await prisma.venda.delete({
    where: { id },
  });
};