import { Box, Paper, Typography } from '@mui/material';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUiStore } from '@/stores/uiStore';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function BottomNav() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { T }     = useAppTheme();
  const setNewOrderOpen = useUiStore((s) => s.setNewOrderOpen);

  const isOrders       = location.pathname === '/dashboard';
  const isMeasurements = location.pathname === '/measurements';

  function handleAddOrder() {
    if (!isOrders) navigate('/dashboard');
    setNewOrderOpen(true);
  }

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: `1px solid ${T.border}`,
        backgroundColor: T.card,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderRadius: 0,
        backgroundImage: 'none',
      }}
    >
      <Box sx={{ display: 'flex', height: 64, position: 'relative', alignItems: 'center' }}>

        {/* Orders tab — left */}
        <Box
          onClick={() => navigate('/dashboard')}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            py: 1,
            gap: 0.25,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isOrders
            ? <AssignmentRoundedIcon sx={{ fontSize: 24, color: T.violet.d, transition: 'color .18s' }} />
            : <AssignmentOutlinedIcon sx={{ fontSize: 24, color: T.muted, transition: 'color .18s' }} />
          }
          <Typography sx={{ fontSize: 10.5, fontWeight: isOrders ? 700 : 500, color: isOrders ? T.violet.d : T.muted, letterSpacing: '.01em', lineHeight: 1, fontFamily: T.fontBody, transition: 'all .18s' }}>
            Orders
          </Typography>
        </Box>

        {/* Spacer for center FAB */}
        <Box sx={{ width: 72, flexShrink: 0 }} />

        {/* Measurements tab — right */}
        <Box
          onClick={() => navigate('/measurements')}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            py: 1,
            gap: 0.25,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isMeasurements
            ? <StraightenRoundedIcon sx={{ fontSize: 24, color: T.violet.d, transition: 'color .18s' }} />
            : <StraightenOutlinedIcon sx={{ fontSize: 24, color: T.muted, transition: 'color .18s' }} />
          }
          <Typography sx={{ fontSize: 10.5, fontWeight: isMeasurements ? 700 : 500, color: isMeasurements ? T.violet.d : T.muted, letterSpacing: '.01em', lineHeight: 1, fontFamily: T.fontBody, transition: 'all .18s' }}>
            Measure
          </Typography>
        </Box>

        {/* Center FAB — Add Order */}
        <Box
          onClick={handleAddOrder}
          sx={{
            position: 'absolute',
            left: '50%',
            top: -24,
            transform: 'translateX(-50%)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: T.grad.brand,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: T.sh.brand,
            transition: 'transform .18s ease',
            '&:active': { transform: 'translateX(-50%) scale(0.92)' },
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
        </Box>
      </Box>
    </Paper>
  );
}
