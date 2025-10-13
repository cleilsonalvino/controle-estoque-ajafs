import { Router } from "express";
import usersRouter from "../modules/usuarios/users.router.ts";
import suppliersRouter from "../modules/fornecedores/suppliers.router.ts";
import productsRouter from "../modules/produtos/products.router.ts";
import salesRouter from "../modules/vendas/sales.router.ts";
import authRouter from "../modules/auth/auth.router.ts";
import categorysRouter from "../modules/categorias/category.routes.ts";
import stockRouter from "../modules/estoque/stock.router.ts";

const router = Router();

router.use("/usuarios", usersRouter);
router.use("/fornecedores", suppliersRouter);
router.use("/produtos", productsRouter);
router.use("/vendas", salesRouter);
router.use("/categorias", categorysRouter);
router.use("/auth", authRouter);
router.use("/estoque", stockRouter);

export default router;