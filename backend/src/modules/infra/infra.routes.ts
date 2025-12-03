// src/routes/infra.routes.ts
import { Router } from "express";
import { getInfraStatusHandler, infraRequestCounter } from "./infra.controller";

const infraRouter = Router();

// aplica contador em todas as rotas (ou so nas que voce quiser)
infraRouter.use(infraRequestCounter);

// rota para consultar o estado geral da API
infraRouter.get("/infra", getInfraStatusHandler);

export { infraRouter };
