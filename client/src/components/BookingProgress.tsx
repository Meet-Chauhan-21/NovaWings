import React from "react";

interface BookingProgressProps {
  activeStep: number;
}

interface Step {
  label: string;
  icon: string;
}

const steps: Step[] = [
  { label: "Search", icon: "🔍" },
  { label: "Seats", icon: "💺" },
  { label: "Meals", icon: "🍽" },
  { label: "Review", icon: "📋" },
  { label: "Payment", icon: "💳" },
];

export default function BookingProgress({ activeStep }: BookingProgressProps) {
  return (
    <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const completed = stepNumber < activeStep;
          const active = stepNumber === activeStep;
          const upcoming = stepNumber > activeStep;

          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center min-w-0 flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                    completed
                      ? "bg-green-600 text-white"
                      : active
                      ? "bg-sky-600 text-white scale-105"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {completed ? "✓" : step.icon}
                </div>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-medium text-center ${
                    active ? "text-sky-700" : upcoming ? "text-gray-500" : "text-green-700"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${completed ? "bg-green-500" : "border-t border-dashed border-gray-300"}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
