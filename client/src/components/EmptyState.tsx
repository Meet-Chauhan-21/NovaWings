// src/components/EmptyState.tsx
// Displays a "no results" illustration with heading, subtext, and optional CTA

import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: string;
  heading: string;
  subtext: string;
  actionLabel?: string;
  actionPath?: string;
}

/**
 * EmptyState renders a centered placeholder when there are no items to display.
 * Optionally shows an action button linking to a given path.
 */
export default function EmptyState({
  icon = "✈️",
  heading,
  subtext,
  actionLabel,
  actionPath,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl mb-4">{icon}</span>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{heading}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{subtext}</p>
      {actionLabel && actionPath && (
        <Link
          to={actionPath}
          className="bg-sky-500 text-white px-6 py-2.5 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
