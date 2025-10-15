import { Router } from 'express';
import {
  createVendedorController,
  getVendedoresController,
  getVendedorByIdController,
  updateVendedorController,
  deleteVendedorController,
} from './vendedores.controller.ts';

const router = Router();

router.post('/create', createVendedorController);
router.get('/', getVendedoresController);
router.get('/:id', getVendedorByIdController);
router.patch('/:id', updateVendedorController);
router.delete('/:id', deleteVendedorController);

export const vendedoresRouter = router;