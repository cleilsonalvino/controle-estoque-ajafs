import { Router } from "express";
import {
  createProductController,
  getProductsController,
  getProductByIdController,
  updateProductController,
  deleteProductController,
  createMarcaProdutoController,
  getMarcaProdutosController
} from "./products.controller";
import { authMiddleware } from "../../app/middlewares/auth.middleware";
import upload from "../../app/config/multer";

const productsRouter = Router();

productsRouter.use(authMiddleware);

productsRouter.post("/create-marca-produto", createMarcaProdutoController);
productsRouter.post("/create", upload.single('urlImage'), createProductController);
productsRouter.get("/marcas-produtos", getMarcaProdutosController);
productsRouter.get("/", getProductsController);
productsRouter.get("/:id", getProductByIdController);
productsRouter.put("/:id", upload.single('urlImage'), updateProductController);
productsRouter.delete("/delete/:id", deleteProductController);



export default productsRouter;
