// src/components/ErrorMessage.tsx
// MUI Alert-based error display with optional retry action

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

interface ErrorMessageProps {
  /** The error message to display */
  message: string;
  /** If provided, a "Retry" button is shown */
  onRetry?: () => void;
}

/**
 * ErrorMessage renders a styled MUI error Alert.
 * Optionally shows a Retry button when `onRetry` is provided.
 */
export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <Box sx={{ maxWidth: 560, mx: "auto", my: 3 }}>
      <Alert
        severity="error"
        icon={<ErrorOutlineIcon fontSize="inherit" />}
        action={
          onRetry ? (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              sx={{
                fontWeight: 600,
                fontSize: "0.8125rem",
                color: "#EF4444",
                "&:hover": { background: "rgba(239,68,68,0.1)" },
              }}
            >
              Retry
            </Button>
          ) : undefined
        }
        sx={{
          borderRadius: "12px",
          border: "1px solid rgba(239,68,68,0.2)",
          background: "rgba(239,68,68,0.08)",
          color: "#EF4444",
          alignItems: "center",
          "& .MuiAlert-icon": { color: "#EF4444" },
        }}
      >
        {message}
      </Alert>
    </Box>
  );
}
