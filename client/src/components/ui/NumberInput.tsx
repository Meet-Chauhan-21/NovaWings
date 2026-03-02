import React, { useCallback } from "react";

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

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div
        className={`flex items-center rounded-lg border ${
          error ? "border-red-400 ring-1 ring-red-300" : "border-gray-300"
        } bg-white overflow-hidden transition-all duration-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200`}
      >
        <button
          type="button"
          onClick={decrease}
          disabled={disabled || value <= min}
          className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 border-r border-gray-200"
          tabIndex={-1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          name={name}
          id={id}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          className="flex-1 text-center py-2.5 text-sm font-medium text-gray-900 bg-transparent border-none outline-none focus:ring-0 min-w-[40px]"
        />
        <button
          type="button"
          onClick={increase}
          disabled={disabled || value >= max}
          className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 border-l border-gray-200"
          tabIndex={-1}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default NumberInput;
