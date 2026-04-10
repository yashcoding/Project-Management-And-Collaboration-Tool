import { Router } from 'express';
import * as ctrl from '../controllers/comment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/task/:taskId', ctrl.getAll);
router.post('/task/:taskId', ctrl.add);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;