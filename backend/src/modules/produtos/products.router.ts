import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  addCategoryToProductController,
  addSupplierToProductController,
  createMarcaProdutoController,
  getMarcaProdutosController
} from "./products.controller";
import { authMiddleware } from "../../app/middlewares/auth.middleware";

const productsRouter = Router();

productsRouter.use(authMiddleware);

productsRouter.post("/create-marca-produto", createMarcaProdutoController);
productsRouter.post("/create", createProductController);
productsRouter.get("/marcas-produtos", getMarcaProdutosController);
productsRouter.get("/", getProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.put("/:id", updateProductController);
productsRouter.delete("/delete/:id", deleteProductController);
productsRouter.patch("/add-category/:id", addCategoryToProductController);
productsRouter.patch("/add-supplier/:id", addSupplierToProductController);


export default productsRouter;
