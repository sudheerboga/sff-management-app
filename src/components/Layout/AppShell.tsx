import { useMemo } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { getBoutique } from '@/services/boutiques';
import { createAppTheme } from '@/theme';

const SIDEBAR_WIDTH = 240;

export default function AppShell() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const themeMode = useUiStore((s) => s.themeMode);
  const user = useAuthStore((s) => s.user);

  const { data: boutique } = useQuery({
    queryKey: ['boutique', user?.boutiqueId],
    queryFn: () => getBoutique(user!.boutiqueId!),
    enabled: !!user?.boutiqueId,
    staleTime: 5 * 60 * 1000,
  });

  const boutiqueTheme = useMemo(() => {
    const b = boutique?.branding;
    if (!b?.primaryColor) return null;
    return createAppTheme(themeMode, b.primaryColor, b.secondaryColor, b.accentColor);
  }, [themeMode, boutique?.branding]);

  const content = (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <Sidebar
        open={isDesktop ? true : sidebarOpen}
        variant={isDesktop ? 'permanent' : 'temporary'}
        width={SIDEBAR_WIDTH}
        onClose={() => setSidebarOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          ml: isDesktop ? `${SIDEBAR_WIDTH}px` : 0,
          minHeight: '100vh',
          pb: isDesktop ? 0 : '72px',
        }}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} showMenu={!isDesktop} />
        <Box sx={{ flex: 1, px: { xs: 2, sm: 3 }, py: 2, maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Outlet />
        </Box>
      </Box>
      {!isDesktop && <BottomNav />}
    </Box>
  );

  return boutiqueTheme ? (
    <ThemeProvider theme={boutiqueTheme}>{content}</ThemeProvider>
  ) : content;
}
