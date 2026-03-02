// src/components/CityCombobox.tsx
// Fully dynamic city combobox — fetches all locations from API, no hardcoded data

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import useDebounce from "../hooks/useDebounce";
import locationService from "../services/locationService";
import type { Location } from "../types";

interface CityComboboxProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  excludeCity?: string;
  label?: string;
  labelClassName?: string;
}

export default function CityCombobox({
  value,
  onChange,
  placeholder = "Type or select city",
  excludeCity,
  label,
  labelClassName,
}: CityComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const debouncedInput = useDebounce(inputValue, 300);

  // Fetch all active locations on mount (cached 30 min)
  const { data: allLocations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: locationService.getAll,
    staleTime: 30 * 60 * 1000,
  });

  // Search API when user types 2+ chars
  const { data: searchResults = [] } = useQuery({
    queryKey: ["locationSearch", debouncedInput],
    queryFn: () => locationService.search(debouncedInput),
    staleTime: 5 * 60 * 1000,
    enabled: debouncedInput.length >= 2,
  });

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

  function renderOption(loc: Location, idx: number) {
    const isActive = idx === focusedIndex;
    const isSelected = loc.city === value;
    return (
      <button
        key={loc.id}
        data-option
        type="button"
        onMouseDown={() => selectCity(loc)}
        onMouseEnter={() => setFocusedIndex(idx)}
        className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
          isActive
            ? "bg-sky-50 text-sky-700"
            : isSelected
              ? "bg-sky-50 text-sky-700 font-medium"
              : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-base shrink-0">{loc.type === "metro" ? "🌆" : "🏙️"}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{loc.city}</p>
            <p className="text-xs text-gray-400 truncate">
              {loc.state}, {loc.country}
            </p>
            {loc.airportName && (
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                ✈ {loc.airportName}
              </p>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded">
            {loc.airportCode}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className={labelClassName ?? "block text-xs font-medium text-gray-600 mb-1"}>{label}</label>
      )}

      <div
        className={`flex items-center border rounded-xl bg-white px-3 py-2.5 transition-all ${
          focused
            ? "border-sky-500 ring-2 ring-sky-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className="text-gray-400 mr-2 shrink-0">🏙️</span>
        <input
          type="text"
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
          className="flex-1 outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400"
        />
        {inputValue && (
          <button
            type="button"
            onClick={() => {
              setInputValue("");
              onChange("");
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-red-400 ml-1 transition-colors shrink-0"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
          tabIndex={-1}
        >
          <span className={`text-xs transition-transform inline-block ${isOpen ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 w-full min-w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
        >
          {/* Popular cities header when showing all */}
          {debouncedInput.length < 2 && filtered.length > 0 && (
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50/80 border-b border-gray-100 flex items-center gap-1.5">
              <span>⭐</span> Popular Cities
            </div>
          )}

          {/* Metro cities group */}
          {metros.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                🌆 Metro Cities
              </div>
              {metros.map((loc, idx) => renderOption(loc, idx))}
            </>
          )}

          {/* Other cities group */}
          {others.length > 0 && (
            <>
              <div className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-gray-100 border-t">
                🏙️ Other Cities
              </div>
              {others.map((loc, idx) => renderOption(loc, metros.length + idx))}
            </>
          )}

          {/* No results */}
          {filtered.length === 0 && inputValue && (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-500">City not found — "{inputValue}"</p>
              <p className="text-xs text-gray-400 mt-1">Admin can add new cities from the dashboard</p>
            </div>
          )}

          {/* Empty input hint */}
          {filtered.length === 0 && !inputValue && (
            <div className="px-4 py-4 text-sm text-gray-400 text-center">
              Start typing to search cities...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
