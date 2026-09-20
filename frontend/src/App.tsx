import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ToastProvider } from '@/hooks/useToast';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Payment from '@/pages/Payment';
import Transactions from '@/pages/Transactions';
import TransactionDetail from '@/pages/TransactionDetail';
import Insights from '@/pages/Insights';
import AskSpendSense from '@/pages/AskSpendSense';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lift"
          >
            Skip to content
          </a>

          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="payment" element={<Payment />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="transactions/:id" element={<TransactionDetail />} />
                <Route path="insights" element={<Insights />} />
                <Route path="ask" element={<AskSpendSense />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="/dashboard" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
