import { Router } from "express";
import { ServiceController } from "./services.controller";
import { validate } from "../../app/middlewares/validate";
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdParamSchema,
  listServiceSchema,
} from "./services.dto";
import { authMiddleware } from "../../app/middlewares/auth.middleware";

const servicoRouter = Router();
const controller = new ServiceController();

servicoRouter.use(authMiddleware);

servicoRouter.post("/create", validate(createServiceSchema), controller.create);

servicoRouter.get("/", controller.getAll);

servicoRouter.get("/:id", validate(serviceIdParamSchema), controller.getById);

servicoRouter.patch(
  "/:id",
  validate(serviceIdParamSchema.merge(updateServiceSchema)),
  controller.update
);

servicoRouter.delete("/:id", validate(serviceIdParamSchema), controller.delete);

export default servicoRouter;
