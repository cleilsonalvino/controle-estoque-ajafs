import { type Request, type Response } from "express";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";
import * as service from "./pos-venda.service";
import { Papel } from "@prisma/client";
import {
  createPosVendaSchema,
  updatePosVendaSchema,
  createFollowUpSchema,
  updateFollowUpSchema,
  createFeedbackSchema,
} from "./pos-venda.dto";
import { CustomError } from "../../shared/errors";

// ================================================
// CRUD POS-VENDA
// ================================================

export const getPosVendasController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId, id, papel } = req.user!;
    const posVendas = await service.getPosVendasService(empresaId, { id, papel: papel as Papel });
    res.status(200).json(posVendas);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getPosVendaByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const posVenda = await service.getPosVendaByIdService(req.params.id, empresaId);
    res.status(200).json(posVenda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const createPosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId, id: usuarioId } = req.user!;
    const validation = createPosVendaSchema.safeParse(req.body);
    if (!validation.success)
      throw new CustomError("Erro de validação", 400);

    const posVenda = await service.createPosVendaService(validation.data, empresaId, usuarioId);
    res.status(201).json(posVenda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

export const updatePosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const validation = updatePosVendaSchema.safeParse(req.body);
    if (!validation.success)
      throw new CustomError("Erro de validação", 400);

    const posVenda = await service.updatePosVendaService(req.params.id, validation.data, empresaId);
    res.status(200).json(posVenda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

export const deletePosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const result = await service.deletePosVendaService(req.params.id, empresaId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// ================================================
// FOLLOW-UP
// ================================================

export const createFollowUpController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const posVendaId = req.params.id;

    console.log("corpo do request:", req.body, "posVendaId:", posVendaId);

    const validation = createFollowUpSchema.safeParse({
      ...req.body,
      posVendaId,
    });

    if (!validation.success) {
  console.log("VALIDATION ERROR:", validation.error.format());
  throw new CustomError("Erro de validação", 400);
}


    const followup = await service.createFollowUpService(validation.data, empresaId);
    res.status(201).json(followup);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

export const updateFollowUpController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const followId = req.params.followId;

    const validation = updateFollowUpSchema.safeParse(req.body);
    if (!validation.success)
      throw new CustomError("Erro de validação", 400);

    const followup = await service.updateFollowUpService(followId, validation.data, empresaId);
    res.status(200).json(followup);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

// ================================================
// FINALIZAR POS-VENDA
// ================================================

export const finalizarPosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    await service.finalizarPosVendaService(req.params.id, empresaId);
    res.status(200).json({ message: "Atendimento finalizado com sucesso!" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// ================================================
// ENVIAR PESQUISA
// ================================================

export const enviarPesquisaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    await service.enviarPesquisaService(req.params.id, empresaId);
    res.status(200).json({ message: "Pesquisa enviada com sucesso!" });
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// ================================================
// PUBLIC FEEDBACK
// ================================================

export const getFeedbackFormController = async (req: Request, res: Response) => {
  try {
    const data = await service.getFeedbackFormService(req.params.id);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const createFeedbackController = async (req: Request, res: Response) => {
  try {
    const validation = createFeedbackSchema.safeParse(req.body);
    if (!validation.success)
      throw new CustomError("Erro de validação", 400);

    const feedback = await service.createFeedbackService(req.params.id, validation.data);
    res.status(201).json(feedback);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

// ================================================
// DASHBOARD
// ================================================

export const getDashboardDataController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const data = await service.getDashboardDataService(empresaId);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};
