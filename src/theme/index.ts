import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    brand: { gradient: string; rose: string; violet: string; blue: string; gradientSoft: string };
  }
  interface PaletteOptions {
    brand?: { gradient?: string; rose?: string; violet?: string; blue?: string; gradientSoft?: string };
  }
}

const ROSE = '#C96B9A';
const VIOLET = '#7B5EA7';
const BLUE = '#4A6FD4';
const GRADIENT = `linear-gradient(135deg, ${BLUE} 0%, ${VIOLET} 40%, ${ROSE} 100%)`;

export const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: { main: VIOLET, light: '#A08CC8', dark: '#5A3F86', contrastText: '#fff' },
      secondary: { main: ROSE, light: '#E8A0BF', dark: '#A0566A', contrastText: '#fff' },
      error: { main: '#D32F2F' },
      warning: { main: '#E65100' },
      success: { main: '#2E7D32' },
      background: {
        default: mode === 'light' ? 'rgb(253 250 248)' : '#0f0d1a',
        paper: mode === 'light' ? '#ffffff' : '#1a1628',
      },
      text: {
        primary: mode === 'light' ? '#1a1625' : '#f0eaf8',
        secondary: mode === 'light' ? '#5a5468' : '#a89dc0',
      },
      divider: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
      brand: {
        gradient: GRADIENT,
        rose: ROSE,
        violet: VIOLET,
        blue: BLUE,
        gradientSoft: 'linear-gradient(135deg,#f3eff9 0%,#fdf0f6 50%,#eef2fc 100%)',
      },
    },
    typography: {
      fontFamily: "'Jost', system-ui, -apple-system, sans-serif",
      h1: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 },
      h2: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700 },
      h3: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
      h4: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
      h5: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
      h6: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
      button: { fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 600, textTransform: 'none' },
    },
    shape: { borderRadius: 14 },
    shadows: [
      'none',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 2px 10px rgba(26,22,37,.08)',
      '0 4px 20px rgba(26,22,37,.10)',
      '0 8px 32px rgba(26,22,37,.12)',
      '0 2px 16px rgba(26,22,37,.07)',
      '0 6px 20px rgba(123,94,167,.28)',
      '0 8px 28px rgba(201,107,154,.22)',
      '0 8px 28px rgba(123,94,167,.22)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
      '0 1px 4px rgba(26,22,37,.06)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '*': { boxSizing: 'border-box', WebkitTapHighlightColor: 'transparent' },
          body: { overscrollBehavior: 'none' },
          '::-webkit-scrollbar': { width: 4, height: 4 },
          '::-webkit-scrollbar-track': { background: 'transparent' },
          '::-webkit-scrollbar-thumb': { background: 'rgba(123,94,167,.3)', borderRadius: 4 },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, textTransform: 'none', fontWeight: 600, letterSpacing: '.01em' },
          containedPrimary: {
            background: GRADIENT,
            boxShadow: '0 6px 20px rgba(123,94,167,.28)',
            '&:hover': { background: GRADIENT, boxShadow: '0 8px 28px rgba(123,94,167,.38)', filter: 'brightness(1.05)' },
            '&:disabled': { background: 'rgba(123,94,167,.3)', color: 'rgba(255,255,255,.6)', boxShadow: 'none' },
          },
          outlinedPrimary: {
            borderColor: VIOLET,
            '&:hover': { background: 'rgba(123,94,167,.06)' },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            boxShadow: '0 2px 16px rgba(26,22,37,.07)',
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 8, fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 500 } },
      },
      MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: VIOLET, borderWidth: 1.5 },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundImage: 'none',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
          }),
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
            backgroundImage: 'none',
          }),
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            height: 64,
          }),
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            '&.Mui-selected': { color: VIOLET },
            minWidth: 0,
            padding: '6px 0',
          },
          label: { fontSize: '0.68rem', fontFamily: "'Jost', system-ui, sans-serif", fontWeight: 600 },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 20, backgroundImage: 'none' },
        },
      },
      MuiFab: {
        styleOverrides: {
          root: {
            background: GRADIENT,
            color: '#fff',
            boxShadow: '0 6px 20px rgba(123,94,167,.38)',
            '&:hover': { background: GRADIENT, filter: 'brightness(1.05)' },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, height: 6 },
          bar: { background: GRADIENT, borderRadius: 4 },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            '&.Mui-selected': {
              background: 'rgba(123,94,167,.12)',
              color: VIOLET,
              '&:hover': { background: 'rgba(123,94,167,.16)' },
            },
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 },
        },
      },
    },
  });
