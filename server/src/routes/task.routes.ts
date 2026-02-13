import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createTaskSchema, queryTasksSchema, reorderTasksSchema, updateTaskSchema } from '../validators/task.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(queryTasksSchema), TaskController.getTasks);
router.post('/', validate(createTaskSchema), TaskController.createTask);
router.get('/:id', TaskController.getTask);
router.patch('/:id', validate(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.put('/reorder', validate(reorderTasksSchema), TaskController.reorderTasks);

export default router;
