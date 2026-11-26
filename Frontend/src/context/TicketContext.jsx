import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  // Tickets State
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketActivity, setTicketActivity] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);
  const [ticketError, setTicketError] = useState(null);

  // Comments State
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Admin Specific State
  const [adminStats, setAdminStats] = useState(null);
  const [globalActivity, setGlobalActivity] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // 1. Fetch User Tickets
  const fetchUserTickets = async (params) => {
    setTicketLoading(true);
    setTicketError(null);
    try {
      const res = await axiosClient.get('/tickets', { params });
      setTickets(res.data.data || []);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (err) {
      setTicketError(err.response?.data?.message || err.message);
    } finally {
      setTicketLoading(false);
    }
  };

  // 2. Fetch Admin Tickets
  const fetchAdminTickets = async (params) => {
    setTicketLoading(true);
    setTicketError(null);
    try {
      const res = await axiosClient.get('/admin/tickets', { params });
      const ticketsData = res.data?.data || res.data;
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
      if (res.data?.pagination) setPagination(res.data.pagination);
    } catch (err) {
      setTicketError(err.response?.data?.message || err.message);
    } finally {
      setTicketLoading(false);
    }
  };

  // 3. Fetch Ticket Details
  const fetchTicketById = async (id) => {
    setTicketLoading(true);
    setTicketError(null);
    try {
      const res = await axiosClient.get(`/tickets/${id}`);
      setSelectedTicket(res.data.data);
      return res.data.data;
    } catch (err) {
      setTicketError(err.response?.data?.message || 'Ticket not found');
      setSelectedTicket(null);
      return null;
    } finally {
      setTicketLoading(false);
    }
  };

  // 4. Create Ticket
  const createTicket = async (formData) => {
    setTicketActionLoading(true);
    try {
      const res = await axiosClient.post('/tickets', formData);
      setTickets((prev) => [res.data.data, ...prev]);
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setTicketActionLoading(false);
    }
  };

  // 5. Update Ticket
  const updateTicket = async (id, data) => {
    try {
      const res = await axiosClient.put(`/tickets/${id}`, data);
      setSelectedTicket(res.data.data);
      setTickets((prev) => prev.map((t) => (t._id === id ? res.data.data : t)));
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  // 6. Delete Ticket
  const deleteTicket = async (id) => {
    try {
      await axiosClient.delete(`/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t._id !== id));
      if (selectedTicket?._id === id) setSelectedTicket(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  // 7. Comments
  const fetchComments = async (ticketId) => {
    setCommentsLoading(true);
    try {
      const res = await axiosClient.get(`/tickets/${ticketId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const addComment = async (ticketId, message) => {
    setCommentSubmitting(true);
    try {
      const res = await axiosClient.post(`/tickets/${ticketId}/comments`, { message });
      setComments((prev) => [...prev, res.data.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setCommentSubmitting(false);
    }
  };

  // 8. Notifications
  const fetchNotifications = async () => {
    try {
      const res = await axiosClient.get('/notifications', { params: { limit: 10 } });
      setNotifications(res.data.data?.notifications || []);
      setUnreadCount(res.data.data?.unreadCount || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await axiosClient.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications for a specific ticket as read (e.g., when viewing ticket details)
  const markTicketNotificationsAsRead = async (ticketId) => {
    if (!ticketId) return;
    const unreadForTicket = notifications.filter(
      (n) => !n.isRead && (n.ticket?._id === ticketId || n.ticket === ticketId)
    );
    if (unreadForTicket.length === 0) return;

    for (const notif of unreadForTicket) {
      markNotificationAsRead(notif._id);
    }
  };

  // 9. Ticket Activity Logs
  const fetchTicketActivity = async (ticketId) => {
    try {
      const res = await axiosClient.get(`/tickets/${ticketId}/activity`);
      setTicketActivity(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 10. Admin Operations
  const updateTicketStatus = async (id, status) => {
    try {
      const res = await axiosClient.patch(`/admin/tickets/${id}/status`, { status });
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, status: res.data.data.status } : t)));
      if (selectedTicket?._id === id) setSelectedTicket(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const updateTicketPriority = async (id, priority) => {
    try {
      const res = await axiosClient.patch(`/admin/tickets/${id}/priority`, { priority });
      setTickets((prev) => prev.map((t) => (t._id === id ? { ...t, priority: res.data.data.priority } : t)));
      if (selectedTicket?._id === id) setSelectedTicket(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const assignTicket = async (id, assignedTo) => {
    try {
      const res = await axiosClient.patch(`/admin/tickets/${id}/assign`, { assignedTo });
      setTickets((prev) => prev.map((t) => (t._id === id ? res.data.data : t)));
      if (selectedTicket?._id === id) setSelectedTicket(res.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || err.message };
    }
  };

  const fetchDashboardStats = async () => {
    setAdminLoading(true);
    try {
      const res = await axiosClient.get('/admin/dashboard/stats');
      const data = res.data?.data || res.data;
      setAdminStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchGlobalActivity = async (limit = 50) => {
    try {
      const res = await axiosClient.get('/admin/activity', { params: { limit } });
      setGlobalActivity(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminsList = async () => {
    try {
      const res = await axiosClient.get('/admin/admins');
      setAdminsList(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        selectedTicket,
        ticketActivity,
        pagination,
        ticketLoading,
        ticketActionLoading,
        ticketError,
        comments,
        commentsLoading,
        commentSubmitting,
        notifications,
        unreadCount,
        adminStats,
        globalActivity,
        adminsList,
        adminLoading,
        fetchUserTickets,
        fetchAdminTickets,
        fetchTicketById,
        createTicket,
        updateTicket,
        deleteTicket,
        fetchComments,
        addComment,
        fetchNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        markTicketNotificationsAsRead,
        fetchTicketActivity,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        fetchDashboardStats,
        fetchGlobalActivity,
        fetchAdminsList,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export const useTickets = () => {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
};
