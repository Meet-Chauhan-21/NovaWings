// src/components/ErrorMessage.tsx
// Displays a red error box with an icon and message

interface ErrorMessageProps {
  message: string;
}

/**
 * ErrorMessage renders a prominent red alert box
 * with an error icon and the provided message text.
 */
export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 max-w-xl mx-auto my-6">
      <span className="text-red-500 text-xl">⚠️</span>
      <p className="text-red-700 font-medium">{message}</p>
    </div>
  );
}
