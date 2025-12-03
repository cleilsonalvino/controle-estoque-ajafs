import { type Response } from "express";
import { empresaService } from "./empresa.service";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";
import { CustomError } from "../../shared/errors";

export const empresaController = {
  // =====================================================
  // 🔹 Listar todas as empresas (apenas SUPER_ADMIN)
  // =====================================================
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.papel !== "SUPER_ADMIN") {
        throw new CustomError(
          "Acesso negado. Permissão restrita a Super Admin.",
          403
        );
      }

      const empresas = await empresaService.getAll();
      return res.status(200).json(empresas);
    } catch (error: any) {
      console.error("Erro ao listar empresas:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  },

  // =====================================================
  // 🔹 Criar nova empresa (super-admin)
  // =====================================================
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      console.log("Requisição de criação de empresa recebida.", req.body);

      if (req.user?.papel !== "SUPER_ADMIN") {
        throw new CustomError(
          "Acesso negado. Apenas Super Admin pode criar empresas.",
          403
        );
      }

      const data = req.body;

      // Se veio logo, salva
      if (req.file) {
        data.logoEmpresa = `uploads/empresa/${req.file.filename}`;
      }

      // Chama service que cria empresa + usuário
      const { empresa, usuario } = await empresaService.create(data);

      return res.status(201).json({
        message: "Empresa e usuário criados com sucesso",
        empresa,
        usuario,
      });
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  },

  // =====================================================
  // 🔹 Buscar empresa por ID (usuário comum ou admin)
  // =====================================================
  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { empresaId, papel } = req.user!;

      const empresa = await empresaService.getById(
        id,
        empresaId,
        papel === "SUPER_ADMIN"
      );
      return res.status(200).json(empresa);
    } catch (error: any) {
      console.error("Erro ao buscar empresa:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  },

  // =====================================================
  // 🔹 Atualizar empresa (admin da própria empresa ou super-admin)
  // =====================================================
  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;

      if (req.file) {
        data.logoEmpresa = `uploads/empresa/${req.file.filename}`;
      }

      const empresa = await empresaService.update(
        id,
        data,
      );
      return res
        .status(200)
        .json({ message: "Empresa atualizada com sucesso", data: empresa });
    } catch (error: any) {
      console.error("Erro ao atualizar empresa:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  },

  // =====================================================
  // 🔹 Remover empresa (super-admin)
  // =====================================================
  async remove(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.papel !== "SUPER_ADMIN") {
        throw new CustomError(
          "Acesso negado. Apenas Super Admin pode remover empresas.",
          403
        );
      }

      await empresaService.remove(req.params.id as string, true);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao remover empresa:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  },

  // =====================================================
  // 📊 Painel de Gestão - estatísticas globais
  // =====================================================
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user?.papel !== "SUPER_ADMIN") {
        throw new CustomError(
          "Acesso negado. Apenas Super Admin pode visualizar o painel de gestão.",
          403
        );
      }

      const stats = await empresaService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error: any) {
      console.error("Erro ao gerar dashboard:", error);
      return res
        .status(error.statusCode || 500)
        .json({ message: error.message });
    }
  },
};
