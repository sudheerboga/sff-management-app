import { Box, Typography, Button } from '@mui/material';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, description, actionLabel, onAction }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 2,
        gap: 2,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: 4,
            background: (t) => t.palette.brand.gradientSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            '& svg': { fontSize: 36, color: 'primary.main', opacity: 0.7 },
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant="h6" fontFamily="'Playfair Display', serif" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" color="primary" size="small" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
