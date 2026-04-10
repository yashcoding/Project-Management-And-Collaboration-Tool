
import { addComment, deleteComment, getComments, updateComment } from '../services/comment.service.js';
import  { successResponse } from '../utils/apiResponse.util.js'

const add = async (req, res, next) => {
  try {
    const comment = await addComment(req.params.taskId, req.user._id, req.body);
    successResponse(res, 201, 'Comment added.', { comment });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const comments = await getComments(req.params.taskId);
    successResponse(res, 200, 'Comments fetched.', { comments });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const comment = await updateComment(req.params.id, req.user._id, req.body.text);
    successResponse(res, 200, 'Comment updated.', { comment });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await deleteComment(req.params.id, req.user._id);
    successResponse(res, 200, 'Comment deleted.');
  } catch (err) { next(err); }
};

export { add, getAll, update, remove };