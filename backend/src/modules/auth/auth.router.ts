import { Router } from "express";
import { loginController, loginMeController } from "./auth.controller";

const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/me", loginMeController); // Adicione este endpoint para buscar dados do usuário logado

export default authRouter;
