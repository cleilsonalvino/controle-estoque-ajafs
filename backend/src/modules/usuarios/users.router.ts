import { Router } from "express";
import { authMiddleware } from "../../app/middlewares/auth.middleware";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "./users.controller";

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.post("/", createUserController);
usersRouter.get("/", authMiddleware, getUsersController);
usersRouter.get("/:id", authMiddleware, getUserByIdController);
usersRouter.put("/:id", authMiddleware, updateUserController);
usersRouter.delete("/:id", authMiddleware, deleteUserController);


export default usersRouter;
