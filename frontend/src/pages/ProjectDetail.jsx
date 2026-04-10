import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchProject, inviteMember } from '../store/slices/projectSlice';
import { fetchBoards, createBoard, deleteBoard } from '../store/slices/boardSlice';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import { useForm } from 'react-hook-form';
import { formatDate } from '../utils';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: project, loading: pLoading } = useSelector(s => s.projects);
  const { list: boards, loading: bLoading } = useSelector(s => s.boards);
  const { user } = useSelector(s => s.auth);
  const [boardModal, setBoardModal] = useState(false);
  const [inviteModal, setInviteModal] = useState(false);
  const { register: regBoard, handleSubmit: hsBoard, reset: resetBoard, formState: { isSubmitting: bSubmitting } } = useForm();
  const { register: regInvite, handleSubmit: hsInvite, reset: resetInvite, formState: { isSubmitting: iSubmitting } } = useForm();

  useEffect(() => {
    dispatch(fetchProject(projectId));
    dispatch(fetchBoards(projectId));
  }, [projectId, dispatch]);

  const onCreateBoard = async (data) => {
    const res = await dispatch(createBoard({ projectId, ...data }));
    if (createBoard.fulfilled.match(res)) {
      toast.success('Board created!');
      setBoardModal(false); resetBoard();
    } else toast.error('Failed to create board');
  };

  const onInvite = async (data) => {
    const res = await dispatch(inviteMember({ id: projectId, ...data }));
    if (inviteMember.fulfilled.match(res)) {
      toast.success('Member invited!');
      setInviteModal(false); resetInvite();
    } else toast.error(res.payload || 'Failed to invite member');
  };

  const onDeleteBoard = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this board and all its tasks?')) return;
    await dispatch(deleteBoard(id));
    toast.success('Board deleted');
  };

  if (pLoading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!project) return <div className="p-8 text-gray-500">Project not found.</div>;

  const myRole = project.members?.find(m => m.user?._id === user?._id)?.role ||
    (project.owner?._id === user?._id ? 'owner' : null);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
            style={{ background: project.color || '#6366f1' }}>
            {project.name[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.description && <p className="text-gray-500 mt-0.5">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(myRole === 'owner' || myRole === 'admin') && (
            <button onClick={() => setInviteModal(true)} className="btn-secondary gap-2 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite
            </button>
          )}
          <button onClick={() => setBoardModal(true)} className="btn-primary gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Board
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-700 text-sm">Members ({project.members?.length})</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {project.members?.map(m => (
            <div key={m.user?._id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Avatar user={m.user} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900">{m.user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boards */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Boards ({boards.length})</h2>
        {bLoading ? <Spinner /> : boards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-3">No boards yet. Create your first board.</p>
            <button onClick={() => setBoardModal(true)} className="btn-primary">Create Board</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map(b => (
              <div key={b._id} onClick={() => navigate(`/projects/${projectId}/boards/${b._id}`)}
                className="card p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{b.name}</h3>
                  <button onClick={e => onDeleteBoard(b._id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-1.5 flex-wrap mt-3">
                  {b.columns?.map(c => (
                    <span key={c._id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: c.color || '#e2e8f0', color: '#374151' }}>
                      {c.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">{formatDate(b.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Board Modal */}
      <Modal isOpen={boardModal} onClose={() => { setBoardModal(false); resetBoard(); }} title="New Board">
        <form onSubmit={hsBoard(onCreateBoard)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Board name *</label>
            <input className="input" placeholder="Sprint 1" {...regBoard('name', { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input className="input" placeholder="Optional description" {...regBoard('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setBoardModal(false); resetBoard(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={bSubmitting} className="btn-primary flex-1">
              {bSubmitting ? <Spinner size="sm" /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal isOpen={inviteModal} onClose={() => { setInviteModal(false); resetInvite(); }} title="Invite Member">
        <form onSubmit={hsInvite(onInvite)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
            <input type="email" className="input" placeholder="colleague@example.com" {...regInvite('email', { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="input" {...regInvite('role')}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setInviteModal(false); resetInvite(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={iSubmitting} className="btn-primary flex-1">
              {iSubmitting ? <Spinner size="sm" /> : 'Invite'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
