// src/components/CityCombobox.tsx
// Fully dynamic city combobox — MUI-styled dark theme, all existing logic preserved

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "../hooks/useDebounce";
import locationService from "../services/locationService";
import type { Location } from "../types";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";

import FlightTakeoffOutlinedIcon from "@mui/icons-material/FlightTakeoffOutlined";
import FlightLandOutlinedIcon from "@mui/icons-material/FlightLandOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";

interface CityComboboxProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  excludeCity?: string;
  label?: string;
  labelClassName?: string;
  /** Controls the leading adornment icon */
  type?: "departure" | "arrival";
}

export default function CityCombobox({
  value,
  onChange,
  placeholder = "Type or select city",
  excludeCity,
  label,
  labelClassName,
  type,
}: CityComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedInput = useDebounce(inputValue, 300);

  // Fetch all active locations on mount (cached 30 min)
  const { data: allLocations = [], isFetching: loadingAll } = useQuery({
    queryKey: ["locations"],
    queryFn: locationService.getAll,
    staleTime: 30 * 60 * 1000,
  });

  // Search API when user types 2+ chars
  const { data: searchResults = [], isFetching: loadingSearch } = useQuery({
    queryKey: ["locationSearch", debouncedInput],
    queryFn: () => locationService.search(debouncedInput),
    staleTime: 5 * 60 * 1000,
    enabled: debouncedInput.length >= 2,
  });

  const isLoading = debouncedInput.length >= 2 ? loadingSearch : loadingAll;

  // Decide which list to show
  const locationsToShow = debouncedInput.length >= 2 ? searchResults : allLocations;

  // Filter out excluded city, add local search across all fields, limit to 12
  const filtered = locationsToShow
    .filter((loc) => {
      if (!loc.active) return false;
      if (loc.city.toLowerCase() === (excludeCity?.toLowerCase() ?? "")) return false;
      // Local fuzzy match when typing
      if (inputValue.length >= 1 && debouncedInput.length < 2) {
        const q = inputValue.toLowerCase();
        return (
          loc.city.toLowerCase().includes(q) ||
          loc.state.toLowerCase().includes(q) ||
          loc.airportCode.toLowerCase().includes(q) ||
          (loc.airportName?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    })
    .slice(0, 12);

  // Split by type for grouped display
  const metros = filtered.filter((l) => l.type === "metro");
  const others = filtered.filter((l) => l.type !== "metro");
  const flatList = [...metros, ...others];

  // Sync external value → internal input (only when not focused)
  useEffect(() => {
    if (!focused) {
      setInputValue(value);
    }
  }, [value, focused]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (inputValue !== value) onChange(inputValue);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, value, onChange]);

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option]");
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  const selectCity = useCallback(
    (loc: Location) => {
      setInputValue(loc.city);
      onChange(loc.city);
      setIsOpen(false);
      setFocusedIndex(-1);
    },
    [onChange]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen && (e.key === "ArrowDown" || e.key === "Enter")) {
      setIsOpen(true);
      return;
    }
    if (isOpen) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < flatList.length) {
            selectCity(flatList[focusedIndex]);
          } else if (inputValue.trim()) {
            onChange(inputValue.trim());
            setIsOpen(false);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    }
  }

  // Pick lead icon based on `type` prop
  const LeadIcon =
    type === "arrival"
      ? FlightLandOutlinedIcon
      : type === "departure"
        ? FlightTakeoffOutlinedIcon
        : LocationCityOutlinedIcon;

  function renderOption(loc: Location, idx: number) {
    const isActive = idx === focusedIndex;
    const isSelected = loc.city === value;
    return (
      <Box
        key={loc.id}
        data-option
        component="button"
        type="button"
        onMouseDown={() => selectCity(loc)}
        onMouseEnter={() => setFocusedIndex(idx)}
        sx={{
          width: "100%",
          textAlign: "left",
          px: 2,
          py: 1.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          border: "none",
          cursor: "pointer",
          transition: "background 0.12s ease",
          background: isActive || isSelected ? "rgba(249,115,22,0.08)" : "transparent",
          borderLeft: isActive || isSelected ? "2px solid #F97316" : "2px solid transparent",
          "&:hover": { background: "rgba(249,115,22,0.06)" },
        }}
      >
        {/* City info — 3-line design */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, minWidth: 0, flex: 1 }}>
          <Box sx={{ mt: 0.25, width: 28, height: 28, borderRadius: "6px", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {loc.type === "metro"
              ? <CorporateFareOutlinedIcon sx={{ fontSize: 14, color: "#9CA3AF" }} />
              : <LocationCityOutlinedIcon sx={{ fontSize: 14, color: "#6B7280" }} />
            }
          </Box>
          <Box sx={{ minWidth: 0 }}>
            {/* Line 1: City name */}
            <Typography sx={{ color: isActive || isSelected ? "#FFFFFF" : "#E5E7EB", fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loc.city}
            </Typography>
            {/* Line 2: State + country + flight count */}
            <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {loc.state}, {loc.country}
              {loc.activeFlights ? (
                <Box component="span" sx={{ ml: 0.75, color: "#4B5563" }}>· {loc.activeFlights} flights</Box>
              ) : null}
            </Typography>
            {/* Line 3: Airport name */}
            {loc.airportName && (
              <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mt: 0.125 }}>
                {loc.airportName}
              </Typography>
            )}
          </Box>
        </Box>

        {/* IATA code chip */}
        <Chip
          label={loc.airportCode}
          size="small"
          sx={{
            flexShrink: 0,
            fontFamily: '"JetBrains Mono",monospace',
            fontWeight: 700,
            fontSize: "0.6875rem",
            background: "rgba(249,115,22,0.12)",
            color: "#F97316",
            border: "1px solid rgba(249,115,22,0.25)",
            height: 22,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Box>
    );
  }

  return (
    <Box ref={containerRef} sx={{ position: "relative" }}>
      {label && (
        <Typography
          component="label"
          className={labelClassName}
          sx={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", mb: 0.75, textTransform: "uppercase", letterSpacing: "0.06em" }}
        >
          {label}
        </Typography>
      )}

      {/* Input row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          background: "#1a1a1a",
          border: focused ? "1px solid rgba(249,115,22,0.7)" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          px: 1.5,
          gap: 1,
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          boxShadow: focused ? "0 0 0 3px rgba(249,115,22,0.06)" : "none",
          "&:hover": { borderColor: focused ? "rgba(249,115,22,0.7)" : "rgba(249,115,22,0.4)" },
        }}
      >
        <InputAdornment position="start" sx={{ ml: 0 }}>
          <LeadIcon sx={{ color: focused ? "#F97316" : "#F97316", fontSize: 18, transition: "color 0.2s" }} />
        </InputAdornment>

        <InputBase
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => {
            setFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            // After blur, restore parent value if user typed something invalid
            setTimeout(() => setInputValue(value), 200);
          }}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, "& input": { color: "#FFFFFF", fontSize: "0.9375rem", fontWeight: 500, padding: "16px 0", "&::placeholder": { color: "#6B7280" } } }}
        />

        {isLoading && <CircularProgress size={14} sx={{ color: "#F97316", flexShrink: 0 }} />}

        {inputValue && !isLoading && (
          <IconButton
            size="small"
            onClick={() => { setInputValue(""); onChange(""); setIsOpen(false); }}
            tabIndex={-1}
            sx={{ color: "#4B5563", "&:hover": { color: "#EF4444" }, p: 0.25 }}
          >
            <CloseIcon sx={{ fontSize: 14 }} />
          </IconButton>
        )}

        <IconButton
          size="small"
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={-1}
          sx={{ color: "#4B5563", p: 0.25 }}
        >
          <ExpandMoreIcon sx={{ fontSize: 16, transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
        </IconButton>
      </Box>

      {/* Dropdown */}
      {isOpen && (
        <Paper
          ref={listRef}
          elevation={0}
          sx={{
            position: "absolute",
            zIndex: 1300,
            mt: 0.75,
            width: "100%",
            minWidth: 300,
            background: "#161616",
            border: "1px solid rgba(249,115,22,0.25)",
            borderRadius: "14px",
            maxHeight: 320,
            overflowY: "auto",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 4px 16px rgba(249,115,22,0.08)",
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": { background: "#F97316", borderRadius: "2px" },
          }}
        >
          {/* Popular header */}
          {debouncedInput.length < 2 && filtered.length > 0 && (
            <Box sx={{ px: 2, py: 1, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
              <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Popular Cities
              </Typography>
            </Box>
          )}

          {/* Metro Cities */}
          {metros.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 0.75, background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Metro Cities
                </Typography>
              </Box>
              {metros.map((loc, idx) => renderOption(loc, idx))}
            </>
          )}

          {/* Other Cities */}
          {others.length > 0 && (
            <>
              <Box sx={{ px: 2, py: 0.75, background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <Typography sx={{ color: "#4B5563", fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Other Cities
                </Typography>
              </Box>
              {others.map((loc, idx) => renderOption(loc, metros.length + idx))}
            </>
          )}

          {/* No results */}
          {filtered.length === 0 && inputValue && (
            <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
              <Typography sx={{ color: "#6B7280", fontSize: "0.875rem" }}>
                No city found for "{inputValue}"
              </Typography>
              <Typography sx={{ color: "#4B5563", fontSize: "0.75rem", mt: 0.5 }}>
                Admin can add new cities from the dashboard
              </Typography>
            </Box>
          )}

          {/* Empty hint */}
          {filtered.length === 0 && !inputValue && (
            <Box sx={{ px: 3, py: 3, textAlign: "center" }}>
              <Typography sx={{ color: "#4B5563", fontSize: "0.875rem" }}>
                Start typing to search cities…
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
