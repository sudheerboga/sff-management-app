import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import LoadingScreen from '@/components/common/LoadingScreen';
import AppShell from '@/components/layout/AppShell';
import AdminLayout from '@/features/admin/AdminLayout';

const SplashPage = lazy(() => import('@/features/auth/SplashPage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const OrdersPage = lazy(() => import('@/features/orders/OrdersPage'));
const OrderFormPage    = lazy(() => import('@/features/orders/OrderFormPage'));
const MeasurementsPage = lazy(() => import('@/features/measurements/MeasurementsPage'));
const MeasurementFormPage = lazy(() => import('@/features/measurements/MeasurementFormPage'));
const MeasurementViewPage = lazy(() => import('@/features/measurements/MeasurementViewPage'));
const MeasurementItemsPage = lazy(() => import('@/features/measurements/MeasurementItemsPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const CustomersPage = lazy(() => import('@/features/customers/CustomersPage'));
const StaffPage = lazy(() => import('@/features/staff/StaffPage'));
const SubscriptionPage = lazy(() => import('@/features/subscription/SubscriptionPage'));
const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard'));
const BoutiquesPage = lazy(() => import('@/features/admin/pages/BoutiquesPage'));
const DeletedRecordsPage = lazy(() => import('@/features/admin/pages/DeletedRecordsPage'));
const BoutiqueDetailPage = lazy(() => import('@/features/admin/pages/BoutiqueDetailPage'));
const SubscriptionsPage = lazy(() => import('@/features/admin/pages/SubscriptionsPage'));

// App.tsx gates the router until auth is initialized, so loading is always false here.

function BoutiqueGuard() {
  const user = useAuthStore((s) => s.user);
  if (!user || !['admin', 'staff'].includes(user.role)) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AdminGuard() {
  const user = useAuthStore((s) => s.user);
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
  if (!user) return <Navigate to="/login" replace />;
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
          { path: '/dashboard/new',        element: wrap(<OrderFormPage />) },
          { path: '/dashboard/edit/:orderId', element: wrap(<OrderFormPage />) },
          { path: '/measurements', element: wrap(<MeasurementsPage />) },
          { path: '/measurements/new', element: wrap(<MeasurementFormPage />) },
          { path: '/measurements/view/:measurementId', element: wrap(<MeasurementViewPage />) },
          { path: '/measurements/edit/:measurementId', element: wrap(<MeasurementFormPage />) },
          { path: '/measurements/items', element: wrap(<MeasurementItemsPage />) },
          { path: '/customers', element: wrap(<CustomersPage />) },
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
          { path: '/admin/boutiques/:id', element: wrap(<BoutiqueDetailPage />) },
          { path: '/admin/subscriptions', element: wrap(<SubscriptionsPage />) },
          { path: '/admin/deleted', element: wrap(<DeletedRecordsPage />) },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
