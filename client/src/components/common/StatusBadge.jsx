export default function StatusBadge({ status }) {
  const map = {
    APPROVED: 'badge-approved',
    PENDING: 'badge-pending',
    REJECTED: 'badge-rejected',
    VERIFIED: 'badge-verified',
    ACTIVE: 'badge-active',
    REQUESTED: 'badge-requested',
    COMPLETED: 'badge-completed',
    AVAILABLE: 'badge-available',
    IN_USE: 'badge-in-use',
  };
  const cls = map[status] || 'badge bg-surface-600/30 text-surface-300';
  return <span className={cls}>{status?.replace('_', ' ')}</span>;
}
