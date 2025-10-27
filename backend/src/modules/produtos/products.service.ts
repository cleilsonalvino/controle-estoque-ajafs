import { PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors.ts";

const prisma = new PrismaClient();

import { Prisma } from "@prisma/client";

export const createProductService = async (data: any) => {
  console.log("Dados recebidos para criação do produto:", data);

  // Verifica se já existe produto com o mesmo nome
  const product = await prisma.produto.findUnique({
    where: { nome: data.nome },
  });

  if (product) {
    throw new CustomError("Produto já existe", 400);
  }

  // Função para gerar código de barras EAN-13 válido
  const criarBarCode = () => {
    const prefix = "789";
    const randomDigits = Array.from({ length: 9 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    const partialCode = prefix + randomDigits;

    let sum = 0;
    for (let i = 0; i < partialCode.length; i++) {
      const digit = parseInt(partialCode.charAt(i), 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }

    const mod = sum % 10;
    const checkDigit = mod === 0 ? 0 : 10 - mod;
    return partialCode + checkDigit.toString();
  };

  const codigoBarras = data.codigoBarras?.trim() || criarBarCode();

  // Converte precoVenda e estoqueMinimo para Decimal
  const precoVendaDecimal = new Prisma.Decimal(data.precoVenda || "0");
  const estoqueMinimoDecimal = new Prisma.Decimal(data.estoqueMinimo || "0");

  const createProduct = await prisma.produto.create({
    data: {
      nome: data.nome,
      descricao: data.descricao,
      precoVenda: precoVendaDecimal,
      urlImage: data.urlImage,
      estoqueMinimo: estoqueMinimoDecimal,
      categoriaId: data.categoriaId,
      codigoBarras,
    },
  });

  return createProduct;
};




export const getProductsService = async () => {
const products = await prisma.produto.findMany({
  include: {
    categoria: true,
    fornecedor: true, // fornecedor direto do produto
    lote: {
      include: {
        fornecedor: true, // fornecedor do lote
      },
    },
  },
});

// Adiciona quantidade total em estoque
const productsWithTotal = products.map((p) => ({
  ...p,
  quantidadeTotal: p.lote.reduce(
    (acc, lote) => acc + Number(lote.quantidadeAtual),
    0
  ),
}));

const productsWithTotalCosted = productsWithTotal.map((p) => {
  let totalValor = 0;
  let totalQuantidade = 0;

  p.lote.forEach((lote) => {
    const precoCusto = Number(lote.precoCusto) || 0;
    const quantidadeAtual = Number(lote.quantidadeAtual) || 0;
    totalValor += precoCusto * quantidadeAtual;
    totalQuantidade += quantidadeAtual;
  });

  const custoMedio = totalQuantidade > 0 ? totalValor / totalQuantidade : 0;

  return {
    ...p,
    custoMedio,
  };
});



return productsWithTotalCosted;

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
