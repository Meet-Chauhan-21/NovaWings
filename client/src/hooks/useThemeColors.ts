// src/hooks/useThemeColors.ts
// Convenience hook for accessing mode-aware color tokens in components

import { useTheme } from "@mui/material/styles";
import { getColors } from "../theme/novaWingsTheme";

export function useThemeColors() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const c = getColors(theme.palette.mode);
  return { ...c, isDark, theme };
}
