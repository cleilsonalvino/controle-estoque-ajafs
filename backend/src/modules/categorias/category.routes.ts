import { Router } from "express";

import {
  createCategoryController,
  getCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController,
} from "./category.controller.ts";

const categorysRouter = Router();

categorysRouter.post("/create", createCategoryController);
categorysRouter.get("/", getCategoriesController);
categorysRouter.get("/:id", getCategoryByIdController);
categorysRouter.put("/:id", updateCategoryController);
categorysRouter.delete("/:id", deleteCategoryController);

export default categorysRouter;