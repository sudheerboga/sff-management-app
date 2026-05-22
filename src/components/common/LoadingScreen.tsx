import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  message?: string;
}

export default function LoadingScreen({ message }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        background: (t) => t.palette.background.default,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: (t) => t.palette.brand.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(123,94,167,.38)',
          animation: 'pulse 1.8s ease-in-out infinite',
          '@keyframes pulse': {
            '0%,100%': { transform: 'scale(1)', boxShadow: '0 6px 20px rgba(123,94,167,.38)' },
            '50%': { transform: 'scale(1.08)', boxShadow: '0 10px 30px rgba(123,94,167,.55)' },
          },
        }}
      >
        <Typography sx={{ color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20 }}>
          B
        </Typography>
      </Box>
      <CircularProgress size={20} thickness={5} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="caption" color="text.secondary">{message}</Typography>
      )}
    </Box>
  );
}
