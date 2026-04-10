import Board from "../models/Board.js";
import Task from "../models/Task.js";
import AppError from "../utils/AppError.js";

const createBoard = async (projectId, userId, data) => {
  return Board.create({ ...data, project: projectId, createdBy: userId });
};

const getBoardsByProject = async (projectId) => {
  return Board.find({ project: projectId, isArchived: false })
    .populate('createdBy', 'name email avatar')
    .sort({ createdAt: 1 });
};

const getBoardById = async (boardId) => {
  const board = await Board.findById(boardId).populate('createdBy', 'name email avatar');
  if (!board) throw new AppError('Board not found.', 404);
  return board;
};

const updateBoard = async (boardId, data) => {
  const board = await Board.findByIdAndUpdate(boardId, data, { new: true, runValidators: true });
  if (!board) throw new AppError('Board not found.', 404);
  return board;
};

const deleteBoard = async (boardId) => {
  const board = await Board.findByIdAndDelete(boardId);
  if (!board) throw new AppError('Board not found.', 404);
  await Task.deleteMany({ board: boardId });
};

const addBoardColumn = async (boardId, columnData) => {
  const board = await Board.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);
  board.columns.push({ ...columnData, order: board.columns.length });
  await board.save();
  return board;
};

const updateBoardColumn = async (boardId, columnId, data) => {
  const board = await Board.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);
  const col = board.columns.id(columnId);
  if (!col) throw new AppError('Column not found.', 404);
  Object.assign(col, data);
  await board.save();
  return board;
};

const deleteBoardColumn = async (boardId, columnId) => {
  const board = await Board.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);
  board.columns = board.columns.filter(c => c._id.toString() !== columnId);
  await board.save();
  await Task.updateMany({ board: boardId, columnId }, { columnId: null, status: 'todo' });
  return board;
};

export { createBoard, getBoardsByProject, getBoardById, updateBoard, deleteBoard, addBoardColumn, updateBoardColumn, deleteBoardColumn };