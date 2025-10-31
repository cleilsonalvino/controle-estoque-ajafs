import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../app/middlewares/auth.middleware";

const Dashboardrouter = Router();


Dashboardrouter.use(authMiddleware);
// GET /dashboard → retorna dados gerais do sistema
Dashboardrouter.get("/", DashboardController.getOverview);

export default Dashboardrouter;
