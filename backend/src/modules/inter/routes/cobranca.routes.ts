import { Router } from "express";
import { CobrancaController } from "../controllers/cobranca.controller";

const cobrancaRoutes = Router();
const controller = new CobrancaController();

cobrancaRoutes.post("/", controller.create.bind(controller));

export { cobrancaRoutes };
