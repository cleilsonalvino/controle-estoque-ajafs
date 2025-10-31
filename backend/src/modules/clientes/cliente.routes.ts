import { Router } from 'express';
import {
  createClienteController,
  getClientesController,
  getClienteByIdController,
  updateClienteController,
  deleteClienteController,
} from './cliente.controller';
import { authMiddleware } from '../../app/middlewares/auth.middleware';

const clienteRouter = Router();

clienteRouter.use(authMiddleware);

clienteRouter.post('/create', createClienteController);
clienteRouter.get('/', getClientesController);
clienteRouter.get('/:id', getClienteByIdController);
clienteRouter.patch('/:id', updateClienteController);
clienteRouter.delete('/:id', deleteClienteController);

export default clienteRouter;
