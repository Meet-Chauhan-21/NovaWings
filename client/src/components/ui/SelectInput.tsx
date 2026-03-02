import React from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  error,
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
      <select
        name={name}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full rounded-lg border ${
          error ? "border-red-400 ring-1 ring-red-300" : "border-gray-300"
        } bg-white px-4 py-2.5 text-sm text-gray-900
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none
        transition-all duration-200 cursor-pointer appearance-none
        bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
        bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SelectInput;
