import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useTickets } from '../../context/TicketContext';

export const AppLayout = ({ title }) => {
  const { fetchNotifications } = useTickets();
  const location = useLocation();

  // Fetch notifications on initial load and route changes
  useEffect(() => {
    fetchNotifications();
  }, [location.pathname]);

 
  useEffect(() => {
    const handleFocus = () => {
      fetchNotifications();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar title={title} />
        <main className="page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
