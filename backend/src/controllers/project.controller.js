import { createProject, deleteProject, getProjectById, getProjects, inviteProjectMember, removeProjectMember, updateProject } from "../services/project.service.js";


const create = async (req, res, next) => {
  try {
    const project = await createProject(req.user._id, req.body);
    successResponse(res, 201, 'Project created.', { project });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { projects, pagination } = await getProjects(req.user._id, req.query);
    successResponse(res, 200, 'Projects fetched.', { projects }, pagination);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.id);
    successResponse(res, 200, 'Project fetched.', { project });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const project = await updateProject(req.params.id, req.body);
    successResponse(res, 200, 'Project updated.', { project });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await deleteProject(req.params.id);
    successResponse(res, 200, 'Project deleted.');
  } catch (err) { next(err); }
};

const invite = async (req, res, next) => {
  try {
    const project = await inviteProjectMember(req.params.id, req.body.email, req.body.role);
    successResponse(res, 200, 'Member invited.', { project });
  } catch (err) { next(err); }
};

const removeMember = async (req, res, next) => {
  try {
    await removeProjectMember(req.params.id, req.params.memberId, req.user._id);
    successResponse(res, 200, 'Member removed.');
  } catch (err) { next(err); }
};

export { create, getAll, getOne, update, remove, invite, removeMember };