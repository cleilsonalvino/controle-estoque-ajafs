import { Router } from "express";
import usersRouter from "../modules/usuarios/users.router";
import suppliersRouter from "../modules/fornecedores/suppliers.router";
import productsRouter from "../modules/produtos/products.router";
import salesRouter from "../modules/vendas/sales.router";
import authRouter from "../modules/auth/auth.router";
import categorysRouter from "../modules/categorias/category.routes";
import stockRouter from "../modules/estoque/stock.router";
import vendedoresRouter from "../modules/vendedores/vendedores.router";
import clientesRouter from "../modules/clientes/cliente.routes";
import servicesRouter from "../modules/servicos/services.router";
import categoriaServicoRouter from "../modules/categorias-servicos/categoria-servico.router";
import empresaRouter from "../modules/empresa/empresa.router";
import Dashboardrouter from "../modules/dashboard/dashboard.router";
import { cobrancaRoutes } from "@modules/inter/routes/cobranca.routes";
import { authRoutes } from "@modules/inter/routes/auth.routes";
import { posVendaRouter, feedbackRouter } from "../modules/pos-venda/pos-venda.router";

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
router.use("/pos-venda", posVendaRouter);
router.use("/feedback", feedbackRouter);

// Rota base
router.use("/inter/cobranca", cobrancaRoutes);
router.use("/inter/auth", authRoutes);

export default router;
