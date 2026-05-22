import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { signOut } from '@/services/auth';
import { useNavigate } from 'react-router-dom';

interface Props {
  onMenuClick?: () => void;
  showMenu?: boolean;
  title?: string;
}

export default function TopBar({ onMenuClick, showMenu = false, title }: Props) {
  const user = useAuthStore((s) => s.user);
  const { themeMode, toggleTheme } = useUiStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setAnchorEl(null);
    await signOut();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <AppBar position="sticky" elevation={0} sx={{ zIndex: 1100 }}>
      <Toolbar sx={{ gap: 1 }}>
        {showMenu && (
          <IconButton edge="start" onClick={onMenuClick} size="small">
            <MenuIcon />
          </IconButton>
        )}

        <StorefrontIcon sx={{ color: 'primary.main', mr: 0.5, display: { xs: 'none', sm: 'block' } }} />
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700,
            fontSize: { xs: 16, sm: 20 },
            background: (t) => t.palette.brand.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            flex: 1,
          }}
        >
          {title || user?.boutiqueName || 'Boutique Ecosystem'}
        </Typography>

        <Tooltip title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}>
          <IconButton size="small" onClick={toggleTheme}>
            {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Account">
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: 14,
                background: (t) => t.palette.brand.gradient,
              }}
            >
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, borderRadius: 3, minWidth: 200 } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {user?.role} {user?.boutiqueName ? `· ${user.boutiqueName}` : ''}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); }} dense>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} dense sx={{ color: 'error.main' }}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
