// src/components/LoadingSpinner.tsx
// MUI CircularProgress spinner with size, full-page overlay, and message variants

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

interface LoadingSpinnerProps {
  /** Visual size of the spinner */
  size?: "small" | "medium" | "large";
  /** If true, renders a full-viewport overlay */
  fullPage?: boolean;
  /** Optional label shown below the spinner */
  message?: string;
}

const SIZE_MAP = { small: 24, medium: 40, large: 56 } as const;

/**
 * LoadingSpinner renders an orange MUI CircularProgress.
 * Pass `fullPage` to cover the entire viewport with a dark overlay.
 */
export default function LoadingSpinner({
  size = "medium",
  fullPage = false,
  message,
}: LoadingSpinnerProps) {
  const px = SIZE_MAP[size];

  const inner = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <CircularProgress
        size={px}
        thickness={3.5}
        sx={{ color: "#F97316" }}
      />
      {message && (
        <Typography
          sx={{
            color: "#9CA3AF",
            fontSize: "0.875rem",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(4px)",
        }}
      >
        {inner}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 10,
      }}
    >
      {inner}
    </Box>
  );
}
