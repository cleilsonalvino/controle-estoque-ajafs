import { Router } from "express";
import {
  createVendaController,
  getVendasController,
  getVendaByIdController,
  updateVendaController,
  deleteVendaController,
  cancelarVendaController,
  getVendasFiltrarController
} from "./sales.controller.ts";

const salesRouter = Router();

// Venda Routes
salesRouter.post("/create", createVendaController);
salesRouter.get("/filtrar", getVendasFiltrarController);
salesRouter.get("/", getVendasController);
salesRouter.get("/:id", getVendaByIdController);
salesRouter.put("/:id", updateVendaController);
salesRouter.delete("/:id", deleteVendaController);
salesRouter.patch("/cancelar/:id", cancelarVendaController);


export default salesRouter;