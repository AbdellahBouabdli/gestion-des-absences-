import { alpha, createTheme } from '@mui/material/styles';

const ink = '#10263b';
const teal = '#0f9d8a';
const coral = '#e76f51';
const amber = '#e9a23b';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: ink,
      light: '#234a6b',
      dark: '#091a2a',
      contrastText: '#ffffff',
    },
    secondary: {
      main: teal,
      light: '#56c9b8',
      dark: '#087567',
      contrastText: '#ffffff',
    },
    error: { main: coral, light: '#f3a08b', dark: '#b14a32' },
    warning: { main: amber, light: '#f4c477', dark: '#a96f16' },
    success: { main: '#2e9e6b', light: '#6fc59c', dark: '#1b704a' },
    info: { main: '#3b82f6', light: '#8bb8fb', dark: '#245cb5' },
    background: { default: '#f3f6fa', paper: '#ffffff' },
    text: { primary: '#142433', secondary: '#617285', disabled: '#9aa7b4' },
    divider: '#e7edf3',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e7edf3',
      300: '#d4dee8',
      400: '#a6b5c5',
      500: '#7b8ea2',
      600: '#5b6d80',
      700: '#3f5265',
      800: '#293b4d',
      900: '#172838',
    },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "'Inter Variable', 'Segoe UI', system-ui, -apple-system, sans-serif",
    h1: {
      fontFamily: "'Manrope Variable', 'Inter Variable', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.045em',
      lineHeight: 1.08,
    },
    h2: {
      fontFamily: "'Manrope Variable', 'Inter Variable', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.035em',
      lineHeight: 1.15,
    },
    h3: {
      fontFamily: "'Manrope Variable', 'Inter Variable', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h4: {
      fontFamily: "'Manrope Variable', 'Inter Variable', sans-serif",
      fontWeight: 800,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontFamily: "'Manrope Variable', 'Inter Variable', sans-serif",
      fontWeight: 750,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontFamily: "'Manrope Variable', 'Inter Variable', sans-serif",
      fontWeight: 750,
      letterSpacing: '-0.015em',
    },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 650 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: 0 },
    overline: { fontWeight: 700, letterSpacing: '0.1em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f3f6fa',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'optimizeLegibility',
        },
        '::selection': { backgroundColor: alpha(teal, 0.24) },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 11,
          paddingInline: 18,
          minHeight: 40,
          boxShadow: 'none',
        },
        sizeSmall: { minHeight: 34, paddingInline: 13, fontSize: '0.8rem' },
        sizeLarge: { minHeight: 48, paddingInline: 24, fontSize: '0.95rem' },
        containedPrimary: {
          background: `linear-gradient(135deg, ${ink} 0%, #1d4566 100%)`,
          '&:hover': {
            boxShadow: `0 10px 24px ${alpha(ink, 0.22)}`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${teal} 0%, #0a8474 100%)`,
          '&:hover': { boxShadow: `0 10px 24px ${alpha(teal, 0.25)}` },
        },
        outlined: { borderColor: '#d8e1ea' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          border: '1px solid #e7edf3',
          boxShadow: '0 1px 2px rgba(16, 38, 59, 0.03)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 24, '&:last-child': { paddingBottom: 24 } } },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 18 },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 11,
          backgroundColor: '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#dce5ee' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#b5c4d3' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1.5 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: '#edf1f5', padding: '14px 18px' },
        head: {
          backgroundColor: '#f8fafc',
          color: '#718196',
          fontSize: '0.72rem',
          fontWeight: 750,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 650, borderRadius: 8 },
        sizeSmall: { height: 26, fontSize: '0.72rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 22, backgroundImage: 'none' },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { padding: '24px 26px 10px', fontWeight: 800 } },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: '12px 26px 20px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '10px 26px 24px', gap: 8 } },
    },
    MuiMenu: {
      styleOverrides: {
        paper: { border: '1px solid #e7edf3', boxShadow: '0 16px 40px rgba(16,38,59,.12)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root: { borderRadius: 99, height: 7, backgroundColor: '#eef2f6' } },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { height: 3, borderRadius: 3 },
        root: { minHeight: 44 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { minHeight: 44, fontWeight: 650, textTransform: 'none' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: '#172838', fontSize: '0.75rem', borderRadius: 8, padding: '7px 10px' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiSkeleton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
  },
});

export default theme;
