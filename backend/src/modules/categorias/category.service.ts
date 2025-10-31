import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";

const prisma = new PrismaClient();

export const createCategoryService = async (data: any, empresaId: string) => {
  const category = await prisma.categoriaProduto.create({
    data: {
      ...data,
      empresaId,
    },
  });
  return category;
};

export const getCategoriesService = async (empresaId: string) => {
  const categories = await prisma.categoriaProduto.findMany({
    where: { empresaId },
  });
  return categories;
};
export const getCategoryByIdService = async (id: string, empresaId: string) => {
  const category = await prisma.categoriaProduto.findFirst({
    where: { id, empresaId },
  });
  if (!category) {
    throw new CustomError("Categoria não encontrada", 404);
  }
  return category;
};

export const updateCategoryService = async (
  id: string,
  data: any,
  empresaId: string
) => {
  await getCategoryByIdService(id, empresaId);
  const category = await prisma.categoriaProduto.update({
    where: { id, empresaId },
    data,
  });
  return category;
};

export const deleteCategoryService = async (id: string, empresaId: string) => {
  await getCategoryByIdService(id, empresaId);
  await prisma.categoriaProduto.delete({
    where: { id, empresaId },
  });
};
