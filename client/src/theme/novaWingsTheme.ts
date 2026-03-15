import { createTheme } from '@mui/material/styles';

// ═══════════════════════════════════════════
// BRAND COLOR CONSTANTS
// ═══════════════════════════════════════════

export const COLORS = {
  orange: '#F97316',
  amber: '#F59E0B',
  black: '#0A0A0A',
  card: '#111111',
  elevated: '#1A1A1A',
  surface: '#222222',
  border: 'rgba(255,255,255,0.06)',
  borderOrange: 'rgba(249,115,22,0.3)',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  success: '#10B981',
  error: '#EF4444',
};

// ═══════════════════════════════════════════
// CUSTOM TOKENS
// ═══════════════════════════════════════════

const customTokens = {
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(249,115,22,0.4)',
  glass: 'rgba(255,255,255,0.03)',
  glassHover: 'rgba(255,255,255,0.06)',
  orange10: 'rgba(249,115,22,0.10)',
  orange20: 'rgba(249,115,22,0.20)',
  orange40: 'rgba(249,115,22,0.40)',
  amber10: 'rgba(245,158,11,0.10)',
};

// ═══════════════════════════════════════════
// SHAPE TOKENS
// ═══════════════════════════════════════════

const radii = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 100,
};

// ═══════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════

export const novaWingsTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#F97316',
      light: '#FB923C',
      dark: '#EA580C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      contrastText: '#000000',
    },
    background: {
      default: '#0A0A0A',
      paper: '#111111',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9CA3AF',
      disabled: '#4B5563',
    },
    success: {
      main: '#10B981',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    info: {
      main: '#3B82F6',
    },
    divider: 'rgba(255,255,255,0.06)',
  },

  typography: {
    fontFamily:
      '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.06em',
    },
    overline: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },

  shape: {
    borderRadius: radii.md,
  },

  components: {
    // ── CssBaseline ──────────────────────────
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#0A0A0A',
          color: '#FFFFFF',
          fontFeatureSettings: '"cv02","cv03","cv04","cv11"',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::selection': {
          background: 'rgba(249,115,22,0.3)',
          color: '#FFFFFF',
        },
        '::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '::-webkit-scrollbar-track': {
          background: '#0A0A0A',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#F97316',
          borderRadius: '3px',
        },
      },
    },

    // ── Button ───────────────────────────────
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          textTransform: 'none' as const,
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
            boxShadow: '0 6px 20px rgba(249,115,22,0.5)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          border: '1px solid rgba(249,115,22,0.4)',
          color: '#F97316',
          '&:hover': {
            border: '1px solid #F97316',
            background: 'rgba(249,115,22,0.08)',
          },
        },
        text: {
          color: '#F97316',
          '&:hover': {
            background: 'rgba(249,115,22,0.08)',
          },
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
        sizeMedium: {
          padding: '10px 24px',
          fontSize: '0.9375rem',
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
      },
    },

    // ── Card ─────────────────────────────────
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          backgroundImage: 'none',
          transition: 'all 0.25s ease',
          '&:hover': {
            border: '1px solid rgba(249,115,22,0.25)',
            boxShadow:
              '0 8px 32px rgba(249,115,22,0.08), 0 2px 8px rgba(0,0,0,0.4)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },

    // ── TextField / OutlinedInput ────────────
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255,255,255,0.1)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(249,115,22,0.4)',
          },
          '& .MuiInputBase-input': {
            color: '#FFFFFF',
            padding: '13px 16px',
          },
          '& .MuiInputLabel-root': {
            color: '#6B7280',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#F97316',
          },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          transition: 'all 0.2s ease',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(249,115,22,0.4)',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#F97316',
            borderWidth: '1.5px',
          },
        },
        notchedOutline: {
          borderColor: 'rgba(255,255,255,0.1)',
        },
        input: {
          color: '#FFFFFF',
          padding: '13px 16px',
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#6B7280',
          '&.Mui-focused': {
            color: '#F97316',
          },
        },
      },
    },

    // ── Chip ─────────────────────────────────
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
        colorPrimary: {
          background: 'rgba(249,115,22,0.15)',
          color: '#F97316',
          border: '1px solid rgba(249,115,22,0.3)',
        },
        colorSuccess: {
          background: 'rgba(16,185,129,0.12)',
          color: '#10B981',
        },
        colorError: {
          background: 'rgba(239,68,68,0.12)',
          color: '#EF4444',
        },
        colorWarning: {
          background: 'rgba(245,158,11,0.12)',
          color: '#F59E0B',
        },
      },
    },

    // ── Divider ──────────────────────────────
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255,255,255,0.06)',
        },
      },
    },

    // ── Tooltip ──────────────────────────────
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#FFFFFF',
          borderRadius: '8px',
          padding: '8px 14px',
          fontSize: '0.8125rem',
        },
      },
    },

    // ── LinearProgress ───────────────────────
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          background: 'rgba(255,255,255,0.06)',
        },
        bar: {
          background: 'linear-gradient(90deg, #F97316, #F59E0B)',
        },
      },
    },

    // ── Tabs / Tab ───────────────────────────
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
          color: '#6B7280',
          fontSize: '0.9375rem',
          '&.Mui-selected': {
            color: '#F97316',
            fontWeight: 700,
          },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: 'linear-gradient(90deg, #F97316, #F59E0B)',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },

    // ── Paper ────────────────────────────────
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },

    // ── Dialog ───────────────────────────────
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          backgroundImage: 'none',
        },
      },
    },

    // ── Alert ────────────────────────────────
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          color: '#10B981',
        },
        standardError: {
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          color: '#EF4444',
        },
        standardWarning: {
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          color: '#F59E0B',
        },
      },
    },

    // ── Table ────────────────────────────────
    MuiTableCell: {
      styleOverrides: {
        head: {
          background: '#1A1A1A',
          color: '#9CA3AF',
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        },
        body: {
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.15s ease',
          '&:hover': {
            background: 'rgba(249,115,22,0.04) !important',
          },
        },
      },
    },

    // ── Select ───────────────────────────────
    MuiSelect: {
      styleOverrides: {
        outlined: {
          color: '#FFFFFF',
        },
        icon: {
          color: '#9CA3AF',
        },
      },
    },

    // ── MenuItem ─────────────────────────────
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          '&:hover': {
            background: 'rgba(249,115,22,0.08)',
          },
          '&.Mui-selected': {
            background: 'rgba(249,115,22,0.12)',
            color: '#F97316',
          },
        },
      },
    },

    // ── Skeleton ─────────────────────────────
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'rgba(255,255,255,0.06)',
        },
        wave: {
          '&::after': {
            background:
              'linear-gradient(90deg, transparent, rgba(249,115,22,0.05), transparent)',
          },
        },
      },
    },
  },
});

// ═══════════════════════════════════════════
// CUSTOM TOKEN EXPORTS
// ═══════════════════════════════════════════

export const tokens = customTokens;
export const shape = radii;

// ═══════════════════════════════════════════
// CUSTOM TYPOGRAPHY VARIANTS
// ═══════════════════════════════════════════

export const customTypography = {
  display: {
    fontSize: '4.5rem',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  tagline: {
    fontSize: '1.125rem',
    fontWeight: 400,
    letterSpacing: '0.01em',
    color: '#9CA3AF',
  },
  mono: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '0.875rem',
  },
};

export default novaWingsTheme;
