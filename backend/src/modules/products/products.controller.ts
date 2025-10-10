import { type Request, type Response } from "express";
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
} from "./products.service.ts";

export const createProductController = async (req: Request, res: Response) => {
  const product = await createProductService(req.body);
  res.status(201).json(product);
};

export const getProductsController = async (req: Request, res: Response) => {
  const products = await getProductsService();
  res.status(200).json(products);
};

export const getProductByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await getProductByIdService(id as string);
  res.status(200).json(product);
};

export const updateProductController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = await updateProductService(id as string, req.body);
  res.status(200).json(product);
};

export const deleteProductController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteProductService(id as string);
  res.status(204).send();
};