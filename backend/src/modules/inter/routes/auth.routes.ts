import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRoutes = Router();
const controller = new AuthController();

// GET /inter/auth
authRoutes.get("/", controller.gerarToken.bind(controller));

export { authRoutes };
