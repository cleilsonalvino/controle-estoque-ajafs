import { Prisma, PrismaClient } from "@prisma/client";
import { CustomError } from "../../shared/errors";

const prisma = new PrismaClient();

export const createProductService = async (data: any, empresaId: string) => {
  // Verifica se já existe produto com o mesmo nome ou código de barras na mesma empresa
  const existingProduct = await prisma.produto.findFirst({
    where: {
      empresaId,
      OR: [{ nome: data.nome }, { codigoBarras: data.codigoBarras }],
    },
  });

  if (existingProduct) {
    if (existingProduct.nome === data.nome) {
      throw new CustomError("O nome desse Produto já está em uso.", 400);
    }
    if (existingProduct.codigoBarras === data.codigoBarras) {
      throw new CustomError(
        "O código de barras desse Produto já está em uso.",
        400
      );
    }
  }

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

  const createProduct = await prisma.produto.create({
    data: {
      ...data,
      empresaId,
      codigoBarras,
    },
  });

  return createProduct;
};

export const createMarcaProdutoService = async (nome: string, empresaId: string) => {
  const marca = await prisma.marca.create({
    data: {
      nome,
      empresaId,
    },
  });
  return marca;
}


export const getProductsService = async (empresaId: string) => {
  const products = await prisma.produto.findMany({
    where: { empresaId },
    include: {
      categoria: true,
      fornecedor: true,
      lote: {
        include: {
          fornecedor: true,
        },
      },
      marca: {
        select:{
          nome: true
        }
      },
    },
  });

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

export const getMarcaProdutosService = async (empresaId: string) => {
  const marcas = await prisma.marca.findMany({
    where: { empresaId },
  });
  return marcas;
}

export const getProductByIdService = async (id: string, empresaId: string) => {
  const product = await prisma.produto.findFirst({
    where: { id, empresaId },
    include: {
      lote: true,
    },
  });
  if (!product) {
    throw new CustomError("Produto não encontrado", 404);
  }
  return product;
};

export const updateProductService = async (
  id: string,
  data: any,
  empresaId: string
) => {
  await getProductByIdService(id, empresaId);

  const product = await prisma.produto.update({
    where: { id, empresaId },
    data,
  });

  return product;
};

export const deleteProductService = async (id: string, empresaId: string) => {
  await getProductByIdService(id, empresaId);

  const deletedProduct = await prisma.produto.delete({
    where: { id, empresaId },
  });

  return deletedProduct;
};

export const addCategoryToProductService = async (
  productId: string,
  categoryId: string,
  empresaId: string
) => {
  await getProductByIdService(productId, empresaId);

  const category = await prisma.categoriaProduto.findFirst({
    where: { id: categoryId, empresaId },
  });

  if (!category) {
    throw new CustomError("Categoria não encontrada", 404);
  }

  const updatedProduct = await prisma.produto.update({
    where: { id: productId, empresaId },
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
  supplierId: string,
  empresaId: string
) => {
  await getProductByIdService(productId, empresaId);

  const supplier = await prisma.fornecedor.findFirst({
    where: { id: supplierId, empresaId },
  });

  if (!supplier) {
    throw new CustomError("Fornecedor não encontrado", 404);
  }

  const updatedProduct = await prisma.produto.update({
    where: { id: productId, empresaId },
    data: {
      fornecedor: {
        connect: { id: supplierId },
      },
    },
  });

  return updatedProduct;
};

