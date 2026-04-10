import { createTask, deleteTask, getTaskById, getTasks, reorderTasks, updateTask } from '../services/task.service.js';
import { successResponse } from '../utils/apiResponse.util.js'

const create = async (req, res, next) => {
  try {
    const task = await createTask(req.params.boardId, req.user._id, req.body);
    successResponse(res, 201, 'Task created.', { task });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { tasks, pagination } = await getTasks(req.params.boardId, req.query);
    successResponse(res, 200, 'Tasks fetched.', { tasks }, pagination);
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const task = await getTaskById(req.params.id);
    successResponse(res, 200, 'Task fetched.', { task });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const task = await updateTask(req.params.id, req.user._id, req.body);
    successResponse(res, 200, 'Task updated.', { task });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await deleteTask(req.params.id);
    successResponse(res, 200, 'Task deleted.');
  } catch (err) { next(err); }
};

const reorder = async (req, res, next) => {
  try {
    await reorderTasks(req.params.boardId, req.body.updates);
    successResponse(res, 200, 'Tasks reordered.');
  } catch (err) { next(err); }
};

export { create, getAll, getOne, update, remove, reorder };