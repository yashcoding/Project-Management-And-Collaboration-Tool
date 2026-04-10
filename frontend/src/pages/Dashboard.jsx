import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProjects, createProject, deleteProject } from '../store/slices/projectSlice';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import Avatar from '../components/common/Avatar';
import { useForm } from 'react-hook-form';
import { formatDate } from '../utils';

function ProjectCard({ project, onDelete, onClick }) {
  return (
    <div onClick={onClick} className="card p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: project.color || '#6366f1' }}>
            {project.name[0].toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{project.name}</h3>
            <p className="text-xs text-gray-500">by {project.owner?.name}</p>
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onDelete(project._id); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      {project.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 4).map(m => (
            <Avatar key={m.user?._id} user={m.user} size="xs" className="ring-2 ring-white" />
          ))}
          {project.members?.length > 4 && (
            <div className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white flex items-center justify-center text-xs text-gray-600">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400">{formatDate(project.updatedAt)}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: projects, loading } = useSelector(s => s.projects);
  const { user } = useSelector(s => s.auth);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  const onCreateProject = async (data) => {
    const res = await dispatch(createProject(data));
    if (createProject.fulfilled.match(res)) {
      toast.success('Project created!');
      setModalOpen(false);
      reset();
    } else {
      toast.error('Failed to create project');
    }
  };

  const onDelete = async (id) => {
    if (!confirm('Delete this project and all its data?')) return;
    const res = await dispatch(deleteProject(id));
    if (deleteProject.fulfilled.match(res)) toast.success('Project deleted');
    else toast.error('Failed to delete project');
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good {greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here are your projects</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      <div className="mb-6">
        <input className="input max-w-xs" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to get started</p>
          <button onClick={() => setModalOpen(true)} className="btn-primary">Create Project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p._id} project={p} onDelete={onDelete} onClick={() => navigate(`/projects/${p._id}`)} />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="New Project">
        <form onSubmit={handleSubmit(onCreateProject)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project name *</label>
            <input className="input" placeholder="My Awesome Project" {...register('name', { required: true })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="What is this project about?" {...register('description')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {['#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'].map(c => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" value={c} {...register('color')} className="sr-only" defaultChecked={c === '#6366f1'} />
                  <div className="w-7 h-7 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                    style={{ background: c }} />
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); reset(); }} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? <Spinner size="sm" /> : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
