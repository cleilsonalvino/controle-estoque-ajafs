import { Router } from 'express';
import { ServiceController } from './services.controller.ts';
import { validate } from '../../app/middlewares/validate.ts';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceIdParamSchema,
  listServiceSchema,
} from './services.dto.ts';

const router = Router();
const controller = new ServiceController();

router.post(
  '/create',
  validate(createServiceSchema),
  controller.create
);

router.get(
  '/',
  validate(listServiceSchema),
  controller.getAll
);

router.get(
  '/:id',
  validate(serviceIdParamSchema),
  controller.getById
);

router.patch(
  '/:id',
  validate(serviceIdParamSchema.merge(updateServiceSchema)),
  controller.update
);

router.delete(
  '/:id',
  validate(serviceIdParamSchema),
  controller.delete
);

export const servicesRouter = router;
