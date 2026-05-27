import { useEffect, useMemo, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { createAppTheme } from '@/theme';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { listenAuthState } from '@/services/auth';
import LoadingScreen from '@/components/common/LoadingScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AuthListener() {
  const { setUser, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenAuthState((user, loading) => {
      setUser(user);
      setLoading(loading);
      // Only mark initialized once role resolution is fully complete.
      // Without this guard, the router renders while user=null and redirects to /login.
      if (!loading) setInitialized(true);
    });
    return unsubscribe;
  }, [setUser, setLoading, setInitialized]);

  return null;
}

const MIN_SPLASH_MS = 2000;

function AppGate({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);
  const [minDone, setMinDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinDone(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  if (!initialized || !minDone) return <LoadingScreen />;
  return <>{children}</>;
}

export default function App() {
  const themeMode = useUiStore((s) => s.themeMode);
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <AuthListener />
          <AppGate>
            <RouterProvider router={router} />
          </AppGate>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
