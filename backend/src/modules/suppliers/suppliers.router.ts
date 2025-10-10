import { Router } from "express";
import {
  createSupplierController,
  getSuppliersController,
  getSupplierByIdController,
  updateSupplierController,
  deleteSupplierController,
} from "./suppliers.controller.ts";

const suppliersRouter = Router();

suppliersRouter.post("/", createSupplierController);
suppliersRouter.get("/", getSuppliersController);
suppliersRouter.get("/:id", getSupplierByIdController);
suppliersRouter.put("/:id", updateSupplierController);
suppliersRouter.delete("/:id", deleteSupplierController);

export default suppliersRouter;