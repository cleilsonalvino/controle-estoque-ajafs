import { Router } from 'express';
import {
  createEmpresaController,
  getEmpresasController,
  getEmpresaByIdController,
  updateEmpresaController,
  deleteEmpresaController,
} from './empresa.controller.ts';

const router = Router();

router.post('/create', createEmpresaController);
router.get('/', getEmpresasController);
router.get('/:id', getEmpresaByIdController);
router.patch('/:id', updateEmpresaController);
router.delete('/:id', deleteEmpresaController);

export const empresaRouter = router;