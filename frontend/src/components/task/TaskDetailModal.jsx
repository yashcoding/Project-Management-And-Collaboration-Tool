import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { updateTask, deleteTask } from '../../store/slices/taskSlice';
import { commentAPI } from '../../api/index.js';
import Avatar from '../common/Avatar';
import Spinner from '../common/Spinner';
import { priorityConfig, statusConfig, formatDate, timeAgo, dueDateClass } from '../../utils';

export default function TaskDetailModal({ task, isOpen, onClose, onUpdate, boardId }) {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { register, handleSubmit, reset } = useForm();
  const { register: regEdit, handleSubmit: hsEdit, reset: resetEdit } = useForm();

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
      resetEdit({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      });
    }
  }, [isOpen, task?._id]);

  const loadComments = async () => {
    if (!task) return;
    setLoadingComments(true);
    try {
      const { data } = await commentAPI.getByTask(task._id);
      setComments(data.data.comments);
    } catch { toast.error('Failed to load comments'); }
    finally { setLoadingComments(false); }
  };

  const onAddComment = async ({ text }) => {
    if (!text.trim()) return;
    setSubmittingComment(true);
    try {
      const { data } = await commentAPI.add(task._id, { text });
      setComments(c => [...c, data.data.comment]);
      reset();
    } catch { toast.error('Failed to add comment'); }
    finally { setSubmittingComment(false); }
  };

  const onDeleteComment = async (commentId) => {
    try {
      await commentAPI.delete(commentId);
      setComments(c => c.filter(x => x._id !== commentId));
    } catch { toast.error('Failed to delete comment'); }
  };

  const onSaveEdit = async (data) => {
    if (data.dueDate === '') data.dueDate = null;
    const res = await dispatch(updateTask({ id: task._id, ...data }));
    if (updateTask.fulfilled.match(res)) {
      toast.success('Task updated');
      setEditMode(false);
    } else toast.error('Failed to update task');
  };

  const onDelete = async () => {
    if (!confirm('Delete this task?')) return;
    const res = await dispatch(deleteTask(task._id));
    if (deleteTask.fulfilled.match(res)) {
      toast.success('Task deleted');
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  const priorityCfg = priorityConfig[task.priority] || priorityConfig.medium;
  const statusCfg = statusConfig[task.status] || statusConfig.todo;
  const dueCls = dueDateClass(task.dueDate, task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <span className={priorityCfg.className}>{priorityCfg.label}</span>
            <span className={statusCfg.className}>{statusCfg.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(e => !e)}
              className="btn-ghost btn-sm gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button onClick={onDelete} className="btn-ghost btn-sm text-red-500 hover:bg-red-50 gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {/* Edit form or view */}
          {editMode ? (
            <form onSubmit={hsEdit(onSaveEdit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <input className="input" {...regEdit('title', { required: true })} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea className="input resize-none" rows={4} {...regEdit('description')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                  <select className="input" {...regEdit('priority')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select className="input" {...regEdit('status')}>
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Due date</label>
                  <input type="date" className="input" {...regEdit('dueDate')} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditMode(false)} className="btn-secondary btn-sm flex-1">Cancel</button>
                <button type="submit" className="btn-primary btn-sm flex-1">Save</button>
              </div>
            </form>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h2>
              {task.description && <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>}

              {/* Meta grid */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Assignee</p>
                  {task.assignee
                    ? <div className="flex items-center gap-2"><Avatar user={task.assignee} size="sm" /><span className="text-sm">{task.assignee.name}</span></div>
                    : <span className="text-sm text-gray-400">Unassigned</span>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Due date</p>
                  {task.dueDate
                    ? <span className={`text-sm ${dueCls}`}>{formatDate(task.dueDate)}</span>
                    : <span className="text-sm text-gray-400">No due date</span>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Created by</p>
                  {task.createdBy && <div className="flex items-center gap-2"><Avatar user={task.createdBy} size="sm" /><span className="text-sm">{task.createdBy.name}</span></div>}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Created</p>
                  <span className="text-sm text-gray-600">{formatDate(task.createdAt)}</span>
                </div>
              </div>

              {/* Labels */}
              {task.labels?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">Labels</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {task.labels.map(l => <span key={l} className="badge bg-purple-50 text-purple-700">{l}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Comments ({comments.length})
            </h3>

            {loadingComments ? <Spinner size="sm" /> : (
              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c._id} className="flex gap-3 group">
                    <Avatar user={c.author} size="sm" className="flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{c.author?.name}</span>
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                        {c.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                      </div>
                      <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">{c.text}</p>
                    </div>
                    {c.author?._id === user?._id && (
                      <button onClick={() => onDeleteComment(c._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition-all self-start mt-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <form onSubmit={handleSubmit(onAddComment)} className="flex gap-2 mt-4">
              <Avatar user={user} size="sm" className="flex-shrink-0 mt-1" />
              <div className="flex-1 flex gap-2">
                <input className="input flex-1" placeholder="Add a comment..."
                  {...register('text', { required: true })} />
                <button type="submit" disabled={submittingComment} className="btn-primary btn-sm px-4">
                  {submittingComment ? <Spinner size="sm" /> : 'Send'}
                </button>
              </div>
            </form>
          </div>

          {/* Activity log */}
          {task.activityLog?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Activity
              </h3>
              <div className="space-y-2">
                {[...task.activityLog].reverse().slice(0, 10).map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                    <span>
                      <span className="font-medium text-gray-700">{log.user?.name || 'Someone'}</span>
                      {' '}{log.action}
                      {log.oldValue && log.newValue && (
                        <> from <span className="text-gray-400 line-through">{log.oldValue}</span> to <span className="font-medium text-gray-700">{log.newValue}</span></>
                      )}
                      {' · '}{timeAgo(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
