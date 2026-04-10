import { Router } from 'express';
import * as ctrl from '../controllers/board.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireProjectMember } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(protect);

// Project-scoped board routes
router.get('/project/:projectId', requireProjectMember, ctrl.getByProject);
router.post('/project/:projectId', requireProjectMember, ctrl.create);

// Board-level routes
router.route('/:id')
  .get(ctrl.getOne)
  .put(ctrl.update)
  .delete(ctrl.remove);

// Column management
router.post('/:id/columns', ctrl.addColumn);
router.put('/:id/columns/:columnId', ctrl.updateColumn);
router.delete('/:id/columns/:columnId', ctrl.deleteColumn);

export default router;