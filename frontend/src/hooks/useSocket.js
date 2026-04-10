import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector, useDispatch } from 'react-redux';
import { addTaskFromSocket, updateTaskFromSocket, removeTaskFromSocket } from '../store/slices/taskSlice';

let socketInstance = null;

export const useSocket = () => {
  const { token } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const ref = useRef(null);

  useEffect(() => {
    if (!token) return;
    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_SOCKET_URL || '', {
        auth: { token },
        transports: ['websocket'],
      });
    }
    ref.current = socketInstance;

    socketInstance.on('task:created', (task) => dispatch(addTaskFromSocket(task)));
    socketInstance.on('task:updated', (task) => dispatch(updateTaskFromSocket(task)));
    socketInstance.on('task:deleted', (payload) => dispatch(removeTaskFromSocket(payload)));

    return () => {
      socketInstance?.off('task:created');
      socketInstance?.off('task:updated');
      socketInstance?.off('task:deleted');
    };
  }, [token, dispatch]);

  const joinBoard = (boardId) => socketInstance?.emit('board:join', boardId);
  const leaveBoard = (boardId) => socketInstance?.emit('board:leave', boardId);

  return { socket: ref.current, joinBoard, leaveBoard };
};
