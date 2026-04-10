import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { userAPI } from '../api/index.js';
import { fetchCurrentUser } from '../store/slices/authSlice';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';

export default function Profile() {
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: user?.name || '', avatar: user?.avatar || '' },
  });

  const onSubmit = async (data) => {
    try {
      await userAPI.updateProfile(data);
      await dispatch(fetchCurrentUser());
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar user={user} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="badge bg-primary-50 text-primary-700 mt-1 capitalize">{user?.role}</span>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input className="input" {...register('name', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input className="input" placeholder="https://..." {...register('avatar')} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
                {isSubmitting ? <Spinner size="sm" /> : 'Save'}
              </button>
            </div>
          </form>
        ) : (
          <button onClick={() => setEditing(true)} className="btn-secondary w-full">Edit Profile</button>
        )}
      </div>
    </div>
  );
}
