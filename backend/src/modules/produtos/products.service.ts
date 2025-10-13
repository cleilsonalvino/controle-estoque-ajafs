import { PrismaClient } from "@prisma/client";
import { AppError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createProductService = async (data: any) => {

  const product = await prisma.produto.findUnique({
    where: {nome: data.nome},
  });

  if (product) {
    throw new AppError("Produto já existe", 400);
  }


  const createProduct = await prisma.produto.create({
    data,
  });
  return createProduct;
};

export const getProductsService = async () => {
  const products = await prisma.produto.findMany({
    include: {
      categoria: true,
      fornecedor: true,
    }
  });
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

  if (!id) {
    throw new AppError("ID do produto é obrigatório", 400);
  }

  const product = await prisma.produto.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError("Produto não encontrado", 404);
  }


  const deletedProduct = await prisma.produto.delete({
    where: { id },
  });


  return deletedProduct;
};

export const addCategoryToProductService = async (productId: string, categoryId: string) => {
  const product = await prisma.produto.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Produto não encontrado", 404);
  }

  const category = await prisma.categoriaProduto.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("Categoria não encontrada", 404);
  }

  const updatedProduct = await prisma.produto.update({
    where: { id: productId },
    data: {
      categoria: {
        connect: { id: categoryId },
      },
    },
  });

  return updatedProduct;
}

export const addSupplierToProductService = async (productId: string, supplierId: string) => {
  const product = await prisma.produto.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError("Produto não encontrado", 404);
  }

  const supplier = await prisma.fornecedor.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new AppError("Fornecedor não encontrado", 404);
  }

  const updatedProduct = await prisma.produto.update({
    where: { id: productId },
    data: {
      fornecedor: {
        connect: { id: supplierId },
      },
    },
  });

  return updatedProduct;
}