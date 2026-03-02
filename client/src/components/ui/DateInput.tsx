import React from "react";

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
}

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
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type="date"
          name={name}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          disabled={disabled}
          className={`w-full rounded-lg border ${
            error ? "border-red-400 ring-1 ring-red-300" : "border-gray-300"
          } bg-white px-4 py-2.5 text-sm text-gray-900
          focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
          transition-all duration-200 cursor-pointer
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
          [&::-webkit-calendar-picker-indicator]:opacity-60
          [&::-webkit-calendar-picker-indicator]:hover:opacity-100`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default DateInput;
