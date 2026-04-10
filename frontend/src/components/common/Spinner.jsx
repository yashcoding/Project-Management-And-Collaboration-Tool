export default function Spinner({ size = 'md', className = '' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size];
  return (
    <div className={`inline-block ${s} animate-spin rounded-full border-2 border-solid border-primary-600 border-r-transparent ${className}`} />
  );
}
