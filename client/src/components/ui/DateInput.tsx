// src/components/ui/DateInput.tsx
// Dark MUI-styled date input with Today / Tomorrow quick-select buttons

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import TodayIcon from "@mui/icons-material/Today";
import EventIcon from "@mui/icons-material/Event";

interface DateInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  min?: string;
  max?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  /** Show "Today" and "Tomorrow" quick-select pills below the input */
  showQuickButtons?: boolean;
}

const getToday = () => new Date().toISOString().split("T")[0];
const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  error,
  min,
  max,
  className = "",
  disabled = false,
  name,
  id,
  showQuickButtons = false,
}) => {
  const today = getToday();
  const tomorrow = getTomorrow();
  const isToday = value === today;
  const isTomorrow = value === tomorrow;

  const quickBtns = [
    { label: "Today", val: today, active: isToday, icon: <TodayIcon sx={{ fontSize: 13 }} /> },
    { label: "Tomorrow", val: tomorrow, active: isTomorrow, icon: <EventIcon sx={{ fontSize: 13 }} /> },
  ];

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

      {/* Input row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
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
        <CalendarMonthOutlinedIcon
          sx={{ color: "#F97316", fontSize: 18, flexShrink: 0 }}
        />
        <input
          type="date"
          name={name}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: value ? "#FFFFFF" : "#6B7280",
            fontSize: "0.9375rem",
            fontWeight: 500,
            padding: "16px 0",
            cursor: disabled ? "not-allowed" : "pointer",
            colorScheme: "dark",
            fontFamily: "inherit",
            width: "100%",
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </Box>

      {/* Quick-select pills */}
      {showQuickButtons && (
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          {quickBtns.map((btn) => (
            <Box
              key={btn.label}
              onClick={() => !disabled && onChange(btn.val)}
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                px: 1.5,
                py: "7px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: disabled ? "default" : "pointer",
                transition: "all 0.18s ease",
                border: btn.active
                  ? "1px solid rgba(249,115,22,0.6)"
                  : "1px solid rgba(255,255,255,0.1)",
                background: btn.active
                  ? "rgba(249,115,22,0.18)"
                  : "rgba(255,255,255,0.03)",
                color: btn.active ? "#FB923C" : "#6B7280",
                boxShadow: btn.active
                  ? "0 0 0 1px rgba(249,115,22,0.15) inset"
                  : "none",
                userSelect: "none",
                "&:hover": {
                  borderColor: "rgba(249,115,22,0.5)",
                  color: "#F97316",
                  background: "rgba(249,115,22,0.1)",
                },
              }}
            >
              {btn.icon}
              {btn.label}
            </Box>
          ))}
        </Box>
      )}

      {error && (
        <Typography sx={{ mt: 0.5, fontSize: "0.75rem", color: "#EF4444" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DateInput;
