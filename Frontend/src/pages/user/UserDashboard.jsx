import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Ticket, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';

export const UserDashboard = () => {
  const { user } = useAuth();
  const { tickets, ticketLoading, fetchUserTickets } = useTickets();

  useEffect(() => {
    fetchUserTickets({ limit: 5 });
  }, []);

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const progressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome back, {user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Here is what's happening with your support requests today.
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <PlusCircle size={18} /> New Support Ticket
        </Link>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: '#eff6ff', borderRadius: '10px', color: '#2563eb' }}>
            <Ticket size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{tickets.length}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Recent Tickets</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: '#fffbeb', borderRadius: '10px', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{openCount + progressCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Active Issues</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: '#f0fdf4', borderRadius: '10px', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{resolvedCount}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Resolved Issues</div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.1rem' }}>Recent Tickets</h3>
          <Link to="/tickets" style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>
            View All Tickets &rarr;
          </Link>
        </div>

        {ticketLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '0.5rem' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Ticket size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No tickets found</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Create your first support ticket to get help from our engineering team.
            </p>
            <Link to="/tickets/new" className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Create Support Ticket
            </Link>
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
      </div>
    </div>
  );
};
