import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Menu,
  CheckCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';

export const Navbar = ({ title }) => {
  const { toggleSidebar, theme, toggleTheme } = useUI();
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useTickets();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);

  const handleTicketClick = (notification) => {
    setNotifOpen(false);
    if (!notification) return;

    // Automatically mark this notification as read when clicked
    if (!notification.isRead && notification._id) {
      markNotificationAsRead(notification._id);
    }

    const ticket = notification.ticket;
    if (!ticket) {
      navigate(user?.role === 'ADMIN' ? '/admin/tickets' : '/tickets');
      return;
    }
    const ticketId = ticket._id || ticket;
    if (user?.role === 'ADMIN') {
      navigate(`/admin/tickets/${ticketId}`);
    } else {
      navigate(`/tickets/${ticketId}`);
    }
  };

  return (
    <header className="h-[70px] bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between px-6 lg:px-8 sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 transition-colors">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title || 'Dashboard'}</h1>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 relative">
        {/* Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun size={20} className="text-amber-400 animate-fade-in" />
          ) : (
            <Moon size={20} className="text-slate-600 animate-fade-in" />
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 max-h-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 animate-slide-up">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3.5 transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          : 'bg-brand-50/40 dark:bg-brand-950/40 hover:bg-brand-50/70 dark:hover:bg-brand-950/70'
                      }`}
                      onClick={() => handleTicketClick(n)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markNotificationAsRead(n._id);
                            }}
                            title="Mark as read"
                            className="text-brand-600 dark:text-brand-400 hover:text-brand-800 transition-colors ml-2"
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Identity Chip */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold text-sm flex items-center justify-center shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user?.name}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 capitalize font-medium">
              {user?.role?.toLowerCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
