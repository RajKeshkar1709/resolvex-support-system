
const statusMap = {
  OPEN: { label: 'Open', className: 'badge-open' },
  IN_PROGRESS: { label: 'In Progress', className: 'badge-in_progress' },
  RESOLVED: { label: 'Resolved', className: 'badge-resolved' },
  CLOSED: { label: 'Closed', className: 'badge-closed' },
};

export const StatusBadge = ({ status }) => {
  const current = statusMap[status] || { label: status, className: 'badge-closed' };
  return <span className={`badge ${current.className}`}>{current.label}</span>;
};

const priorityStyles = {
  LOW: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' },
  MEDIUM: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  HIGH: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  URGENT: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
};

export const PriorityBadge = ({ priority }) => {
  const style = priorityStyles[priority] || priorityStyles.MEDIUM;
  return (
    <span
      className="badge"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {priority}
    </span>
  );
};
