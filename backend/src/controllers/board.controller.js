
import { addBoardColumn, createBoard, deleteBoard, deleteBoardColumn, getBoardById, getBoardsByProject, updateBoard, updateBoardColumn } from '../services/board.service.js';
import { successResponse } from  '../utils/apiResponse.util.js';

const create = async (req, res, next) => {
  try {
    const board = await createBoard(req.params.projectId, req.user._id, req.body);
    successResponse(res, 201, 'Board created.', { board });
  } catch (err) { next(err); }
};

const getByProject = async (req, res, next) => {
  try {
    const boards = await getBoardsByProject(req.params.projectId);
    successResponse(res, 200, 'Boards fetched.', { boards });
  } catch (err) { next(err); }
};

const getOne = async (req, res, next) => {
  try {
    const board = await getBoardById(req.params.id);
    successResponse(res, 200, 'Board fetched.', { board });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const board = await updateBoard(req.params.id, req.body);
    successResponse(res, 200, 'Board updated.', { board });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await deleteBoard(req.params.id);
    successResponse(res, 200, 'Board deleted.');
  } catch (err) { next(err); }
};

const addColumn = async (req, res, next) => {
  try {
    const board = await addBoardColumn(req.params.id, req.body);
    successResponse(res, 201, 'Column added.', { board });
  } catch (err) { next(err); }
};

const updateColumn = async (req, res, next) => {
  try {
    const board = await updateBoardColumn(req.params.id, req.params.columnId, req.body);
    successResponse(res, 200, 'Column updated.', { board });
  } catch (err) { next(err); }
};

const deleteColumn = async (req, res, next) => {
  try {
    const board = await deleteBoardColumn(req.params.id, req.params.columnId);
    successResponse(res, 200, 'Column deleted.', { board });
  } catch (err) { next(err); }
};

export { create, getByProject, getOne, update, remove, addColumn, updateColumn, deleteColumn };