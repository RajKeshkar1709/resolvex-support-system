import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';

export const GlobalActivityPage = () => {
  const { globalActivity: activities, adminLoading: loading, fetchGlobalActivity } = useTickets();

  useEffect(() => {
    fetchGlobalActivity(50);
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Immutable System Audit Logs</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Real-time event stream logging all lifecycle transitions and administrative modifications
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: '2rem' }}>
            <div className="skeleton" style={{ height: '40px', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ height: '40px', marginBottom: '0.75rem' }} />
            <div className="skeleton" style={{ height: '40px' }} />
          </div>
        ) : activities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No activity logs recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((act) => (
              <div
                key={act._id}
                className="flex justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/60 shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {act.description}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Actor: <strong className="text-slate-700 dark:text-slate-300">{act.actor?.name}</strong> ({act.actor?.role}) • Action Type:{' '}
                      <code className="text-brand-600 dark:text-brand-400 font-mono text-[11px]">{act.action}</code>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {act.ticket && (
                    <div>
                      <Link
                        to={`/admin/tickets/${act.ticket._id}`}
                        className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        {act.ticket.ticketNumber}
                      </Link>
                    </div>
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(act.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
