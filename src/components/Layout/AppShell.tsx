import { useMemo } from 'react';
import { Box, useMediaQuery, useTheme, Typography, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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

  const sub = boutique?.subscription;
  const isPlanExpired = sub?.expiresAt ? sub.expiresAt < new Date() : false;
  const isPlanReadOnly = sub ? (!sub.isActive || isPlanExpired) : false;

  if (boutique && (boutique.status === 'inactive' || boutique.status === 'suspended')) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3, background: (t) => t.palette.background.default }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(211,47,47,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BlockIcon sx={{ fontSize: 32, color: 'error.main' }} />
        </Box>
        <Typography variant="h6" fontWeight={700} textAlign="center">Account Deactivated</Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={300}>
          Your boutique account has been deactivated. Please contact support to restore access.
        </Typography>
      </Box>
    );
  }

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
          pb: isDesktop ? 0 : 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <TopBar onMenuClick={() => setSidebarOpen(true)} showMenu={!isDesktop} />
        {isPlanReadOnly && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon fontSize="small" />}
            sx={{ borderRadius: 0, py: 0.5, px: { xs: 2, sm: 3 }, fontSize: 13 }}
          >
            {isPlanExpired
              ? 'Your plan has expired. You can view existing data but cannot add or edit records. Please renew your subscription.'
              : 'Your plan is inactive. You can view existing data but cannot add or edit records. Contact support to reactivate.'}
          </Alert>
        )}
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
