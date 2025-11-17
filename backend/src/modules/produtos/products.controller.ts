// products.controller.ts
import { type Request, type Response } from "express";
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  addCategoryToProductService,
  addSupplierToProductService,
  createMarcaProdutoService,
  getMarcaProdutosService,
} from "./products.service";
import { createProductSchema, updateProductSchema } from "./products.dto";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

export const createProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;
  if (req.body.marcaId === "") req.body.marcaId = null;
  if (req.body.categoriaId === "") req.body.categoriaId = null;

  console.log("Arquivo enviado:", req.file);
if (req.file) {
  console.log("Nome original:", req.file.originalname);
  console.log("Caminho salvo:", req.file.path);
}


  console.log("Requisição para criar produto:", req.body);
  const validation = createProductSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do produto",
      details: validation.error.format(),
    });
  }

  const imagePath = req.file
    ? `uploads/produtos/${req.file.filename}`
    : undefined;

  const product = await createProductService(
    { ...validation.data, urlImage: imagePath },
    empresaId
  );
  return res.status(201).json(product);
};

export const createMarcaProdutoController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("Requisição para criar marca de produto:", req.body);
  const { empresaId } = req.user!;
  const { nome } = req.body;
  if (typeof nome !== "string" || nome.trim() === "") {
    return res
      .status(400)
      .json({
        message: "Nome da marca é obrigatório e deve ser uma string válida.",
      });
  }
  const marca = await createMarcaProdutoService(nome, empresaId);
  return res.status(201).json(marca);
};

export const getProductsController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;
  const products = await getProductsService(empresaId);
  return res.status(200).json(products);
};

export const getMarcaProdutosController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;
  const marcas = await getMarcaProdutosService(empresaId);
  return res.status(200).json(marcas);
};

export const getProductByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const product = await getProductByIdService(id as string, empresaId);
  return res.status(200).json(product);
};

export const updateProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const validation = updateProductSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do produto",
      details: validation.error.format(),
    });
  }

  const imagePath = req.file
    ? `uploads/produtos/${req.file.filename}`
    : undefined;

  const product = await updateProductService(
    id as string,
    { ...validation.data, urlImage: imagePath },
    empresaId
  );
  return res.status(200).json(product);
};

export const deleteProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteProductService(id as string, empresaId);
  return res.status(204).send();
};
