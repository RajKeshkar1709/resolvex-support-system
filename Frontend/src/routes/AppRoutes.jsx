import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// User Pages
import { UserDashboard } from '../pages/user/UserDashboard';
import { MyTicketsPage } from '../pages/user/MyTicketsPage';
import { CreateTicketPage } from '../pages/user/CreateTicketPage';
import { TicketDetailPage } from '../pages/user/TicketDetailPage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AllTicketsPage } from '../pages/admin/AllTicketsPage';
import { GlobalActivityPage } from '../pages/admin/GlobalActivityPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated User Routes */}
      <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
        <Route element={<AppLayout title="Support Portal" />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/tickets" element={<MyTicketsPage />} />
          <Route path="/tickets/new" element={<CreateTicketPage />} />
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Route>
      </Route>

      {/* Authenticated Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route element={<AppLayout title="Administrator Workspace" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<AllTicketsPage />} />
          <Route path="/admin/tickets/:id" element={<TicketDetailPage />} />
          <Route path="/admin/activity" element={<GlobalActivityPage />} />
        </Route>
      </Route>

      {/* Fallback 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
