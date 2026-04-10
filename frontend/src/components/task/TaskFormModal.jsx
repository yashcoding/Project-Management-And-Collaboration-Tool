import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../common/Modal';
import Spinner from '../common/Spinner';

export default function TaskFormModal({ isOpen, onClose, onSubmit, boardId, defaultValues }) {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({ defaultValues });

  useEffect(() => {
    if (isOpen) reset(defaultValues || {});
  }, [isOpen]);

  const onFormSubmit = async (data) => {
    if (data.dueDate === '') data.dueDate = null;
    await onSubmit(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={defaultValues ? 'Edit Task' : 'New Task'} size="lg">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Task title"
            {...register('title', { required: 'Title is required' })} />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="What needs to be done?"
            {...register('description')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select className="input" {...register('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="input" {...register('status')}>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
          <input type="date" className="input" {...register('dueDate')} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? <Spinner size="sm" /> : defaultValues ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
