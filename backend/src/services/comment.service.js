import Comment from "../models/Comment.js";
import Task from "../models/Task.js";
import { getIO } from "../sockets/socket.handler.js";
import AppError from "../utils/AppError.js";

const addComment = async (taskId, userId, { text, mentions }) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError('Task not found.', 404);

  const comment = await Comment.create({ text, task: taskId, author: userId, mentions: mentions || [] });
  await comment.populate('author', 'name email avatar');

  task.activityLog.push({ user: userId, action: 'added a comment' });
  await task.save({ validateBeforeSave: false });

  getIO()?.to(`board:${task.board}`).emit('comment:added', { taskId, comment });
  return comment;
};

const getComments = async (taskId) => {
  return Comment.find({ task: taskId })
    .populate('author', 'name email avatar')
    .populate('mentions', 'name email')
    .sort({ createdAt: 1 });
};

const updateComment = async (commentId, userId, text) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError('Comment not found.', 404);
  if (comment.author.toString() !== userId.toString()) throw new AppError('Not authorized.', 403);
  comment.text = text;
  comment.isEdited = true;
  await comment.save();
  await comment.populate('author', 'name email avatar');
  return comment;
};

const deleteComment = async (commentId, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new AppError('Comment not found.', 404);
  if (comment.author.toString() !== userId.toString()) throw new AppError('Not authorized.', 403);
  await comment.deleteOne();
};
export { addComment, getComments, updateComment, deleteComment };