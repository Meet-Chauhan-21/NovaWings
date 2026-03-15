// src/components/EmptyState.tsx
// Centered empty-state container with MUI icon, title, description, and optional action

import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface EmptyStateProps {
  /** MUI SvgIcon element, e.g. <FlightOffIcon /> */
  icon?: ReactNode;
  /** Bold heading */
  title: string;
  /** Supporting description */
  description: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Called when the action button is clicked */
  onAction?: () => void;
}

/**
 * EmptyState renders a centered placeholder when there are no items to display.
 * Accepts a MUI SvgIcon and an optional action button.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        py: 10,
        px: 3,
        position: "relative",
      }}
    >
      {/* Subtle radial glow */}
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Icon */}
      {icon && (
        <Box
          sx={{
            mb: 3,
            "& svg": { fontSize: "80px !important", color: "#374151" },
          }}
        >
          {icon}
        </Box>
      )}

      {/* Title */}
      <Typography
        sx={{
          color: "#FFFFFF",
          fontSize: "1.25rem",
          fontWeight: 700,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {/* Description */}
      <Typography
        sx={{
          color: "#6B7280",
          fontSize: "0.9375rem",
          lineHeight: 1.7,
          maxWidth: 420,
          mb: actionLabel ? 3.5 : 0,
        }}
      >
        {description}
      </Typography>

      {/* Action button */}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{
            px: 3.5,
            py: 1.25,
            fontWeight: 600,
            borderRadius: "10px",
            background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
            boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
            "&:hover": {
              background: "linear-gradient(135deg, #FB923C 0%, #F97316 100%)",
              boxShadow: "0 6px 20px rgba(249,115,22,0.5)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
