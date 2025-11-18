import { Router } from "express";
import { authMiddleware } from "../../app/middlewares/auth.middleware";
import * as controller from "./pos-venda.controller";

const posVendaRouter = Router();

posVendaRouter.use(authMiddleware);

// Pós-venda CRUD
posVendaRouter.get("/", controller.getPosVendasController);
posVendaRouter.post("/", controller.createPosVendaController);
posVendaRouter.get("/dashboard", controller.getDashboardDataController);
posVendaRouter.get("/:id", controller.getPosVendaByIdController);
posVendaRouter.put("/:id", controller.updatePosVendaController);
posVendaRouter.delete("/:id", controller.deletePosVendaController);

// Follow-up (ajustado para incluir o ID do pós-venda)
posVendaRouter.post("/:id/follow-up", controller.createFollowUpController);
posVendaRouter.put("/:id/follow-up/:followId", controller.updateFollowUpController);

// Finalizar atendimento
posVendaRouter.patch("/:id/finalizar", controller.finalizarPosVendaController);

// Enviar pesquisa
posVendaRouter.post("/:id/enviar-pesquisa", controller.enviarPesquisaController);

// Rotas públicas de feedback
const feedbackRouter = Router();
feedbackRouter.get("/:id", controller.getFeedbackFormController);
feedbackRouter.post("/:id", controller.createFeedbackController);

export { posVendaRouter, feedbackRouter };
