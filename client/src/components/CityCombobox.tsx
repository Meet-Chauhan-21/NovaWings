// src/components/CityCombobox.tsx
// Type-or-select city input with dropdown, clear button, and custom value support

import { useState, useRef, useEffect, useCallback } from "react";

const CITIES = [
  "Delhi", "Mumbai", "Surat", "Bangalore", "Chennai",
  "Kolkata", "Hyderabad", "Ahmedabad", "Jaipur", "Pune",
  "Goa", "Lucknow", "Kochi", "Chandigarh", "Bhopal",
  "Patna", "Varanasi", "Indore", "Nagpur", "Coimbatore",
];

interface CityComboboxProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  excludeCity?: string;
  label?: string;
}

export default function CityCombobox({
  value,
  onChange,
  placeholder = "Type or select city",
  excludeCity,
  label,
}: CityComboboxProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync external value → internal input
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Commit typed value on blur
        if (inputValue !== value) onChange(inputValue);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue, value, onChange]);

  const filtered = CITIES.filter((c) => {
    if (excludeCity && c.toLowerCase() === excludeCity.toLowerCase()) return false;
    if (!inputValue) return true;
    return c.toLowerCase().includes(inputValue.toLowerCase());
  });

  const selectCity = useCallback(
    (city: string) => {
      setInputValue(city);
      onChange(city);
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
          setFocusedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filtered.length) {
            selectCity(filtered[focusedIndex]);
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

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setFocusedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-3 pr-16 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-800 text-sm bg-gray-50"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                onChange("");
                setIsOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-1"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 p-1"
            tabIndex={-1}
          >
            {isOpen ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {isOpen && filtered.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg"
        >
          {filtered.map((city, idx) => (
            <li
              key={city}
              onMouseDown={() => selectCity(city)}
              onMouseEnter={() => setFocusedIndex(idx)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition ${
                idx === focusedIndex
                  ? "bg-sky-50 text-sky-700"
                  : city === value
                  ? "bg-sky-50 text-sky-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
