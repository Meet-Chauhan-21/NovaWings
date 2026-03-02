import React from "react";

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 3,
  className = "",
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse ${className}`}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-8 bg-gray-100 rounded-lg w-20" />
            <div className="h-8 bg-gray-200 rounded-lg w-24" />
          </div>
        </div>
      ))}
    </>
  );
};

export default SkeletonCard;
