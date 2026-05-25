import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getBoutique } from '@/services/boutiques';
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
const BillingPage = lazy(() => import('@/features/billing/BillingPage'));
const ReportsPage = lazy(() => import('@/features/reports/ReportsPage'));
const CustomersPage = lazy(() => import('@/features/customers/CustomersPage'));
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

function BillingFeatureGuard() {
  const user = useAuthStore((s) => s.user);
  const { data: boutique, isLoading } = useQuery({
    queryKey: ['boutique', user?.boutiqueId],
    queryFn: () => getBoutique(user!.boutiqueId!),
    enabled: !!user?.boutiqueId,
    staleTime: 5 * 60 * 1000,
  });
  if (isLoading) return <LoadingScreen />;
  if (boutique && !boutique.subscription.features.includes('billing')) return <Navigate to="/dashboard" replace />;
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
          { path: '/dashboard/new',        element: wrap(<OrderFormPage />) },
          { path: '/dashboard/edit/:orderId', element: wrap(<OrderFormPage />) },
          { path: '/measurements', element: wrap(<MeasurementsPage />) },
          { path: '/measurements/new', element: wrap(<MeasurementFormPage />) },
          { path: '/measurements/view/:measurementId', element: wrap(<MeasurementViewPage />) },
          { path: '/measurements/edit/:measurementId', element: wrap(<MeasurementFormPage />) },
          { path: '/customers', element: wrap(<CustomersPage />) },
          {
            element: <BillingFeatureGuard />,
            children: [{ path: '/billing', element: wrap(<BillingPage />) }],
          },
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
