import { useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { createAppTheme } from '@/theme';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { listenAuthState } from '@/services/auth';

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
      setInitialized(true);
    });
    return unsubscribe;
  }, [setUser, setLoading, setInitialized]);

  return null;
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
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
