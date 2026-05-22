import { useEffect } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import StorefrontIcon from '@mui/icons-material/Storefront';

export default function SplashPage() {
  const navigate = useNavigate();
  const { user, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;
    const timer = setTimeout(() => {
      if (!user) {
        navigate('/login', { replace: true });
      } else if (user.role === 'superAdmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [initialized, user, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg,#1a0f35 0%,#3d2070 50%,#7B5EA7 100%)',
        color: '#fff',
        px: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <Box sx={{
        position: 'absolute', top: -80, right: -80, width: 280, height: 280,
        borderRadius: '50%', background: 'rgba(201,107,154,.18)', filter: 'blur(40px)',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -60, left: -60, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(74,111,212,.15)', filter: 'blur(30px)',
      }} />

      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: 4,
          background: 'rgba(255,255,255,.12)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
          animation: 'pop .6s cubic-bezier(.34,1.56,.64,1)',
          '@keyframes pop': { from: { opacity: 0, transform: 'scale(0.7)' }, to: { opacity: 1, transform: 'scale(1)' } },
        }}
      >
        <StorefrontIcon sx={{ fontSize: 44, color: '#fff' }} />
      </Box>

      <Typography
        variant="h3"
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
          textAlign: 'center',
          mb: 1,
          animation: 'fadeUp .7s .2s both cubic-bezier(.4,0,.2,1)',
          '@keyframes fadeUp': { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'none' } },
        }}
      >
        Boutique
        <br />
        Ecosystem
      </Typography>

      <Typography
        variant="body2"
        sx={{
          opacity: 0.7,
          textAlign: 'center',
          mb: 6,
          maxWidth: 280,
          animation: 'fadeUp .7s .35s both cubic-bezier(.4,0,.2,1)',
        }}
      >
        Premium multi-tenant boutique management platform
      </Typography>

      <Box sx={{ width: 180, animation: 'fadeUp .7s .5s both cubic-bezier(.4,0,.2,1)' }}>
        <LinearProgress
          sx={{
            borderRadius: 4,
            height: 3,
            backgroundColor: 'rgba(255,255,255,.15)',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg,#C96B9A,#7B5EA7)', borderRadius: 4 },
          }}
        />
      </Box>

      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          bottom: 24,
          opacity: 0.4,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          fontSize: 10,
        }}
      >
        v1.0.0
      </Typography>
    </Box>
  );
}
