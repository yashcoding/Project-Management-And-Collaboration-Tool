import Board from "../models/Board.js";
import Task from "../models/Task.js";
import { getIO } from "../sockets/socket.handler.js";
import { paginationMeta } from "../utils/apiResponse.util.js";
import AppError from "../utils/AppError.js";

const createTask = async (boardId, userId, data) => {
  const board = await Board.findById(boardId);
  if (!board) throw new AppError('Board not found.', 404);

  const maxOrder = await Task.findOne({ board: boardId }).sort('-order').select('order');
  const order = maxOrder ? maxOrder.order + 1000 : 1000;

  // Default columnId to first column
  const columnId = data.columnId || (board.columns[0]?._id ?? null);

  const task = await Task.create({
    ...data,
    board: boardId,
    project: board.project,
    createdBy: userId,
    order,
    columnId,
    activityLog: [{ user: userId, action: 'created task' }],
  });

  await task.populate([
    { path: 'assignee', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  getIO()?.to(`board:${boardId}`).emit('task:created', task);
  return task;
};

const getTasks = async (boardId, query) => {
  const { page = 1, limit = 50, status, priority, assignee, search, dueDate } = query;
  const skip = (page - 1) * limit;
  const filter = { board: boardId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;
  if (dueDate) filter.dueDate = { $lte: new Date(dueDate) };
  if (search) filter.$text = { $search: search };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Task.countDocuments(filter),
  ]);

  return { tasks, pagination: paginationMeta(total, page, limit) };
};

const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('activityLog.user', 'name avatar');
  if (!task) throw new AppError('Task not found.', 404);
  return task;
};

const updateTask = async (taskId, userId, data) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('Task not found.', 404);

  const activityEntries = [];
  const trackFields = ['status', 'priority', 'assignee', 'dueDate', 'title'];
  trackFields.forEach(field => {
    if (data[field] !== undefined && String(data[field]) !== String(task[field])) {
      activityEntries.push({
        user: userId,
        action: `changed ${field}`,
        field,
        oldValue: String(task[field] ?? ''),
        newValue: String(data[field] ?? ''),
      });
    }
  });

  Object.assign(task, data);
  if (activityEntries.length) task.activityLog.push(...activityEntries);
  await task.save();

  await task.populate([
    { path: 'assignee', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  getIO()?.to(`board:${task.board}`).emit('task:updated', task);
  return task;
};

const deleteTask = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  if (!task) throw new AppError('Task not found.', 404);
  getIO()?.to(`board:${task.board}`).emit('task:deleted', { _id: taskId });
};

const reorderTasks = async (boardId, updates) => {
  // updates: [{ _id, order, columnId, status }]
  const bulkOps = updates.map(({ _id, order, columnId, status }) => ({
    updateOne: {
      filter: { _id, board: boardId },
      update: { $set: { order, ...(columnId !== undefined && { columnId }), ...(status && { status }) } },
    },
  }));
  await Task.bulkWrite(bulkOps);
  getIO()?.to(`board:${boardId}`).emit('tasks:reordered', updates);
};

export { createTask, getTasks, getTaskById, updateTask, deleteTask, reorderTasks };