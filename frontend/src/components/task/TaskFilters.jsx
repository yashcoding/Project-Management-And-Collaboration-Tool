import { useState } from 'react';
import { useDebounce } from '../../hooks';
import { useEffect } from 'react';

export default function TaskFilters({ filters, onChange, members = [] }) {
  const [search, setSearch] = useState(filters.search || '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    onChange(f => ({ ...f, search: debouncedSearch || undefined }));
  }, [debouncedSearch]);

  const handleFilter = (key, value) => {
    onChange(f => ({ ...f, [key]: value || undefined }));
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input pl-8 py-1.5 text-sm w-48"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status filter */}
      <select
        className="input py-1.5 text-sm w-36"
        value={filters.status || ''}
        onChange={e => handleFilter('status', e.target.value)}
      >
        <option value="">All statuses</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      {/* Priority filter */}
      <select
        className="input py-1.5 text-sm w-36"
        value={filters.priority || ''}
        onChange={e => handleFilter('priority', e.target.value)}
      >
        <option value="">All priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={() => { onChange({}); setSearch(''); }}
          className="btn-ghost btn-sm text-gray-500 gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}
