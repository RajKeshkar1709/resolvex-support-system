import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, PlusCircle, RefreshCw } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';

export const MyTicketsPage = () => {
  const { tickets, pagination, ticketLoading: loading, fetchUserTickets } = useTickets();

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    page: 1,
  });

  const loadTickets = () => {
    fetchUserTickets(filters);
  };

  useEffect(() => {
    loadTickets();
  }, [filters.page, filters.search, filters.status, filters.priority, filters.category]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Support Tickets</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track and manage your submitted requests
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={18} /> New Ticket
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <div>
            <input
              type="text"
              placeholder="Search ID or subject..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
              className="form-control"
            />
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
            <p style={{ color: 'var(--text-secondary)' }}>No tickets matched your query.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      <Link to={`/tickets/${ticket._id}`}>{ticket.ticketNumber}</Link>
                    </td>
                    <td style={{ maxWidth: '300px', fontWeight: 500 }}>{ticket.title}</td>
                    <td>{ticket.category}</td>
                    <td><PriorityBadge priority={ticket.priority} /></td>
                    <td><StatusBadge status={ticket.status} /></td>
                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/tickets/${ticket._id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
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
              Page {pagination.page} of {pagination.pages} ({pagination.total} total)
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
