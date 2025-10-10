import { Router } from "express";
import usersRouter from "../modules/users/users.router.ts";
import suppliersRouter from "../modules/suppliers/suppliers.router.ts";
import productsRouter from "../modules/products/products.router.ts";
import inventoryRouter from "../modules/inventory/inventory.router.ts";
import salesRouter from "../modules/sales/sales.router.ts";
import financeRouter from "../modules/finance/finance.router.ts";
import authRouter from "../modules/auth/auth.router.ts";

const router = Router();

router.use("/users", usersRouter);
router.use("/suppliers", suppliersRouter);
router.use("/products", productsRouter);
router.use("/inventory", inventoryRouter);
router.use("/sales", salesRouter);
router.use("/finance", financeRouter);
router.use("/auth", authRouter);

export default router;