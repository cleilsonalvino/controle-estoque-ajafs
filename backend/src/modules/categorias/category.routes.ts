import { Router } from "express";

import {
  createCategoryController,
  getCategoriesController,
    getCategoryByIdController,
    updateCategoryController,
    deleteCategoryController,
} from "./category.controller";
import { authMiddleware } from "../../app/middlewares/auth.middleware";

const categorysRouter = Router();

categorysRouter.use(authMiddleware);

categorysRouter.post("/create", createCategoryController);
categorysRouter.get("/", getCategoriesController);
categorysRouter.get("/:id", getCategoryByIdController);
categorysRouter.put("/:id", updateCategoryController);
categorysRouter.delete("/:id", deleteCategoryController);

export default categorysRouter;
