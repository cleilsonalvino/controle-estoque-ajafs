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

export const createUserController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const data = createUserSchema.parse(req.body);

  if (req.file) {
    data.urlImagem = `uploads/usuarios/${req.file.filename}`;
  }

  const user = await createUserService(data, empresaId);
  res.status(201).json(user);
};

export const getUsersController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const users = await getUsersService(empresaId);
  res.status(200).json(users);
};

export const getUserByIdController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const user = await getUserByIdService(id as string, empresaId);
  res.status(200).json(user);
};

export const updateUserController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  const data = updateUserSchema.parse(req.body);

  if (req.file) {
    data.urlImagem = `uploads/usuarios/${req.file.filename}`;
  }

  const user = await updateUserService(id as string, data, empresaId);
  res.status(200).json(user);
};

export const deleteUserController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteUserService(id as string, empresaId);
  res.status(204).send();
};
