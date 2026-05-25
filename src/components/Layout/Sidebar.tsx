import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StraightenIcon from '@mui/icons-material/Straighten';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getBoutique } from '@/services/boutiques';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
  featureKey?: string;
}

const BOUTIQUE_NAV: NavItem[] = [
  { label: 'Orders',       icon: <AssignmentIcon />,    path: '/dashboard',    featureKey: 'orders'       },
  { label: 'Customers',    icon: <PeopleIcon />,         path: '/customers'                               },
  { label: 'Measurements', icon: <StraightenIcon />,    path: '/measurements', featureKey: 'measurements' },
  { label: 'Billing',      icon: <ReceiptIcon />,        path: '/billing',      featureKey: 'billing'      },
  { label: 'Reports',      icon: <BarChartIcon />,       path: '/reports',      featureKey: 'reports'      },
  { label: 'Staff',        icon: <PeopleIcon />,         path: '/staff',        adminOnly: true, featureKey: 'staff' },
  { label: 'Subscription', icon: <CardMembershipIcon />, path: '/subscription'                            },
];

interface Props {
  open: boolean;
  variant: 'permanent' | 'temporary';
  width: number;
  onClose: () => void;
}

export default function Sidebar({ open, variant, width, onClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data: boutique } = useQuery({
    queryKey: ['boutique', user?.boutiqueId],
    queryFn: () => getBoutique(user!.boutiqueId!),
    enabled: !!user?.boutiqueId,
    staleTime: 5 * 60 * 1000,
  });

  const enabledFeatures = boutique?.subscription.features ?? [];

  const navItems = BOUTIQUE_NAV.filter((item) => {
    if (item.adminOnly && user?.role !== 'admin') return false;
    if (item.featureKey && enabledFeatures.length > 0 && !enabledFeatures.includes(item.featureKey)) return false;
    return true;
  });

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const content = (
    <Box sx={{ width, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          p: 2.5,
          pb: 2,
          background: (t) => t.palette.brand.gradient,
          color: '#fff',
          minHeight: 80,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {boutique?.branding?.logoUrl ? (
            <Box
              component="img"
              src={boutique.branding.logoUrl}
              alt="logo"
              sx={{ height: 28, maxWidth: 120, objectFit: 'contain', borderRadius: 1 }}
            />
          ) : (
            <>
              <StorefrontIcon sx={{ fontSize: 20 }} />
              <Typography variant="subtitle1" fontFamily="'Playfair Display', serif" fontWeight={700}>
                Boutique Ecosystem
              </Typography>
            </>
          )}
        </Box>
        {user?.boutiqueName && (
          <Typography variant="caption" sx={{ opacity: 0.85, ml: 0.5 }}>
            {user.boutiqueName}
          </Typography>
        )}
      </Box>

      {user && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Chip
            label={user.role === 'superAdmin' ? 'Super Admin' : user.role === 'admin' ? 'Boutique Admin' : 'Staff'}
            size="small"
            color={user.role === 'superAdmin' ? 'secondary' : 'primary'}
            variant="outlined"
            sx={{ fontSize: 11, height: 22 }}
          />
        </Box>
      )}

      <Divider />

      <List sx={{ flex: 1, px: 0.5, py: 1 }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => handleNav(item.path)}
            sx={{ mb: 0.25 }}
          >
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontSize: 14, fontWeight: location.pathname === item.path ? 600 : 400 }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.disabled">
          v1.0.0 · Boutique Ecosystem
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width, boxSizing: 'border-box' } }}
    >
      {content}
    </Drawer>
  );
}
