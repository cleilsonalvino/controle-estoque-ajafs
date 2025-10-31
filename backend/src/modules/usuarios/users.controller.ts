import { type Request, type Response } from "express";
import { createUserSchema } from "./users.dto.ts";
import {
  createUserService,
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "./users.service.ts";
import type { AuthenticatedRequest } from "../../app/middlewares/auth.middleware.ts";

export const createUserController = async (req: AuthenticatedRequest, res: Response) => {
  const { empresaId } = req.user!;
  const user = await createUserService(req.body, empresaId);
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
  const user = await updateUserService(id as string, req.body, empresaId);
  res.status(200).json(user);
};

export const deleteUserController = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { empresaId } = req.user!;
  await deleteUserService(id as string, empresaId);
  res.status(204).send();
};