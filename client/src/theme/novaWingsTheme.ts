import { createTheme, type PaletteMode } from '@mui/material/styles';

// ═══════════════════════════════════════════
// BRAND COLOR CONSTANTS
// ═══════════════════════════════════════════

export const COLORS = {
  orange: '#F97316',
  amber: '#F59E0B',
  success: '#10B981',
  error: '#EF4444',
};

// Mode-aware color tokens
export const getColors = (mode: PaletteMode) =>
  mode === 'dark'
    ? {
        ...COLORS,
        bg: '#0A0A0A',
        card: '#111111',
        elevated: '#1A1A1A',
        surface: '#222222',
        border: 'rgba(255,255,255,0.06)',
        borderOrange: 'rgba(249,115,22,0.3)',
        textPrimary: '#FFFFFF',
        textSecondary: '#B4BBC6',   // improved from #9CA3AF for better visibility
        textMuted: '#8892A0',       // improved from #6B7280
        textDisabled: '#5A6170',
        glass: 'rgba(255,255,255,0.03)',
        glassHover: 'rgba(255,255,255,0.06)',
        navBg: 'rgba(10,10,10,0.85)',
        navBgScrolled: 'rgba(10,10,10,0.95)',
        footerBg: '#060606',
        footerBottom: '#040404',
        inputBg: 'rgba(255,255,255,0.03)',
        inputBorder: 'rgba(255,255,255,0.1)',
        hoverBg: 'rgba(249,115,22,0.08)',
        selection: 'rgba(249,115,22,0.3)',
        scrollTrack: '#0A0A0A',
        socialBg: 'rgba(255,255,255,0.04)',
        overlayBg: 'rgba(10,10,10,0.85)',
        comingSoonBg: 'rgba(255,255,255,0.05)',
        comingSoonBorder: 'rgba(255,255,255,0.1)',
      }
    : {
        ...COLORS,
        bg: '#F5F7FA',
        card: '#FFFFFF',
        elevated: '#F0F2F5',
        surface: '#E8EBF0',
        border: 'rgba(0,0,0,0.08)',
        borderOrange: 'rgba(249,115,22,0.3)',
        textPrimary: '#1A1A2E',
        textSecondary: '#5A6170',
        textMuted: '#7A8290',
        textDisabled: '#9CA3AF',
        glass: 'rgba(0,0,0,0.02)',
        glassHover: 'rgba(0,0,0,0.04)',
        navBg: 'rgba(255,255,255,0.85)',
        navBgScrolled: 'rgba(255,255,255,0.95)',
        footerBg: '#1A1A2E',
        footerBottom: '#141425',
        inputBg: 'rgba(0,0,0,0.02)',
        inputBorder: 'rgba(0,0,0,0.12)',
        hoverBg: 'rgba(249,115,22,0.06)',
        selection: 'rgba(249,115,22,0.2)',
        scrollTrack: '#F5F7FA',
        socialBg: 'rgba(0,0,0,0.04)',
        overlayBg: 'rgba(255,255,255,0.9)',
        comingSoonBg: 'rgba(0,0,0,0.04)',
        comingSoonBorder: 'rgba(0,0,0,0.1)',
      };

// ═══════════════════════════════════════════
// CUSTOM TOKENS
// ═══════════════════════════════════════════

export const tokens = {
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

export const shape = radii;

// ═══════════════════════════════════════════
// THEME FACTORY
// ═══════════════════════════════════════════

export function createNovaWingsTheme(mode: PaletteMode = 'dark') {
  const c = getColors(mode);
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
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
        default: c.bg,
        paper: c.card,
      },
      text: {
        primary: c.textPrimary,
        secondary: c.textSecondary,
        disabled: c.textDisabled,
      },
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
      error: { main: '#EF4444' },
      info: { main: '#3B82F6' },
      divider: c.border,
    },

    typography: {
      fontFamily:
        '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.015em' },
      h3: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.5rem', fontWeight: 600 },
      h5: { fontSize: '1.25rem', fontWeight: 600 },
      h6: { fontSize: '1rem', fontWeight: 600 },
      body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.7 },
      body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.6 },
      caption: { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em' },
      overline: {
        fontSize: '0.6875rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
    },

    shape: { borderRadius: radii.md },

    components: {
      // ── CssBaseline ──────────────────────────
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: c.bg,
            color: c.textPrimary,
            '--nw-bg': c.bg,
            '--nw-card': c.card,
            '--nw-elevated': c.elevated,
            '--nw-surface': c.surface,
            '--nw-border': c.border,
            '--nw-border-soft': isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)',
            '--nw-border-strong': isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.16)',
            '--nw-text-primary': c.textPrimary,
            '--nw-text-secondary': c.textSecondary,
            '--nw-text-muted': c.textMuted,
            '--nw-text-disabled': c.textDisabled,
            '--nw-primary': c.orange,
            '--nw-primary-light': '#FB923C',
            '--nw-primary-dark': '#EA580C',
            '--nw-secondary': c.amber,
            '--nw-success': c.success,
            '--nw-error': c.error,
            '--nw-info': '#3B82F6',
            '--nw-accent-blue': '#0EA5E9',
            '--nw-accent-indigo': '#6366F1',
            '--nw-accent-violet': '#A855F7',
            '--nw-accent-sky': '#38BDF8',
            '--nw-accent-cyan': '#06B6D4',
            '--nw-accent-pink': '#EC4899',
            '--nw-accent-teal': '#14B8A6',
            '--nw-success-bright': '#22C55E',
            '--nw-glass': c.glass,
            '--nw-glass-hover': c.glassHover,
            '--nw-overlay-heavy': isDark ? 'rgba(10,10,10,0.92)' : 'rgba(245,247,250,0.92)',
            '--nw-overlay-mid': isDark ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.95)',
            '--nw-black-60': 'rgba(0,0,0,0.6)',
            '--nw-black-90': 'rgba(0,0,0,0.9)',
            '--nw-footer-bg': c.footerBg,
            '--nw-warm-bg': isDark ? '#1A0800' : '#F3ECE3',
            '--nw-panel-dark': isDark ? '#0F0F0F' : '#FFFFFF',
            '--nw-success-08': 'rgba(34,197,94,0.08)',
            '--nw-success-10': 'rgba(34,197,94,0.10)',
            '--nw-success-12': 'rgba(34,197,94,0.12)',
            '--nw-success-15': 'rgba(34,197,94,0.15)',
            '--nw-success-20': 'rgba(34,197,94,0.20)',
            '--nw-success-30': 'rgba(34,197,94,0.30)',
            '--nw-error-06': 'rgba(239,68,68,0.06)',
            '--nw-error-08': 'rgba(239,68,68,0.08)',
            '--nw-error-10': 'rgba(239,68,68,0.10)',
            '--nw-error-12': 'rgba(239,68,68,0.12)',
            '--nw-error-15': 'rgba(239,68,68,0.15)',
            '--nw-error-20': 'rgba(239,68,68,0.20)',
            '--nw-error-30': 'rgba(239,68,68,0.30)',
            '--nw-warning-04': 'rgba(245,158,11,0.04)',
            '--nw-warning-08': 'rgba(245,158,11,0.08)',
            '--nw-warning-10': 'rgba(245,158,11,0.10)',
            '--nw-warning-12': 'rgba(245,158,11,0.12)',
            '--nw-warning-15': 'rgba(245,158,11,0.15)',
            '--nw-warning-20': 'rgba(245,158,11,0.20)',
            '--nw-warning-30': 'rgba(245,158,11,0.30)',
            '--nw-primary-04': 'rgba(249,115,22,0.04)',
            '--nw-primary-06': 'rgba(249,115,22,0.06)',
            '--nw-primary-08': 'rgba(249,115,22,0.08)',
            '--nw-primary-10': 'rgba(249,115,22,0.10)',
            '--nw-primary-12': 'rgba(249,115,22,0.12)',
            '--nw-primary-15': 'rgba(249,115,22,0.15)',
            '--nw-primary-20': 'rgba(249,115,22,0.20)',
            '--nw-primary-30': 'rgba(249,115,22,0.30)',
            '--nw-primary-40': 'rgba(249,115,22,0.40)',
            fontFeatureSettings: '"cv02","cv03","cv04","cv11"',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            transition: 'background 0.3s ease, color 0.3s ease',
          },
          '::selection': {
            background: c.selection,
            color: isDark ? '#FFFFFF' : '#1A1A2E',
          },
          '::-webkit-scrollbar': { width: '6px', height: '6px' },
          '::-webkit-scrollbar-track': { background: c.scrollTrack },
          '::-webkit-scrollbar-thumb': { background: '#F97316', borderRadius: '3px' },
        },
      },

      // ── Button ───────────────────────────────
      MuiButton: {
        defaultProps: { disableElevation: true },
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
            '&:hover': { background: 'rgba(249,115,22,0.08)' },
          },
          sizeSmall: { padding: '6px 16px', fontSize: '0.8125rem' },
          sizeMedium: { padding: '10px 24px', fontSize: '0.9375rem' },
          sizeLarge: { padding: '14px 32px', fontSize: '1rem' },
        },
      },

      // ── Card ─────────────────────────────────
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            background: c.card,
            border: `1px solid ${c.border}`,
            borderRadius: 16,
            backgroundImage: 'none',
            transition: 'all 0.25s ease',
            '&:hover': {
              border: '1px solid rgba(249,115,22,0.25)',
              boxShadow: isDark
                ? '0 8px 32px rgba(249,115,22,0.08), 0 2px 8px rgba(0,0,0,0.4)'
                : '0 8px 32px rgba(249,115,22,0.08), 0 2px 8px rgba(0,0,0,0.06)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: { padding: '24px', '&:last-child': { paddingBottom: '24px' } },
        },
      },

      // ── TextField / OutlinedInput ────────────
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              background: c.inputBg,
              borderRadius: '12px',
              transition: 'all 0.2s ease',
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorder },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(249,115,22,0.4)',
            },
            '& .MuiInputBase-input': { color: c.textPrimary, padding: '13px 16px' },
            '& .MuiInputLabel-root': { color: c.textMuted },
            '& .MuiInputLabel-root.Mui-focused': { color: '#F97316' },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            background: c.inputBg,
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
          notchedOutline: { borderColor: c.inputBorder },
          input: { color: c.textPrimary, padding: '13px 16px' },
        },
      },

      MuiInputLabel: {
        styleOverrides: {
          root: { color: c.textMuted, '&.Mui-focused': { color: '#F97316' } },
        },
      },

      // ── Chip ─────────────────────────────────
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: '8px', fontWeight: 500 },
          colorPrimary: {
            background: 'rgba(249,115,22,0.15)',
            color: '#F97316',
            border: '1px solid rgba(249,115,22,0.3)',
          },
          colorSuccess: { background: 'rgba(16,185,129,0.12)', color: '#10B981' },
          colorError: { background: 'rgba(239,68,68,0.12)', color: '#EF4444' },
          colorWarning: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
        },
      },

      // ── Divider ──────────────────────────────
      MuiDivider: {
        styleOverrides: { root: { borderColor: c.border } },
      },

      // ── Tooltip ──────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            background: c.elevated,
            border: `1px solid ${c.inputBorder}`,
            color: c.textPrimary,
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.8125rem',
          },
        },
      },

      // ── LinearProgress ───────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 4, background: c.border },
          bar: { background: 'linear-gradient(90deg, #F97316, #F59E0B)' },
        },
      },

      // ── Tabs / Tab ───────────────────────────
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none' as const,
            fontWeight: 500,
            color: c.textMuted,
            fontSize: '0.9375rem',
            '&.Mui-selected': { color: '#F97316', fontWeight: 700 },
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
            background: c.card,
            border: `1px solid ${c.border}`,
          },
        },
      },

      // ── Dialog ───────────────────────────────
      MuiDialog: {
        styleOverrides: {
          paper: {
            background: c.card,
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 20,
            backgroundImage: 'none',
          },
        },
      },

      // ── Alert ────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
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
            background: c.elevated,
            color: c.textSecondary,
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
            borderBottom: `1px solid ${c.border}`,
          },
          body: {
            color: c.textPrimary,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
          },
        },
      },

      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'background 0.15s ease',
            '&:hover': { background: 'rgba(249,115,22,0.04) !important' },
          },
        },
      },

      // ── Select ───────────────────────────────
      MuiSelect: {
        styleOverrides: {
          outlined: { color: c.textPrimary },
          icon: { color: c.textSecondary },
        },
      },

      // ── MenuItem ─────────────────────────────
      MuiMenuItem: {
        styleOverrides: {
          root: {
            color: c.textPrimary,
            '&:hover': { background: 'rgba(249,115,22,0.08)' },
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
          root: { background: c.border },
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
}

// ═══════════════════════════════════════════
// DEFAULT THEME (backwards compat)
// ═══════════════════════════════════════════

export const novaWingsTheme = createNovaWingsTheme('dark');

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
