import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

export const createProductService = async (data: any) => {
  console.log("Dados recebidos para criação do produto:", data);
  const product = await prisma.produto.findUnique({
    where: { nome: data.nome },
  });

  if (product) {
    throw new CustomError("Produto já existe", 400);
  }

  const createProduct = await prisma.produto.create({
    data: {
      ...data,
      estoqueAtual: 0, // Estoque inicial é sempre 0
    },
  });

  return createProduct;
};

export const getProductsService = async () => {
  const products = await prisma.produto.findMany({
    include: {
      categoria: true,
      fornecedor: true,
      Lote: true,

    },
  });
  return products;
};

export const getProductByIdService = async (id: string) => {
  const product = await prisma.produto.findUnique({
    where: { id },
  });
  if (!product) {
    throw new CustomError("Produto não encontrado", 404);
  }
  return product;
};

export const updateProductService = async (id: string, data: any) => {
  const productData = await prisma.produto.findUnique({
    where: { id },
  });

  if (!productData) {
    throw new CustomError("Produto não encontrado", 404);
  }

  // O estoque não deve ser atualizado diretamente aqui.
  // As atualizações de estoque são feitas através de movimentações de lote.
  delete data.estoqueAtual;

  const product = await prisma.produto.update({
    where: { id },
    data,
  });

  return product;
};



export const deleteProductService = async (id: string) => {
  if (!id) {
    throw new CustomError("ID do produto é obrigatório", 400);
  }

  const product = await prisma.produto.findUnique({
    where: { id },
  });

  if (!product) {
    throw new CustomError("Produto não encontrado", 404);
  }

  const deletedProduct = await prisma.produto.delete({
    where: { id },
  });

  return deletedProduct;
};

export const addCategoryToProductService = async (
  productId: string,
  categoryId: string
) => {
  const product = await prisma.produto.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new CustomError("Produto não encontrado", 404);
  }

  const category = await prisma.categoriaProduto.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new CustomError("Categoria não encontrada", 404);
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
};

export const addSupplierToProductService = async (
  productId: string,
  supplierId: string
) => {
  const product = await prisma.produto.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new CustomError("Produto não encontrado", 404);
  }

  const supplier = await prisma.fornecedor.findUnique({
    where: { id: supplierId },
  });

  if (!supplier) {
    throw new CustomError("Fornecedor não encontrado", 404);
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
};
