import { Router } from "express";
import usersRouter from "../modules/usuarios/users.router.ts";
import suppliersRouter from "../modules/fornecedores/suppliers.router.ts";
import productsRouter from "../modules/produtos/products.router.ts";
import salesRouter from "../modules/vendas/sales.router.ts";
import authRouter from "../modules/auth/auth.router.ts";
import categorysRouter from "../modules/categorias/category.routes.ts";
import stockRouter from "../modules/estoque/stock.router.ts";
import { vendedoresRouter } from "../modules/vendedores/vendedores.router.ts";
import { clientesRouter } from "../modules/clientes/cliente.routes.ts";
import { servicesRouter } from "../modules/servicos/services.router.ts";
import categoriaServicoRouter from "../modules/categorias-servicos/categoria-servico.router.ts";
import { empresaRouter } from "../modules/empresa/empresa.router.ts";
import Dashboardrouter from "../modules/dashboard/dashboard.router.ts";

const router = Router();

router.use("/usuarios", usersRouter);
router.use("/fornecedores", suppliersRouter);
router.use("/produtos", productsRouter);
router.use("/vendas", salesRouter);
router.use("/categorias", categorysRouter);
router.use("/auth", authRouter);
router.use("/estoque", stockRouter);
router.use("/vendedores", vendedoresRouter);
router.use("/clientes", clientesRouter);
router.use("/servicos", servicesRouter);
router.use("/categorias-servicos", categoriaServicoRouter);
router.use("/empresa", empresaRouter);
router.use("/dashboard", Dashboardrouter);

export default router;
