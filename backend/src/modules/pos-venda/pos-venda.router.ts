import { Router } from "express";
import { authMiddleware } from "../../app/middlewares/auth.middleware";
import * as controller from "./pos-venda.controller";

const posVendaRouter = Router();

// Rotas autenticadas para pós-venda
posVendaRouter.use(authMiddleware);

posVendaRouter.get("/", controller.getPosVendasController);
posVendaRouter.post("/", controller.createPosVendaController);
posVendaRouter.get("/dashboard", controller.getDashboardDataController);
posVendaRouter.get("/:id", controller.getPosVendaByIdController);
posVendaRouter.put("/:id", controller.updatePosVendaController);
posVendaRouter.delete("/:id", controller.deletePosVendaController);

// Rotas para Follow-up
posVendaRouter.post("/follow-up", controller.createFollowUpController);
posVendaRouter.put("/follow-up/:id", controller.updateFollowUpController);


// Rota pública para feedback
const feedbackRouter = Router();
feedbackRouter.get("/:id", controller.getFeedbackFormController);
feedbackRouter.post("/:id", controller.createFeedbackController);

export { posVendaRouter, feedbackRouter };
