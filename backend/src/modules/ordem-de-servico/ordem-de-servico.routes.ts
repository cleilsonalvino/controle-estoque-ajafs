
import { Router } from 'express';
import { OrdemDeServicoController } from './ordem-de-servico.controller';
import { authMiddleware } from 'app/middlewares/auth.middleware';

const router = Router();
const controller = new OrdemDeServicoController();

router.use(authMiddleware);

router.get('/', controller.findAll);
router.get('/:id', controller.findOne);
router.put('/:id', controller.update);

export const ordemDeServicoRoutes = router;
