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
} from "./products.service.ts";
import { createProductSchema, updateProductSchema } from "./products.dto.ts";

export const createProductController = async (req: Request, res: Response) => {
  const validation = createProductSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do produto",
      details: validation.error.format(), // mostra exatamente o campo errado
    });
  }

  const product = await createProductService(validation.data);
  return res.status(201).json(product);
};

export const getProductsController = async (req: Request, res: Response) => {
  const products = await getProductsService();
  return res.status(200).json(products);
};

export const getProductByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await getProductByIdService(id as string);
  return res.status(200).json(product);
};

export const updateProductController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const validation = updateProductSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados do produto",
      details: validation.error.format(),
    });
  }

  const product = await updateProductService(id as string, validation.data);
  return res.status(200).json(product);
};

export const deleteProductController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteProductService(id as string);
  return res.status(204).send();
};

export const addCategoryToProductController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { categoryId } = req.body;
  const product = await addCategoryToProductService(id as string, categoryId);
  return res.status(200).json(product);
};

export const addSupplierToProductController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const { supplierId } = req.body;
  const product = await addSupplierToProductService(id as string, supplierId);
  return res.status(200).json(product);
};
