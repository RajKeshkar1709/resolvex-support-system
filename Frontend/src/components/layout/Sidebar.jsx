import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Activity,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { sidebarCollapsed } = useUI();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = isAdmin
    ? [
        { label: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'All Tickets', path: '/admin/tickets', icon: Ticket },
        { label: 'System Activity', path: '/admin/activity', icon: Activity },
      ]
    : [
        { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { label: 'My Tickets', path: '/tickets', icon: Ticket },
        { label: 'Create Ticket', path: '/tickets/new', icon: PlusCircle },
      ];

  return (
    <aside
      className={`bg-slateDark text-white flex flex-col transition-all duration-300 ease-in-out z-50 select-none ${
        sidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="bg-gradient-to-br from-brand-500 to-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
          <ShieldAlert size={20} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden whitespace-nowrap animate-fade-in">
            <h2 className="text-lg text-white font-extrabold tracking-tight">ResolveX</h2>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Enterprise Support
            </span>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/tickets' || item.path === '/admin/tickets' || item.path === '/dashboard' || item.path === '/admin/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slateHover'
                }`
              }
            >
              <Icon size={19} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
              {!sidebarCollapsed && (
                <span className="whitespace-nowrap animate-fade-in">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut size={19} className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {!sidebarCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
