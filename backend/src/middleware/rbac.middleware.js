import Project from "../models/Project.js";
import AppError from "../utils/AppError.js";


// Check if user is member of a project (from req.params.projectId or req.body.projectId)
const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    const project = await Project.findById(projectId);

    if (!project) return next(new AppError('Project not found.', 404));

    const isOwner = project.owner.toString() === req.user._id.toString();
    const member = project.members.find(m => m.user.toString() === req.user._id.toString());

    if (!isOwner && !member) {
      return next(new AppError('Access denied. Not a project member.', 403));
    }

    req.project = project;
    req.memberRole = isOwner ? 'owner' : member.role;
    next();
  } catch (err) {
    next(err);
  }
};

// Only project owner or admin
const requireProjectAdmin = async (req, res, next) => {
  await requireProjectMember(req, res, () => {
    if (req.memberRole !== 'owner' && req.memberRole !== 'admin') {
      return next(new AppError('Access denied. Admin role required.', 403));
    }
    next();
  });
};

// Only project owner
const requireProjectOwner = async (req, res, next) => {
  await requireProjectMember(req, res, () => {
    if (req.memberRole !== 'owner') {
      return next(new AppError('Access denied. Owner role required.', 403));
    }
    next();
  });
};

export { requireProjectMember, requireProjectAdmin, requireProjectOwner };