import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createCategoryService = async (data: any) => {
  const category = await prisma.categoriaProduto.create({
    data,
  });
  return category;
}

export const getCategoriesService = async () => {
  const categories = await prisma.categoriaProduto.findMany();
  return categories;
}
export const getCategoryByIdService = async (id: string) => {
  const category = await prisma.categoriaProduto.findUnique({
    where: { id },
  });
  if (!category) {
    throw new AppError("Categoria não encontrada", 404);
  }
  return category;
}

export const updateCategoryService = async (id: string, data: any) => {
  const category = await prisma.categoriaProduto.update({
    where: { id },
    data,
  });
  return category;
}

export const deleteCategoryService = async (id: string) => {
  await prisma.categoriaProduto.delete({
    where: { id },
  });
}