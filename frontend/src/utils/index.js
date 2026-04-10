import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '—';
  return format(new Date(date), 'MMM d, yyyy');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const isDueSoon = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const diff = d - new Date();
  return diff > 0 && diff < 48 * 60 * 60 * 1000;
};

export const isOverdue = (date) => {
  if (!date) return false;
  return isPast(new Date(date));
};

export const dueDateClass = (date, status) => {
  if (!date || status === 'done') return 'text-gray-500';
  if (isOverdue(date)) return 'text-red-600 font-medium';
  if (isDueSoon(date)) return 'text-orange-500 font-medium';
  return 'text-gray-500';
};

export const priorityConfig = {
  low:    { label: 'Low',    className: 'priority-low',    color: '#16a34a' },
  medium: { label: 'Medium', className: 'priority-medium', color: '#ca8a04' },
  high:   { label: 'High',   className: 'priority-high',   color: '#ea580c' },
  urgent: { label: 'Urgent', className: 'priority-urgent', color: '#dc2626' },
};

export const statusConfig = {
  todo:        { label: 'Todo',        className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-in_progress' },
  done:        { label: 'Done',        className: 'status-done' },
};

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const avatarColors = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

export const avatarColor = (name = '') => {
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return avatarColors[sum % avatarColors.length];
};
