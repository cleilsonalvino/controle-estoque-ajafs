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
} from "./products.service";
import { createProductSchema, updateProductSchema } from "./products.dto";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

export const createProductController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  console.log("Empresa ID no createProductController:", req.body);
  const validation = createProductSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do produto",
      details: validation.error.format(), // mostra exatamente o campo errado
    });
  }

  const product = await createProductService(validation.data, empresaId);
  return res.status(201).json(product);
};

export const getProductsController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const products = await getProductsService(empresaId);
  return res.status(200).json(products);
};

export const getProductByIdController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const product = await getProductByIdService(id as string, empresaId);
  return res.status(200).json(product);
};

export const updateProductController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const validation = updateProductSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do produto",
      details: validation.error.format(),
    });
  }

  const product = await updateProductService(
    id as string,
    validation.data,
    empresaId
  );
  return res.status(200).json(product);
};

export const deleteProductController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteProductService(id as string, empresaId);
  return res.status(204).send();
};

export const addCategoryToProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const { categoryId } = req.body;
  const product = await addCategoryToProductService(
    id as string,
    categoryId,
    empresaId
  );
  return res.status(200).json(product);
};

export const addSupplierToProductController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const { supplierId } = req.body;
  const product = await addSupplierToProductService(
    id as string,
    supplierId,
    empresaId
  );
  return res.status(200).json(product);
};
