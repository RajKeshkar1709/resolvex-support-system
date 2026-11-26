import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';

const PRIORITY_COLORS = {
  LOW: '#10b981',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  URGENT: '#ef4444',
};

export const AdminDashboard = () => {
  const { adminStats: stats, adminLoading: loading, fetchDashboardStats } = useTickets();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading || !stats) {
    return (
      <div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          Support Operations Analytics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="skeleton" style={{ height: '110px' }} />
          <div className="skeleton" style={{ height: '110px' }} />
          <div className="skeleton" style={{ height: '110px' }} />
          <div className="skeleton" style={{ height: '110px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="skeleton" style={{ height: '300px' }} />
          <div className="skeleton" style={{ height: '300px' }} />
        </div>
      </div>
    );
  }

  // Format charts data
  const priorityChartData = Object.entries(stats.priorityDistribution || {}).map(([key, val]) => ({
    name: key,
    value: val,
    color: PRIORITY_COLORS[key] || '#94a3b8',
  }));

  const categoryChartData = (stats.categoryDistribution || []).map((c) => ({
    category: c.category.replace('_', ' '),
    count: c.count,
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Support Operations Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Live enterprise telemetry and support SLA performance
          </p>
        </div>
        <Link to="/admin/tickets" className="btn btn-primary">
          Manage All Tickets <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Total Inquiries</span>
            <Ticket size={18} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem' }}>
            {stats.counts.total}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All time tickets</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2563eb' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Open / Awaiting Action</span>
            <AlertTriangle size={18} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: '#1d4ed8' }}>
            {stats.counts.open}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Needs initial response</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d97706' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>In Progress</span>
            <Clock size={18} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: '#b45309' }}>
            {stats.counts.inProgress}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under investigation</span>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Resolved / Closed</span>
            <CheckCircle2 size={18} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.5rem', color: '#15803d' }}>
            {stats.counts.resolved + stats.counts.closed}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Successfully resolved</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Category Breakdown (Bar Chart) */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>Tickets by Category</h3>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="category" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie Chart) */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.5rem' }}>Priority Distribution</h3>
          <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityChartData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '130px' }}>
              {priorityChartData.map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }} />
                  <span>{p.name}: <strong>{p.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Live Feed */}
      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.05rem' }}>Recent Operational Activity</h3>
          <Link to="/admin/activity" style={{ color: 'var(--primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
            View Full Audit Trail &rarr;
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {stats.recentActivity && stats.recentActivity.map((act) => (
            <div
              key={act._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{act.description}</span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Actor: {act.actor?.name} ({act.actor?.email})
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date(act.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
