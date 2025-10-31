import { Router } from "express";
import {
  createSupplierController,
  getSuppliersController,
  getSupplierByIdController,
  updateSupplierController,
  deleteSupplierController,
} from "./suppliers.controller.ts";
import { authMiddleware } from "../../app/middlewares/auth.middleware.ts";

const suppliersRouter = Router();

suppliersRouter.use(authMiddleware);

suppliersRouter.post("/create", createSupplierController);
suppliersRouter.get("/", getSuppliersController);
suppliersRouter.get("/:id", getSupplierByIdController);
suppliersRouter.put("/:id", updateSupplierController);
suppliersRouter.delete("/:id", deleteSupplierController);


export default suppliersRouter;