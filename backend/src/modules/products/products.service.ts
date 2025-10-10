import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createProductService = async (data: any) => {
  const product = await prisma.produto.create({
    data,
  });
  return product;
};

export const getProductsService = async () => {
  const products = await prisma.produto.findMany();
  return products;
};

export const getProductByIdService = async (id: string) => {
  const product = await prisma.produto.findUnique({
    where: { id },
  });
  if (!product) {
    throw new AppError("Produto não encontrado", 404);
  }
  return product;
};

export const updateProductService = async (id: string, data: any) => {
  const product = await prisma.produto.update({
    where: { id },
    data,
  });
  return product;
};

export const deleteProductService = async (id: string) => {
  await prisma.produto.delete({
    where: { id },
  });
};