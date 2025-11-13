import { Router } from "express";
import { authMiddleware } from "../../app/middlewares/auth.middleware";
import {
  createUserController,
  getUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
} from "./users.controller";
import upload from "../../app/config/multer";

const usersRouter = Router();

usersRouter.use(authMiddleware);

usersRouter.post("/", upload.single('urlImagem'), createUserController);
usersRouter.get("/", authMiddleware, getUsersController);
usersRouter.get("/:id", authMiddleware, getUserByIdController);
usersRouter.put("/:id", authMiddleware, upload.single('urlImagem'), updateUserController);
usersRouter.delete("/:id", authMiddleware, deleteUserController);


export default usersRouter;
