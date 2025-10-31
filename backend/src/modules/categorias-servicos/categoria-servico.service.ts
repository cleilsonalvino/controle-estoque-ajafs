import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createCategoriaServicoService = async (
  data: any,
  empresaId: string
) => {
  const categoria = await prisma.categoriaServico.create({
    data: {
      ...data,
      empresaId,
    },
  });
  return categoria;
};

export const getCategoriasServicosService = async (empresaId: string) => {
  const categorias = await prisma.categoriaServico.findMany({
    where: { empresaId },
  });
  return categorias;
};

export const getCategoriaServicoByIdService = async (
  id: string,
  empresaId: string
) => {
  const categoria = await prisma.categoriaServico.findFirst({
    where: { id, empresaId },
  });
  if (!categoria) {
    throw new CustomError("Categoria de Servico nao encontrada", 404);
  }
  return categoria;
};

export const updateCategoriaServicoService = async (
  id: string,
  data: any,
  empresaId: string
) => {
  await getCategoriaServicoByIdService(id, empresaId);
  const categoria = await prisma.categoriaServico.update({
    where: { id, empresaId },
    data,
  });
  return categoria;
};

export const deleteCategoriaServicoService = async (
  id: string,
  empresaId: string
) => {
  await getCategoriaServicoByIdService(id, empresaId);
  await prisma.categoriaServico.delete({
    where: { id, empresaId },
  });
};

