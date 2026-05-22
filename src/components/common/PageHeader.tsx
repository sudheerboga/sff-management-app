import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Props {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  actionDisabled?: boolean;
  children?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, actionLabel, actionIcon, onAction, actionDisabled, children }: Props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
      <Box>
        <Typography
          variant="h5"
          sx={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, lineHeight: 1.2 }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
        {actionLabel && onAction && (
          <Button
            variant="contained"
            color="primary"
            startIcon={actionIcon || <AddIcon />}
            onClick={onAction}
            disabled={actionDisabled}
            size="small"
          >
            {actionLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
}
