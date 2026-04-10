import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTask } from '../store/slices/taskSlice';
import TaskDetailModal from '../components/task/TaskDetailModal';
import Spinner from '../components/common/Spinner';

export default function TaskDetail() {
  const { taskId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: task, loading } = useSelector(s => s.tasks);

  useEffect(() => { dispatch(fetchTask(taskId)); }, [taskId]);

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;

  return (
    <TaskDetailModal
      task={task}
      isOpen={!!task}
      onClose={() => navigate(-1)}
      onUpdate={() => dispatch(fetchTask(taskId))}
      boardId={task?.board}
    />
  );
}
