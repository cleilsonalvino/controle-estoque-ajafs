import {type Request, type Response } from "express";
import {
  createCategoryService,
    getCategoriesService,
    getCategoryByIdService,
    updateCategoryService,
    deleteCategoryService,
} from "./category.service.ts";

export const createCategoryController = async (req: Request, res: Response) => {
  const category = await createCategoryService(req.body);
  res.status(201).json(category);
}

export const getCategoriesController = async (req: Request, res: Response) => {
  const categories = await getCategoriesService();
  res.status(200).json(categories);
}

export const getCategoryByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await getCategoryByIdService(id as string);
  res.status(200).json(category);
}

export const updateCategoryController = async (req: Request, res: Response) => {
    const { id } = req.params;
  const category = await updateCategoryService(id as string, req.body);
    res.status(200).json(category);
}
export const deleteCategoryController = async (req: Request, res: Response) => {
    const { id } = req.params;
  await deleteCategoryService(id as string);
    res.status(204).send();
}

