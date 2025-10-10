import { Router } from "express";
import { authMiddleware } from "../../app/middlewares/auth.ts";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "./users.controller.ts";

const usersRouter = Router();

usersRouter.post("/", createUserController);
usersRouter.get("/", authMiddleware, getUsersController);
usersRouter.get("/:id", authMiddleware, getUserByIdController);
usersRouter.put("/:id", authMiddleware, updateUserController);
usersRouter.delete("/:id", authMiddleware, deleteUserController);


export default usersRouter;