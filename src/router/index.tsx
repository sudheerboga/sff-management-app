import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';
import AppShell from '@/components/layout/AppShell';
import AdminLayout from '@/features/admin/AdminLayout';

const SplashPage = lazy(() => import('@/features/auth/SplashPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const OrdersPage = lazy(() => import('@/features/orders/OrdersPage'));
const MeasurementsPage = lazy(() => import('@/features/measurements/MeasurementsPage'));
const BillingPage = lazy(() => import('@/features/billing/BillingPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const StaffPage = lazy(() => import('@/features/staff/StaffPage'));
const SubscriptionPage = lazy(() => import('@/features/subscription/SubscriptionPage'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const BoutiquesPage = lazy(() => import('@/features/admin/pages/BoutiquesPage'));
const DeletedRecordsPage = lazy(() => import('@/features/admin/pages/DeletedRecordsPage'));

function BoutiqueGuard() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  if (loading) return <LoadingScreen />;
  if (!user || !['admin', 'staff'].includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminGuard() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  if (loading) return <LoadingScreen />;
  if (!user || user.role !== 'superAdmin') return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminOnlyGuard() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/splash" replace />;
  if (user.role === 'superAdmin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
}

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<LoadingScreen />}>{element}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/splash', element: wrap(<SplashPage />) },
  { path: '/login', element: wrap(<LoginPage />) },
  {
    element: <BoutiqueGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: wrap(<OrdersPage />) },
          { path: '/measurements', element: wrap(<MeasurementsPage />) },
          { path: '/billing', element: wrap(<BillingPage />) },
          { path: '/reports', element: wrap(<ReportsPage />) },
          { path: '/subscription', element: wrap(<SubscriptionPage />) },
          {
            element: <AdminOnlyGuard />,
            children: [{ path: '/staff', element: wrap(<StaffPage />) }],
          },
        ],
      },
    ],
  },
  {
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: wrap(<AdminDashboard />) },
          { path: '/admin/boutiques', element: wrap(<BoutiquesPage />) },
          { path: '/admin/deleted', element: wrap(<DeletedRecordsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
