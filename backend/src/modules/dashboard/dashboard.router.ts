import { Router } from "express";
import { DashboardController } from "./dashboard.controller.ts";

const Dashboardrouter = Router();

// GET /dashboard → retorna dados gerais do sistema
Dashboardrouter.get("/", DashboardController.getOverview);

export default Dashboardrouter;
