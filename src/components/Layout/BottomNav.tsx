import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StraightenIcon from '@mui/icons-material/Straighten';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const BOUTIQUE_TABS = [
  { label: 'Orders', icon: <AssignmentIcon />, path: '/dashboard' },
  { label: 'Measure', icon: <StraightenIcon />, path: '/measurements' },
  { label: 'Billing', icon: <ReceiptIcon />, path: '/billing' },
  { label: 'Reports', icon: <BarChartIcon />, path: '/reports' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const tabs = user?.role === 'admin'
    ? [...BOUTIQUE_TABS, { label: 'Staff', icon: <PeopleIcon />, path: '/staff' }]
    : BOUTIQUE_TABS;

  const currentValue = tabs.findIndex((t) => location.pathname === t.path);

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: (t) => `1px solid ${t.palette.divider}`,
        pb: 'env(safe-area-inset-bottom)',
      }}
      elevation={0}
    >
      <BottomNavigation
        value={currentValue === -1 ? false : currentValue}
        onChange={(_, v) => navigate(tabs[v].path)}
      >
        {tabs.map((tab) => (
          <BottomNavigationAction
            key={tab.path}
            label={tab.label}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
