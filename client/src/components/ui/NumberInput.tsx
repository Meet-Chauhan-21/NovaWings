// src/components/ui/NumberInput.tsx
// Dark MUI-styled passenger counter — icon + count label + –/+ buttons

import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  error,
  className = "",
  disabled = false,
  name,
  id,
}) => {
  const decrease = useCallback(() => {
    const next = value - step;
    if (next >= min) onChange(next);
  }, [value, step, min, onChange]);

  const increase = useCallback(() => {
    const next = value + step;
    if (next <= max) onChange(next);
  }, [value, step, max, onChange]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") return;
      const num = parseInt(raw, 10);
      if (!isNaN(num) && num >= min && num <= max) onChange(num);
    },
    [min, max, onChange]
  );

  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  const btnSx = (enabled: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: "7px",
    border: "1px solid rgba(249,115,22,0.25)",
    background: "rgba(249,115,22,0.08)",
    color: "#F97316",
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.35,
    transition: "all 0.15s ease",
    flexShrink: 0,
    userSelect: "none" as const,
    ...(enabled && {
      "&:hover": {
        background: "rgba(249,115,22,0.2)",
        borderColor: "rgba(249,115,22,0.55)",
      },
    }),
  });

  return (
    <Box className={className}>
      {label && (
        <Typography
          sx={{
            color: "#6B7280",
            fontSize: "0.7rem",
            fontWeight: 600,
            mb: 0.8,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: "14px",
          background: "#1a1a1a",
          border: `1px solid ${error ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "12px",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: error ? "rgba(239,68,68,0.7)" : "rgba(249,115,22,0.4)",
          },
          "&:focus-within": {
            borderColor: error ? "rgba(239,68,68,0.7)" : "rgba(249,115,22,0.7)",
            boxShadow: `0 0 0 3px ${
              error ? "rgba(239,68,68,0.06)" : "rgba(249,115,22,0.06)"
            }`,
          },
        }}
      >
        {/* Icon */}
        <PeopleAltOutlinedIcon sx={{ color: "#F97316", fontSize: 18, flexShrink: 0 }} />

        {/* Label */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              color: "#FFFFFF",
              fontSize: "0.9375rem",
              fontWeight: 500,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {value}&nbsp;
            <Box
              component="span"
              sx={{ color: "#9CA3AF", fontSize: "0.8125rem", fontWeight: 400 }}
            >
              {value === 1 ? "Passenger" : "Passengers"}
            </Box>
          </Typography>
        </Box>

        {/* –/+ controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box onClick={canDecrease ? decrease : undefined} sx={btnSx(canDecrease)}>
            <RemoveIcon sx={{ fontSize: 13 }} />
          </Box>

          {/* Hidden input for form submission / direct typing */}
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name={name}
            id={id}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            style={{
              width: 0,
              height: 0,
              opacity: 0,
              position: "absolute",
              pointerEvents: "none",
            }}
          />

          <Box onClick={canIncrease ? increase : undefined} sx={btnSx(canIncrease)}>
            <AddIcon sx={{ fontSize: 13 }} />
          </Box>
        </Box>
      </Box>

      {error && (
        <Typography sx={{ mt: 0.5, fontSize: "0.75rem", color: "#EF4444" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default NumberInput;
