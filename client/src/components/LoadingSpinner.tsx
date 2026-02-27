// src/components/LoadingSpinner.tsx
// Centered animated loading spinner

/**
 * LoadingSpinner renders a centered spinning circle
 * in the primary sky-blue color.
 */
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );
}
