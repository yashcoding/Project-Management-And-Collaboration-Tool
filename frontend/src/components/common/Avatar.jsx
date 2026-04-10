import { getInitials, avatarColor } from '../../utils';

export default function Avatar({ user, size = 'md', className = '' }) {
  const s = { xs:'h-6 w-6 text-xs', sm:'h-8 w-8 text-xs', md:'h-9 w-9 text-sm', lg:'h-11 w-11 text-base' }[size];
  if (!user) return null;
  if (user.avatar) return <img src={user.avatar} alt={user.name} className={`${s} rounded-full object-cover ${className}`} />;
  return (
    <div className={`${s} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${className}`}
      style={{ background: avatarColor(user.name) }}>
      {getInitials(user.name)}
    </div>
  );
}
