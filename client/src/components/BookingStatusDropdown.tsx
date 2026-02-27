// src/components/BookingStatusDropdown.tsx
// Reusable dropdown + save button for changing a booking's status (ADMIN)

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { updateBookingStatus } from "../services/bookingService";

interface Props {
  bookingId: string;
  currentStatus: "CONFIRMED" | "CANCELLED";
  onSaved: () => void;
}

export default function BookingStatusDropdown({
  bookingId,
  currentStatus,
  onSaved,
}: Props) {
  const [selectedStatus, setSelectedStatus] =
    useState<"CONFIRMED" | "CANCELLED">(currentStatus);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Reset local state when the backend data refreshes
  useEffect(() => {
    setSelectedStatus(currentStatus);
    setIsDirty(false);
  }, [currentStatus]);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value as "CONFIRMED" | "CANCELLED";
    setSelectedStatus(newValue);
    setIsDirty(newValue !== currentStatus);
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateBookingStatus(bookingId, selectedStatus);
      toast.success("Booking status updated!");
      setIsDirty(false);
      onSaved();
    } catch {
      toast.error("Failed to update status");
      setSelectedStatus(currentStatus);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Dropdown */}
      <select
        value={selectedStatus}
        onChange={handleChange}
        className={`
          text-xs font-medium rounded-lg px-2 py-1.5 border cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-sky-400
          transition-colors
          ${
            selectedStatus === "CONFIRMED"
              ? "bg-green-50 text-green-700 border-green-300"
              : "bg-red-50 text-red-700 border-red-300"
          }
        `}
      >
        <option value="CONFIRMED">CONFIRMED</option>
        <option value="CANCELLED">CANCELLED</option>
      </select>

      {/* Save Button — only visible when dropdown value changed */}
      {isDirty && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="
            flex items-center gap-1 text-xs font-medium
            bg-sky-600 hover:bg-sky-700 text-white
            px-2.5 py-1.5 rounded-lg transition
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save
            </>
          )}
        </button>
      )}
    </div>
  );
}
