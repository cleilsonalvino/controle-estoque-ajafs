import { Router } from 'express';
import { LoteController } from './lotes.controller.ts';
import { validate } from '../../shared/zod.ts';
import {
  createLoteSchema,
  updateLoteSchema,
  loteIdParamSchema,
  listLoteSchema,
  createMovimentacaoLoteSchema,
} from './lotes.dto.ts';

const router = Router();
const controller = new LoteController();

// Rotas para Lotes
router.post('/', validate(createLoteSchema), controller.create);
router.get('/', validate(listLoteSchema), controller.getAll);
router.get('/:id', validate( loteIdParamSchema ), controller.getById);
router.patch(
  '/:id',
  validate( loteIdParamSchema.merge(updateLoteSchema)),
  controller.update
);
router.delete('/:id', validate(loteIdParamSchema), controller.delete);

// Rotas para Movimentações de Lote
router.post(
  '/movimentacoes',
  validate( createMovimentacaoLoteSchema),
  controller.createMovimentacao
);
router.get(
  '/:id/movimentacoes',
  validate(loteIdParamSchema),
  controller.getMovimentacoesByLoteId
);

export const lotesRouter = router;
