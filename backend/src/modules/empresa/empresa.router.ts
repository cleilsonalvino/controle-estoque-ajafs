import { Router } from 'express'
import { empresaController } from './empresa.controller'
import { authMiddleware } from '../../app/middlewares/auth.middleware'
import upload from '../../app/config/multer'

const empresaRouter = Router()

empresaRouter.use(authMiddleware)

empresaRouter.post('/create', upload.single('logoEmpresa'), empresaController.create)
empresaRouter.get('/', empresaController.getAll)
empresaRouter.get("/super/dashboard", empresaController.getDashboard);
empresaRouter.get('/:id', empresaController.getById)
empresaRouter.put('/:id', upload.single('logoEmpresa'), empresaController.update)
empresaRouter.delete('/:id', empresaController.remove)



export default empresaRouter
