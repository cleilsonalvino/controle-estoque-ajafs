import { type Request, type Response } from "express";
import { createUserSchema, updateUserSchema } from "./users.dto";
import {
  createUserService,
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "./users.service";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware";

// ======================================================
// 🛠 Função auxiliar para garantir array de telasPermitidas
// ======================================================
function normalizarTelasPermitidas(valor: any): string[] {
  if (!valor) return [];

  // Já é array → OK
  if (Array.isArray(valor)) return valor;

  // Veio string JSON → tentar converter
  if (typeof valor === "string") {
    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  // Qualquer outro caso → vazio
  return [];
}

// ======================================================
// 🟢 CRIAR USUÁRIO
// ======================================================
export const createUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;

  let body = {
    ...req.body,
    telasPermitidas: normalizarTelasPermitidas(req.body.telasPermitidas),
  };

  const data = createUserSchema.parse(body);

  if (req.file) {
    data.urlImagem = `uploads/usuarios/${req.file.filename}`;
  }

  const user = await createUserService(data, empresaId);
  res.status(201).json(user);
};

// ======================================================
// 🔵 LISTAR USUÁRIOS
// ======================================================
export const getUsersController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { empresaId } = req.user!;
  const users = await getUsersService(empresaId);
  res.status(200).json(users);
};

// ======================================================
// 🟡 BUSCAR USUÁRIO POR ID
// ======================================================
export const getUserByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;

  const user = await getUserByIdService(id as string, empresaId);
  res.status(200).json(user);
};

// ======================================================
// 🟠 ATUALIZAR USUÁRIO
// ======================================================
export const updateUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;

  console.log("[USUARIOS] Atualizando usuário", req.body);

  let body = {
    ...req.body,
    telasPermitidas: normalizarTelasPermitidas(req.body.telasPermitidas),
  };

  const data = updateUserSchema.parse(body);

  if (req.file) {
    data.urlImagem = `uploads/usuarios/${req.file.filename}`;
  }

  const user = await updateUserService(id as string, data, empresaId);
  res.status(200).json(user);
};

// ======================================================
// 🔴 EXCLUIR USUÁRIO
// ======================================================
export const deleteUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { id } = req.params;
  const { empresaId } = req.user!;

  await deleteUserService(id as string, empresaId);
  res.status(204).send();
};
