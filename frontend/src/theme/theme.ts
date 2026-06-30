import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#38bdf8', dark: '#0ea5e9', light: '#7dd3fc' },
    secondary: { main: '#fb923c', dark: '#ea580c', light: '#fdba74' },
    success: { main: '#4ade80' },
    warning: { main: '#facc15' },
    error: { main: '#f87171' },
    background: { default: '#090e1a', paper: '#0f172a' },
    text: { primary: '#e2e8f0', secondary: '#94a3b8' },
    divider: 'rgba(148,163,184,0.12)',
  },
  typography: {
    fontFamily: "'Outfit', sans-serif",
    h1: { fontFamily: "'Syne', sans-serif", fontWeight: 800 },
    h2: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h4: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
    overline: { fontFamily: "'DM Mono', monospace", letterSpacing: '0.12em' },
    caption: { fontFamily: "'DM Mono', monospace" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 20px' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
          boxShadow: '0 4px 20px rgba(56,189,248,0.25)',
          '&:hover': { boxShadow: '0 6px 28px rgba(56,189,248,0.4)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(148,163,184,0.1)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontFamily: "'DM Mono', monospace", fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'DM Mono', monospace", fontSize: '0.72rem' },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#0a1020',
          borderRight: '1px solid rgba(148,163,184,0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(9,14,26,0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(148,163,184,0.08)',
          boxShadow: 'none',
        },
      },
    },
  },
});