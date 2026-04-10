import { Router } from 'express';
import * as ctrl from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  requireProjectMember,
  requireProjectOwner,
  requireProjectAdmin
} from '../middleware/rbac.middleware.js';
import validate from '../middleware/validate.middleware.js';
import {
  createProjectSchema,
  updateProjectSchema,
  inviteMemberSchema
} from '../validators/project.validator.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(ctrl.getAll)
  .post(validate(createProjectSchema), ctrl.create);

router.route('/:id')
  .get(requireProjectMember, ctrl.getOne)
  .put(requireProjectAdmin, validate(updateProjectSchema), ctrl.update)
  .delete(requireProjectOwner, ctrl.remove);

router.post('/:id/invite', requireProjectAdmin, validate(inviteMemberSchema), ctrl.invite);
router.delete('/:id/members/:memberId', requireProjectAdmin, ctrl.removeMember);

export default router;