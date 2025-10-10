import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "./products.controller.ts";

const productsRouter = Router();

productsRouter.post("/", createProductController);
productsRouter.get("/", getProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.put("/:id", updateProductController);
productsRouter.delete("/:id", deleteProductController);

export default productsRouter;