import { Router } from 'express';
import * as ctrl from '../controllers/task.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createTaskSchema,
  updateTaskSchema
} from '../validators/task.validator.js';

const router = Router();

router.use(protect);

router.get('/board/:boardId', ctrl.getAll);
router.post('/board/:boardId', validate(createTaskSchema), ctrl.create);
router.post('/board/:boardId/reorder', ctrl.reorder);

router.route('/:id')
  .get(ctrl.getOne)
  .put(validate(updateTaskSchema), ctrl.update)
  .delete(ctrl.remove);

export default router;