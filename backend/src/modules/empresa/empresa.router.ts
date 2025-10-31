import { Router } from 'express'
import { empresaController } from './empresa.controller.ts'
import { authMiddleware } from '../../app/middlewares/auth.middleware.ts'

const empresaRouter = Router()

empresaRouter.use(authMiddleware)

empresaRouter.get('/', empresaController.getAll)
empresaRouter.post('/', empresaController.create)
empresaRouter.get('/:id', empresaController.getById)
empresaRouter.put('/:id', empresaController.update)
empresaRouter.delete('/:id', empresaController.remove)

export default empresaRouter
