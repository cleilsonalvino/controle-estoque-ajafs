import { type Response } from "express";
import {
  createCategoryService,
  getCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from "./category.service";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

export const createCategoryController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const category = await createCategoryService(req.body, empresaId);
  res.status(201).json(category);
};

export const getCategoriesController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const categories = await getCategoriesService(empresaId);
  res.status(200).json(categories);
};

export const getCategoryByIdController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const category = await getCategoryByIdService(id as string, empresaId);
  res.status(200).json(category);
};

export const updateCategoryController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const category = await updateCategoryService(id as string, req.body, empresaId);
  res.status(200).json(category);
};
export const deleteCategoryController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteCategoryService(id as string, empresaId);
  res.status(204).send();
};
