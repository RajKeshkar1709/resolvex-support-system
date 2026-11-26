import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  History,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badges';

export const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const {
    selectedTicket: ticket,
    ticketDetailLoading: loading,
    ticketActivity: activityHistory,
    comments,
    commentSubmitting,
    ticketError,
    fetchTicketById,
    fetchComments,
    addComment,
    fetchTicketActivity,
    updateTicket,
    deleteTicket,
    markTicketNotificationsAsRead,
  } = useTickets();

  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('comments'); // 'comments' | 'history'
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', description: '', category: 'TECHNICAL' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (ticket) {
      setEditFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        category: ticket.category || 'TECHNICAL',
      });
    }
  }, [ticket]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    const res = await updateTicket(ticket._id, editFormData);
    if (res.success) {
      setIsEditModalOpen(false);
      fetchTicketActivity(id);
    } else {
      setActionError(res.error || 'Failed to update ticket');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      setIsDeleting(true);
      const res = await deleteTicket(ticket._id);
      if (res.success) {
        navigate('/tickets');
      } else {
        alert(res.error || 'Failed to delete ticket');
        setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicketById(id);
      fetchComments(id);
      fetchTicketActivity(id);
      markTicketNotificationsAsRead(id);
    }
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addComment(id, message);
    setMessage('');
    fetchTicketActivity(id); // refresh audit log
  };

  if (ticketError) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ticket Not Found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This ticket may have been deleted or removed by its owner.
        </p>
        <button
          onClick={() => navigate(currentUser?.role === 'ADMIN' ? '/admin/tickets' : '/tickets')}
          className="btn btn-primary btn-sm"
        >
          <ArrowLeft size={16} /> Return to Ticket List
        </button>
      </div>
    );
  }

  if (loading || !ticket) {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="skeleton" style={{ height: '40px', width: '200px', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '200px', marginBottom: '1.5rem' }} />
      </div>
    );
  }

  const isOwner = ticket.createdBy?._id === currentUser?._id;
  const isEditable = isOwner && ticket.status === 'OPEN';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} /> Back to Tickets
        </button>

        {/* Edit and Delete Actions for Ticket Owner (Active when ticket is OPEN) */}
        {isEditable && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn btn-secondary btn-sm text-brand-600 dark:text-brand-400 hover:text-brand-700"
            >
              <Edit3 size={15} /> Edit Ticket
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} /> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Ticket Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{ticket.title}</h2>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            <div>Created: {new Date(ticket.createdAt).toLocaleString()}</div>
            {ticket.assignedTo ? (
              <div style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Assigned: {ticket.assignedTo.name}
              </div>
            ) : (
              <div style={{ marginTop: '0.25rem', color: 'var(--text-muted)' }}>Assigned: Pending Assignment</div>
            )}
          </div>
        </div>

        {/* Ticket Description */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border)',
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
          }}
        >
          {ticket.description}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('comments')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <MessageSquare size={16} /> Conversation ({comments.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <History size={16} /> Activity Audit Log ({activityHistory.length})
        </button>
      </div>

      {/* Tab Content: Conversation */}
      {activeTab === 'comments' && (
        <div className="flex flex-col gap-6">
          {/* Thread */}
          <div className="card flex flex-col gap-4">
            {comments.length === 0 ? (
              <p className="text-center text-slate-400 dark:text-slate-500 py-8 text-sm">
                No messages yet. Post a comment below to reach the support team.
              </p>
            ) : (
              comments.map((c) => {
                const isMe = c.user?._id === currentUser?._id;
                return (
                  <div
                    key={c._id}
                    className={`p-4 rounded-xl max-w-[85%] border transition-colors ${
                      isMe
                        ? 'ml-auto bg-brand-50/80 dark:bg-brand-950/60 border-brand-200/80 dark:border-brand-900/60 text-slate-900 dark:text-slate-100'
                        : 'mr-auto bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5 gap-4">
                      <span className="font-bold text-xs text-brand-700 dark:text-brand-300">
                        {c.user?.name} {c.user?.role === 'ADMIN' && '(Support Agent)'}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{c.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Comment Composer */}
          <div className="card">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Post a Reply</h4>
            <form onSubmit={handleCommentSubmit}>
              <div className="form-group">
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="form-control"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={commentSubmitting || !message.trim()}
                className="btn btn-primary btn-sm"
              >
                <Send size={15} /> {commentSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab Content: Activity Audit Log */}
      {activeTab === 'history' && (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activityHistory.map((act) => (
              <div
                key={act._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.85rem',
                  paddingBottom: '0.85rem',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div className="p-2 bg-brand-50 dark:bg-brand-950/60 rounded-full text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900/60 shrink-0">
                  <History size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{act.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    By {act.actor?.name || 'System'} • {new Date(act.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-w-lg w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Support Ticket</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Title / Subject</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="form-control"
                  maxLength={150}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="form-control"
                >
                  <option value="TECHNICAL">Technical Issue</option>
                  <option value="BILLING">Billing & Subscription</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                  <option value="ACCOUNT">Account & Access</option>
                  <option value="GENERAL">General Inquiries</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={5}
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="form-control"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
