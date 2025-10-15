import { Router } from 'express';
import {
  createClienteController,
  getClientesController,
  getClienteByIdController,
  updateClienteController,
  deleteClienteController,
} from './cliente.controller.ts';

const router = Router();

router.post('/create', createClienteController);
router.get('/', getClientesController);
router.get('/:id', getClienteByIdController);
router.patch('/:id', updateClienteController);
router.delete('/:id', deleteClienteController);

export const clientesRouter = router;