import { Router } from 'express';
import {
  createVendedorController,
  getVendedoresController,
  getVendedorByIdController,
  updateVendedorController,
  deleteVendedorController,
} from './vendedores.controller';
import { authMiddleware } from '../../app/middlewares/auth.middleware';
import upload from '../../app/config/multer';

const vendedoresRouter = Router();

vendedoresRouter.use(authMiddleware);

vendedoresRouter.post('/create', upload.single('urlImage'), createVendedorController);
vendedoresRouter.get('/', getVendedoresController);
vendedoresRouter.get('/:id', getVendedorByIdController);
vendedoresRouter.put('/:id', upload.single('urlImage'), updateVendedorController);
vendedoresRouter.delete('/:id', deleteVendedorController);

export default vendedoresRouter;
