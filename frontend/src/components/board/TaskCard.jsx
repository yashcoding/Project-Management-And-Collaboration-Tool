import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Avatar from '../common/Avatar';
import { priorityConfig, statusConfig, formatDate, dueDateClass } from '../../utils';

export default function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityCfg = priorityConfig[task.priority] || priorityConfig.medium;
  const dueCls = dueDateClass(task.dueDate, task.status);

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-3.5 cursor-pointer hover:shadow-md hover:border-primary-200 transition-all group select-none">

      {/* Priority + Labels */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={priorityCfg.className}>{priorityCfg.label}</span>
        {task.labels?.map(l => (
          <span key={l} className="badge bg-purple-50 text-purple-700">{l}</span>
        ))}
      </div>

      {/* Title */}
      <p className={`text-sm font-medium text-gray-900 leading-snug mb-2 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
        {task.title}
      </p>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {task.assignee && <Avatar user={task.assignee} size="xs" />}
          {task.dueDate && (
            <span className={`text-xs flex items-center gap-1 ${dueCls}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.activityLog?.length > 0 && (
          <span className="text-xs text-gray-400 flex items-center gap-0.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {task.activityLog.length}
          </span>
        )}
      </div>
    </div>
  );
}
