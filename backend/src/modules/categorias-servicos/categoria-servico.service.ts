import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createCategoriaServicoService = async (data: any) => {
  const categoria = await prisma.categoriaServico.create({
    data,
  });
  return categoria;
}

export const getCategoriasServicosService = async () => {
  const categorias = await prisma.categoriaServico.findMany();
  return categorias;
}

export const getCategoriaServicoByIdService = async (id: string) => {
  const categoria = await prisma.categoriaServico.findUnique({
    where: { id },
  });
  if (!categoria) {
    throw new CustomError("Categoria de Servico nao encontrada", 404);
  }
  return categoria;
}

export const updateCategoriaServicoService = async (id: string, data: any) => {
  const categoria = await prisma.categoriaServico.update({
    where: { id },
    data,
  });
  return categoria;
}

export const deleteCategoriaServicoService = async (id: string) => {
  await prisma.categoriaServico.delete({
    where: { id },
  });
}
