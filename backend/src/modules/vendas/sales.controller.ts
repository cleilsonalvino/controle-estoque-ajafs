import { type Request, type Response } from "express";
import {
  createVendaService,
  getVendasService,
  getVendaByIdService,
  updateVendaService,
  deleteVendaService,
  cancelVendaService,
  getVendasFiltrarService,
  deleteAllSalesService
} from "./sales.service.ts";

import { createVendaSchema } from "./sales.dto.ts";
import { CustomError } from "../../shared/errors.ts";

// Venda Controllers

export const createVendaController = async (req: Request, res: Response) => {
  console.log("Requisição recebida para criar venda:", req.body);
  const validation = createVendaSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Erro de validação nos dados da venda",
      details: validation.error.format(), // mostra exatamente o campo errado
    });
  }

  const venda = await createVendaService(req.body);
  res.status(201).json(venda);
};

export const getVendasController = async (req: Request, res: Response) => {
  const vendas = await getVendasService();
  res.status(200).json(vendas);
};

export const getVendaByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const venda = await getVendaByIdService(id as string);
  res.status(200).json(venda);
};

export const updateVendaController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const venda = await updateVendaService(id as string, req.body);
  res.status(200).json(venda);
};

export const deleteVendaController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteVendaService(id as string);
  res.status(204).send();
};

export const cancelarVendaController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log("Cancelando venda com ID:", id);
    const result = await cancelVendaService(id as string);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const getVendasFiltrarController = async (req: Request, res: Response) => {
  try {
    const filtros = req.query; // todos os parâmetros de query
    const vendas = await getVendasFiltrarService(filtros);
    res.json(vendas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar vendas" });
  }
};

export const deleteAllSalesController = async (req: Request, res: Response) => {
  try {
    console.log("Requisição recebida para deletar todas as vendas");

    const deletedCount = await deleteAllSalesService();

    res.status(200).json({ 
      message: "Todas as vendas foram deletadas.", 
      deletedCount 
    });
  } catch (error: any) {
    console.error("Erro ao deletar todas as vendas:", error);

    // Se for CustomError, envia o status correto
    if (error instanceof CustomError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Outros erros inesperados
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};


