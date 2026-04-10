import Board from "../models/Board.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { paginationMeta } from "../utils/apiResponse.util.js";
import AppError from "../utils/AppError.js";


const createProject = async (userId, data) => {
  const project = await Project.create({
    ...data,
    owner: userId,
    members: [{ user: userId, role: 'owner' }],
  });
  return project.populate('owner', 'name email avatar');
};

const getProjects = async (userId, query) => {
  const { page = 1, limit = 10, search, archived } = query;
  const skip = (page - 1) * limit;

  const filter = {
    $or: [{ owner: userId }, { 'members.user': userId }],
    isArchived: archived === 'true' ? true : false,
  };
  if (search) filter.name = { $regex: search, $options: 'i' };

  const [projects, total] = await Promise.all([
    Project.find(filter)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Project.countDocuments(filter),
  ]);

  return { projects, pagination: paginationMeta(total, page, limit) };
};

const getProjectById = async (projectId) => {
  const project = await Project.findById(projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  if (!project) throw new AppError('Project not found.', 404);
  return project;
};

const updateProject = async (projectId, data) => {
  const project = await Project.findByIdAndUpdate(projectId, data, { new: true, runValidators: true })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');
  if (!project) throw new AppError('Project not found.', 404);
  return project;
};

const deleteProject = async (projectId) => {
  const project = await Project.findByIdAndDelete(projectId);
  if (!project) throw new AppError('Project not found.', 404);
  // Cascade delete boards and tasks
  const boards = await Board.find({ project: projectId });
  const boardIds = boards.map(b => b._id);
  await Task.deleteMany({ board: { $in: boardIds } });
  await Board.deleteMany({ project: projectId });
};

const inviteProjectMember = async (projectId, email, role) => {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('User with this email not found.', 404);

  const project = await Project.findById(projectId);
  const alreadyMember = project.members.some(m => m.user.toString() === user._id.toString());
  if (alreadyMember) throw new AppError('User is already a member.', 409);

  project.members.push({ user: user._id, role });
  await project.save();
  return project.populate('members.user', 'name email avatar');
};

const removeProjectMember = async (projectId, memberId, requesterId) => {
  const project = await Project.findById(projectId);
  if (project.owner.toString() === memberId) throw new AppError('Cannot remove project owner.', 400);
  project.members = project.members.filter(m => m.user.toString() !== memberId);
  await project.save();
};

export { createProject, getProjects, getProjectById, updateProject, deleteProject, inviteProjectMember, removeProjectMember };