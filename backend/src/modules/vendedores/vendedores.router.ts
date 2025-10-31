import { Router } from 'express';
import {
  createVendedorController,
  getVendedoresController,
  getVendedorByIdController,
  updateVendedorController,
  deleteVendedorController,
} from './vendedores.controller';
import { authMiddleware } from '../../app/middlewares/auth.middleware';

const vendedoresRouter = Router();

vendedoresRouter.use(authMiddleware);

vendedoresRouter.post('/create', createVendedorController);
vendedoresRouter.get('/', getVendedoresController);
vendedoresRouter.get('/:id', getVendedorByIdController);
vendedoresRouter.patch('/:id', updateVendedorController);
vendedoresRouter.delete('/:id', deleteVendedorController);

export default vendedoresRouter;
