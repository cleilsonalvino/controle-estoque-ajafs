import { Router } from "express";
import { OrdemDeServicoController } from "./ordem-de-servico.controller";
import { authMiddleware } from "app/middlewares/auth.middleware";

const router = Router();
const controller = new OrdemDeServicoController();

router.use(authMiddleware);

router.get("/", controller.findAll);
router.get("/:id", controller.findOne);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export const ordemDeServicoRoutes = router;
