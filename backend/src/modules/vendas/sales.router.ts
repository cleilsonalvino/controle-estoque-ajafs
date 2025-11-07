import { Router } from "express";
import {
  createVendaController,
  getVendasController,
  getVendaByIdController,
  updateVendaController,
  deleteVendaController,
  cancelarVendaController,
  getVendasFiltrarController,
  createServiceSaleController,
  getVendasTopProdutosController
  //deleteAllSalesController
} from "./sales.controller";
import { authMiddleware } from "../../app/middlewares/auth.middleware";

const salesRouter = Router();

salesRouter.use(authMiddleware);

// Venda Routes
salesRouter.post("/create", createVendaController);
salesRouter.post("/create-sales-services", createServiceSaleController);
salesRouter.get("/filtrar", getVendasFiltrarController);

//salesRouter.delete("/delete-all", deleteAllSalesController);
salesRouter.get("/", getVendasController);
salesRouter.get("/:id", getVendaByIdController);
salesRouter.get("/reports/top-products", getVendasTopProdutosController);
salesRouter.put("/:id", updateVendaController);
salesRouter.delete("/:id", deleteVendaController);
salesRouter.patch("/cancelar/:id", cancelarVendaController);




export default salesRouter;
