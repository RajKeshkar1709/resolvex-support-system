import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import { UIProvider } from './context/UIContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'sonner';
import './styles/globals.css';

export function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <UIProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster richColors position="top-right" />
          </BrowserRouter>
        </UIProvider>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;
