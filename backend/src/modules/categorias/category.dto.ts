import zod from 'zod';

export const createCategorySchema = zod.object({
  nome: zod.string().min(1).max(255),
  descricao: zod.string().optional(),
  criadoEm: zod.date().optional().default(new Date()),
  atualizadoEm: zod.date().optional().default(new Date()),
});

export const updateCategorySchema = zod.object({
  nome: zod.string().min(1).max(255).optional(),
  descricao: zod.string().optional(),
  atualizadoEm: zod.date().optional().default(new Date()),
});

export const categoryIdSchema = zod.object({
  id: zod.string().uuid(),
});

