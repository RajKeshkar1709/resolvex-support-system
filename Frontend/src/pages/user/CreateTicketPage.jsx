import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTickets } from '../../context/TicketContext';

export const CreateTicketPage = () => {
  const { createTicket, ticketActionLoading } = useTickets();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
  });

  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = await createTicket(formData);
    if (result.success) {
      navigate(`/tickets/${result.data._id}`);
    } else {
      setErrorMsg(result.error || 'Failed to submit ticket');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="card">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create Support Ticket</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          Describe the problem you are experiencing in detail so our support team can assist you quickly.
        </p>

        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject / Title</label>
            <input
              type="text"
              name="title"
              required
              maxLength={150}
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Cannot process credit card payment during checkout"
              className="form-control"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
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
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-control"
              >
                <option value="LOW">Low (Minor inconvenience)</option>
                <option value="MEDIUM">Medium (Standard issue)</option>
                <option value="HIGH">High (Major function impaired)</option>
                <option value="URGENT">Urgent (System blocking)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              name="description"
              required
              rows={6}
              value={formData.description}
              onChange={handleChange}
              placeholder="Please explain the steps to reproduce, expected behavior, and observed error..."
              className="form-control"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={ticketActionLoading}
              className="btn btn-primary"
            >
              {ticketActionLoading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
