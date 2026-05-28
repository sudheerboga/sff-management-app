import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, useMediaQuery, useTheme, AppBar, Toolbar, IconButton, Avatar, Tooltip, Menu, MenuItem, ListItemIcon as MuiListItemIcon } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { signOut } from '@/services/auth';

const NAV = [
  { label: 'Dashboard',      icon: <DashboardIcon />,  path: '/admin' },
  { label: 'Boutiques',      icon: <StorefrontIcon />, path: '/admin/boutiques' },
  { label: 'Subscriptions',  icon: <CreditCardIcon />, path: '/admin/subscriptions' },
  { label: 'Trash & Recovery', icon: <DeleteSweepIcon />, path: '/admin/deleted' },
];

const DRAWER_W = 240;

export default function AdminLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { themeMode, toggleTheme } = useUiStore();

  const handleLogout = async () => { await signOut(); navigate('/login'); };

  const drawer = (
    <Box sx={{ width: DRAWER_W, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ pl: 2.5, pr: 2.5, pb: 2, pt: 'max(20px, calc(env(safe-area-inset-top, 0px) + 8px))', background: (t) => t.palette.brand.gradient, color: '#fff', minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 20 }} />
          <Typography fontFamily="'Playfair Display', serif" fontWeight={700} variant="subtitle1">Super Admin</Typography>
        </Box>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>Boutiqo</Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, px: 0.5, py: 1 }}>
        {NAV.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            sx={{ mb: 0.25 }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: location.pathname === item.path ? 'primary.main' : 'text.secondary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 }} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ pb: 'env(safe-area-inset-bottom, 0px)' }} />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', background: (t) => t.palette.background.default }}>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_W, boxSizing: 'border-box' } }}
      >
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', ml: isDesktop ? `${DRAWER_W}px` : 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ zIndex: 1100, paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <Toolbar sx={{ gap: 1 }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setSidebarOpen(true)} size="small"><MenuIcon /></IconButton>
            )}
            <Typography sx={{ flex: 1, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: { xs: 16, sm: 20 }, background: (t) => t.palette.brand.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Panel
            </Typography>
            {/* <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton size="small" onClick={toggleTheme}>
                {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
              </IconButton>
            </Tooltip> */}
            <Tooltip title="Account">
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, fontSize: 13, background: (t) => t.palette.brand.gradient }}>
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Outlet />
        </Box>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, borderRadius: 3, minWidth: 180 } }}
      >
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }} dense>
          <MuiListItemIcon><LogoutIcon fontSize="small" color="error" /></MuiListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
