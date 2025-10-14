import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  addCategoryToProductController,
  addSupplierToProductController,
} from "./products.controller.ts";

const productsRouter = Router();

productsRouter.post("/create", createProductController);
productsRouter.get("/", getProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.patch("/:id", updateProductController);
productsRouter.delete("/delete/:id", deleteProductController);
productsRouter.patch("/add-category/:id", addCategoryToProductController);
productsRouter.patch("/add-supplier/:id", addSupplierToProductController);

export default productsRouter;