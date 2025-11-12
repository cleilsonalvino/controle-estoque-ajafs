import { type Request, type Response } from "express";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";
import * as service from "./pos-venda.service";
import {
  createPosVendaSchema,
  updatePosVendaSchema,
  createFollowUpSchema,
  updateFollowUpSchema,
  createFeedbackSchema,
} from "./pos-venda.dto";
import { CustomError } from "../../shared/errors";

// ================================================
// POS-VENDA CONTROLLERS
// ================================================

export const getPosVendasController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId, id, papel } = req.user!;
    // Precisamos associar o usuário a um vendedor se o papel for VENDEDOR.
    // Esta é uma suposição de como a associação é feita.
    // Você pode precisar buscar o vendedor correspondente ao usuário.
    const userPayload = { id, papel, vendedorId: req.user!.id }; // Exemplo: user.id é o vendedorId

    const posVendas = await service.getPosVendasService(empresaId, userPayload);
    res.status(200).json(posVendas);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const getPosVendaByIdController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const { id } = req.params;
    const posVenda = await service.getPosVendaByIdService(id, empresaId);
    res.status(200).json(posVenda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

export const createPosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId, id: usuarioId } = req.user!;
    const validation = createPosVendaSchema.safeParse(req.body);
    if (!validation.success) {
      throw new CustomError("Erro de validação", 400, validation.error.format());
    }
    const posVenda = await service.createPosVendaService(validation.data, empresaId, usuarioId);
    res.status(201).json(posVenda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

export const updatePosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const { id } = req.params;
    const validation = updatePosVendaSchema.safeParse(req.body);
    if (!validation.success) {
        throw new CustomError("Erro de validação", 400, validation.error.format());
    }
    const posVenda = await service.updatePosVendaService(id, validation.data, empresaId);
    res.status(200).json(posVenda);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message, details: error.details });
  }
};

export const deletePosVendaController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { empresaId } = req.user!;
    const { id } = req.params;
    const result = await service.deletePosVendaService(id, empresaId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

// ================================================
// FEEDBACK PÚBLICO CONTROLLERS
// ================================================

export const getFeedbackFormController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = await service.getFeedbackFormService(id);
        res.status(200).json(data);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const createFeedbackController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const validation = createFeedbackSchema.safeParse(req.body);
        if (!validation.success) {
            throw new CustomError("Erro de validação", 400, validation.error.format());
        }
        const feedback = await service.createFeedbackService(id, validation.data);
        res.status(201).json(feedback);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message, details: error.details });
    }
};

// ================================================
// FOLLOW-UP CONTROLLERS
// ================================================

export const createFollowUpController = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { empresaId } = req.user!;
        const validation = createFollowUpSchema.safeParse(req.body);
        if (!validation.success) {
            throw new CustomError("Erro de validação", 400, validation.error.format());
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
        const { id } = req.params;
        const validation = updateFollowUpSchema.safeParse(req.body);
        if (!validation.success) {
            throw new CustomError("Erro de validação", 400, validation.error.format());
        }
        const followup = await service.updateFollowUpService(id, validation.data, empresaId);
        res.status(200).json(followup);
    } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message, details: error.details });
    }
};

// ================================================
// DASHBOARD CONTROLLER
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