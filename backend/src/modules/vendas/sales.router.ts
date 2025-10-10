import { Router } from "express";
import {
  createVendaController,
  getVendasController,
  getVendaByIdController,
  updateVendaController,
  deleteVendaController,
} from "./sales.controller.ts";

const salesRouter = Router();

// Venda Routes
salesRouter.post("/vendas", createVendaController);
salesRouter.get("/vendas", getVendasController);
salesRouter.get("/vendas/:id", getVendaByIdController);
salesRouter.put("/vendas/:id", updateVendaController);
salesRouter.delete("/vendas/:id", deleteVendaController);

export default salesRouter;