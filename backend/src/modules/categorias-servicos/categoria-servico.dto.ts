import zod from 'zod';

export const createCategoriaServicoSchema = zod.object({
  nome: zod.string().min(1).max(255),
  descricao: zod.string().optional(),
  empresaId: zod.string().uuid(),
});

export const updateCategoriaServicoSchema = zod.object({
  nome: zod.string().min(1).max(255).optional(),
  descricao: zod.string().optional(),
  empresaId: zod.string().uuid().optional(),
});

export const categoriaServicoIdSchema = zod.object({
  id: zod.string().uuid(),
});

