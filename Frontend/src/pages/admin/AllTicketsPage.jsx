import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '../../context/TicketContext';

export const AllTicketsPage = () => {
  const {
    tickets,
    pagination,
    ticketLoading: loading,
    adminsList: admins,
    fetchAdminTickets,
    fetchAdminsList,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
  } = useTickets();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
  });

  const loadTickets = () => {
    fetchAdminTickets(filters);
  };

  useEffect(() => {
    fetchAdminsList();
  }, []);

  useEffect(() => {
    loadTickets();
  }, [filters.page, filters.search, filters.status, filters.priority, filters.category]);

  const handleStatusChange = async (id, status) => {
    await updateTicketStatus(id, status);
    loadTickets();
  };

  const handlePriorityChange = async (id, priority) => {
    await updateTicketPriority(id, priority);
    loadTickets();
  };

  const handleAssignChange = async (id, assignedTo) => {
    if (!assignedTo) return;
    await assignTicket(id, assignedTo);
    loadTickets();
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Manage All Support Tickets</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Assign inquiries, escalate priorities, and modify ticket lifecycles
        </p>
      </div>

      {/* Filter bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          <input
            type="text"
            placeholder="Search ticket # or subject..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && loadTickets()}
            className="form-control"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value, page: 1 }))}
            className="form-control"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }))}
            className="form-control"
          >
            <option value="">All Categories</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BILLING">Billing</option>
            <option value="FEATURE_REQUEST">Feature Request</option>
            <option value="ACCOUNT">Account</option>
            <option value="GENERAL">General</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No tickets found matching filters.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Customer</th>
                  <th>Priority</th>
                  <th>Status Workflow</th>
                  <th>Assignee</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <Link
                        to={`/admin/tickets/${ticket._id}`}
                        style={{ fontWeight: 700, color: 'var(--primary)' }}
                      >
                        {ticket.ticketNumber}
                      </Link>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ticket.title}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ticket.createdBy?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {ticket.createdBy?.email}
                      </div>
                    </td>
                    <td>
                      <select
                        value={ticket.priority}
                        onChange={(e) => handlePriorityChange(ticket._id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="LOW" className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">LOW</option>
                        <option value="MEDIUM" className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400">MEDIUM</option>
                        <option value="HIGH" className="bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400">HIGH</option>
                        <option value="URGENT" className="bg-white dark:bg-slate-800 text-red-600 dark:text-red-400">URGENT</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        className="text-xs font-bold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="OPEN" className="bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400">OPEN</option>
                        <option value="IN_PROGRESS" className="bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400">IN_PROGRESS</option>
                        <option value="RESOLVED" className="bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">RESOLVED</option>
                        <option value="CLOSED" className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400">CLOSED</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={ticket.assignedTo?._id || ''}
                        onChange={(e) => handleAssignChange(ticket._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 max-w-[140px] shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="" className="bg-white dark:bg-slate-800 text-slate-500">Unassigned</option>
                        {admins.map((adm) => (
                          <option key={adm._id} value={adm._id} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
                            {adm.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/admin/tickets/${ticket._id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        View & Reply
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Page {pagination.page} of {pagination.pages} ({pagination.total} tickets total)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="btn btn-secondary btn-sm"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="btn btn-secondary btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
