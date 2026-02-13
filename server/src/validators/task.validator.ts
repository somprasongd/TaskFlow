import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    categoryId: z.string().uuid().optional().nullable(),
    isCompleted: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
    categoryId: z.string().uuid().optional().nullable(),
    isCompleted: z.boolean().optional(),
    dueDate: z.string().datetime().optional().nullable(),
    sortOrder: z.number().int().optional(),
  }),
});

export const queryTasksSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    priority: z.string().optional(), // comma separated
    categoryId: z.string().optional(),
    status: z.enum(['all', 'active', 'completed']).optional(),
    sortBy: z.enum(['manual', 'createdAt', 'dueDate', 'priority', 'alphabetical']).optional(),
  }),
});

export const reorderTasksSchema = z.object({
  body: z.object({
    tasks: z.array(z.object({
      id: z.string().uuid(),
      sortOrder: z.number().int(),
    })),
  }),
});
