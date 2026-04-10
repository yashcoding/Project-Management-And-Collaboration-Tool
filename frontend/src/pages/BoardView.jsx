import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import toast from 'react-hot-toast';
import { fetchBoard } from '../store/slices/boardSlice';
import { fetchTasks, createTask, updateTask, reorderTasks, setTasksLocal } from '../store/slices/taskSlice';
import { useSocket } from '../hooks/useSocket';
import BoardColumn from '../components/board/BoardColumn';
import TaskCard from '../components/board/TaskCard';
import TaskFormModal from '../components/task/TaskFormModal';
import TaskDetailModal from '../components/task/TaskDetailModal';
import TaskFilters from '../components/task/TaskFilters';
import Spinner from '../components/common/Spinner';

export default function BoardView() {
  const { projectId, boardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: board, loading: bLoading } = useSelector(s => s.boards);
  const { list: tasks, loading: tLoading } = useSelector(s => s.tasks);
  const [activeTask, setActiveTask] = useState(null);
  const [createModal, setCreateModal] = useState({ open: false, columnId: null });
  const [detailTask, setDetailTask] = useState(null);
  const [filters, setFilters] = useState({});
  const { joinBoard, leaveBoard } = useSocket();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    dispatch(fetchBoard(boardId));
    dispatch(fetchTasks({ boardId, params: filters }));
    joinBoard(boardId);
    return () => leaveBoard(boardId);
  }, [boardId, dispatch]);

  useEffect(() => {
    dispatch(fetchTasks({ boardId, params: filters }));
  }, [filters, boardId]);

  const getColumnTasks = (columnId) =>
    [...tasks].filter(t => t.columnId === columnId || (!t.columnId && board?.columns?.[0]?._id === columnId))
      .sort((a, b) => a.order - b.order);

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t._id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over || active.id === over.id) return;

    const draggedTask = tasks.find(t => t._id === active.id);
    if (!draggedTask) return;

    // Determine target column
    const targetColumnId = over.id.toString().length === 24
      ? over.id  // dropped on a column (droppable)
      : tasks.find(t => t._id === over.id)?.columnId;

    if (!targetColumnId) return;

    const columnTasks = getColumnTasks(targetColumnId);
    const overTask = tasks.find(t => t._id === over.id);

    let newOrder;
    if (!overTask || overTask.columnId !== targetColumnId) {
      newOrder = (columnTasks[columnTasks.length - 1]?.order || 0) + 1000;
    } else {
      const overIdx = columnTasks.findIndex(t => t._id === over.id);
      const prev = columnTasks[overIdx - 1]?.order || 0;
      const next = columnTasks[overIdx]?.order || prev + 2000;
      newOrder = (prev + next) / 2;
    }

    // Optimistic update
    const updatedTasks = tasks.map(t =>
      t._id === active.id ? { ...t, columnId: targetColumnId, order: newOrder } : t
    );
    dispatch(setTasksLocal(updatedTasks));

    await dispatch(reorderTasks({
      boardId,
      updates: [{ _id: active.id, columnId: targetColumnId, order: newOrder }],
    }));
  };

  const handleCreateTask = async (data) => {
    const res = await dispatch(createTask({ boardId, columnId: createModal.columnId, ...data }));
    if (createTask.fulfilled.match(res)) {
      toast.success('Task created!');
      setCreateModal({ open: false, columnId: null });
    } else toast.error('Failed to create task');
  };

  const handleUpdateTask = async (id, data) => {
    await dispatch(updateTask({ id, ...data }));
  };

  if (bLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!board) return <div className="p-8 text-gray-500">Board not found.</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Topbar */}
      <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center gap-4 flex-shrink-0">
        <button onClick={() => navigate(`/projects/${projectId}`)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-gray-900 text-lg">{board.name}</h1>
          {board.description && <p className="text-xs text-gray-400">{board.description}</p>}
        </div>
        <div className="ml-auto">
          <button onClick={() => setCreateModal({ open: true, columnId: board.columns?.[0]?._id })}
            className="btn-primary gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0">
        <TaskFilters filters={filters} onChange={setFilters} members={[]} />
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto p-6">
        {tLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 h-full">
              {board.columns?.map(col => (
                <BoardColumn
                  key={col._id}
                  column={col}
                  tasks={getColumnTasks(col._id)}
                  onAddTask={(colId) => setCreateModal({ open: true, columnId: colId })}
                  onTaskClick={(task) => setDetailTask(task)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Modals */}
      <TaskFormModal
        isOpen={createModal.open}
        onClose={() => setCreateModal({ open: false, columnId: null })}
        onSubmit={handleCreateTask}
        boardId={boardId}
      />
      <TaskDetailModal
        task={detailTask}
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        onUpdate={handleUpdateTask}
        boardId={boardId}
      />
    </div>
  );
}
