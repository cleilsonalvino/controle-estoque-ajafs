import { Router } from 'express'
import { empresaController } from './empresa.controller'
import { authMiddleware } from '../../app/middlewares/auth.middleware'

const empresaRouter = Router()

empresaRouter.use(authMiddleware)

empresaRouter.post('/create', empresaController.create)
empresaRouter.get('/', empresaController.getAll)
empresaRouter.get('/:id', empresaController.getById)
empresaRouter.put('/:id', empresaController.update)
empresaRouter.delete('/:id', empresaController.remove)

export default empresaRouter
