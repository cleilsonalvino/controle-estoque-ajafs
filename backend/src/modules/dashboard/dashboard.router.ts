import { Router } from "express";
import { DashboardController } from "./dashboard.controller.ts";
import { authMiddleware } from "../../app/middlewares/auth.middleware.ts";

const Dashboardrouter = Router();


Dashboardrouter.use(authMiddleware);
// GET /dashboard → retorna dados gerais do sistema
Dashboardrouter.get("/", DashboardController.getOverview);

export default Dashboardrouter;
