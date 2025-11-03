import { type Request, type Response } from "express";
import {
  createVendaService,
  getVendasService,
  getVendaByIdService,
  updateVendaService,
  deleteVendaService,
  cancelVendaService,
  getVendasFiltrarService,
  createSaleServicesService
} from "./sales.service";
import { createVendaSchema } from "./sales.dto";
import { CustomError } from "../../shared/errors";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

/**
 * ======================================================
 * CREATE VENDA
 * ======================================================
 */
export const createVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    if (!empresaId) {
      return res.status(401).json({ message: "Usuário sem empresa associada" });
    }

    const validation = createVendaSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Erro de validação nos dados da venda",
        details: validation.error.format(),
      });
    }

    const venda = await createVendaService(req.body, empresaId);
    res.status(201).json(venda);
  } catch (error: any) {
    console.error("Erro ao criar venda:", error);
    res.status(error.status || 500).json({ message: error.message });
  }
};


export const createServiceSaleController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    console.log("Empresa ID no createServiceSaleController:", empresaId);
    if (!empresaId) {
      return res.status(401).json({ message: "Usuário sem empresa associada" });
    }
    console.log("Requisição para criar venda de serviço:", req.body);
    const venda = await createSaleServicesService(req.body, empresaId);
    res.status(201).json(venda);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};



/**
 * ======================================================
 * GET TODAS AS VENDAS
 * ======================================================
 */
export const getVendasController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    const vendas = await getVendasService(empresaId);
    res.status(200).json(vendas);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * ======================================================
 * GET VENDA POR ID
 * ======================================================
 */
export const getVendaByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    const { id } = req.params;
    const venda = await getVendaByIdService(id as string, empresaId);
    res.status(200).json(venda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * ======================================================
 * UPDATE VENDA
 * ======================================================
 */
export const updateVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    const { id } = req.params;
    const venda = await updateVendaService(id as string, req.body, empresaId);
    res.status(200).json(venda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * ======================================================
 * DELETE VENDA
 * ======================================================
 */
export const deleteVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
     const {empresaId} = req.user!;
    const { id } = req.params;
    await deleteVendaService(id as string, empresaId);
    res.status(204).send();
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * ======================================================
 * CANCELAR VENDA
 * ======================================================
 */
export const cancelarVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    const { id } = req.params;
    const result = await cancelVendaService(id as string, empresaId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

/**
 * ======================================================
 * FILTRAR VENDAS (por cliente, vendedor, datas, etc.)
 * ======================================================
 */
export const getVendasFiltrarController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {empresaId} = req.user!;
    const filtros = req.query;
    const vendas = await getVendasFiltrarService(filtros, empresaId);
    res.status(200).json(vendas);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
