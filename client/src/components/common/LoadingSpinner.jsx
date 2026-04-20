export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizeClasses[size]} border-3 border-surface-600 border-t-primary-500 rounded-full animate-spin`}
         style={{ borderWidth: '3px' }} />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-surface-600 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-surface-400 text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
}
