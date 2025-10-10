import { type Request, type Response } from "express";
import {
  createUserService,
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "./users.service.ts";

export const createUserController = async (req: Request, res: Response) => {
  const user = await createUserService(req.body);
  res.status(201).json(user);
};

export const getUsersController = async (req: Request, res: Response) => {
  const users = await getUsersService();
  res.status(200).json(users);
};

export const getUserByIdController = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const user = await getUserByIdService(id as string);
  res.status(200).json(user);
};

export const updateUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await updateUserService(id as string, req.body);
  res.status(200).json(user);
};

export const deleteUserController = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deleteUserService(id as string);
  res.status(204).send();
};