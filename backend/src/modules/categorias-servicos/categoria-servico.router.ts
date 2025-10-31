import { Router } from "express";
import {
  createCategoriaServicoController,
  getCategoriasServicosController,
  getCategoriaServicoByIdController,
  updateCategoriaServicoController,
  deleteCategoriaServicoController,
} from "./categoria-servico.controller.ts";
import { authMiddleware } from "../../app/middlewares/auth.middleware.ts";

const categoriaServicoRouter = Router();

categoriaServicoRouter.use(authMiddleware);

categoriaServicoRouter.post("/create", createCategoriaServicoController);
categoriaServicoRouter.get("/", getCategoriasServicosController);
categoriaServicoRouter.get("/:id", getCategoriaServicoByIdController);
categoriaServicoRouter.patch("/:id", updateCategoriaServicoController);
categoriaServicoRouter.delete("/:id", deleteCategoriaServicoController);

export default categoriaServicoRouter;

