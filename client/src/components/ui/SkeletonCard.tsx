// src/components/ui/SkeletonCard.tsx
// MUI Skeleton placeholders — flight-card and general-card variants

import React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

interface SkeletonCardProps {
  /** Number of skeleton cards to render */
  count?: number;
  /** Switch to flight-card layout (default: false = general card) */
  variant?: "flight" | "general";
  className?: string;
}

/** Single flight-card skeleton — horizontal layout matching FlightCard */
function FlightSkeleton() {
  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        p: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Airline logo */}
      <Skeleton
        animation="wave"
        variant="rounded"
        width={48}
        height={48}
        sx={{ borderRadius: "10px", flexShrink: 0 }}
      />

      {/* Flight info left column */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Skeleton animation="wave" variant="text" width="55%" height={20} sx={{ mb: 0.5 }} />
        <Skeleton animation="wave" variant="text" width="40%" height={14} />
      </Box>

      {/* Route / times center */}
      <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "center", gap: 0.5, minWidth: 120 }}>
        <Skeleton animation="wave" variant="text" width={100} height={22} />
        <Skeleton animation="wave" variant="text" width={70} height={14} />
      </Box>

      {/* Price + CTA */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1, flexShrink: 0 }}>
        <Skeleton animation="wave" variant="text" width={80} height={26} />
        <Skeleton animation="wave" variant="rounded" width={96} height={36} sx={{ borderRadius: "8px" }} />
      </Box>
    </Box>
  );
}

/** Single general card skeleton — rounded card with header + content lines */
function GeneralSkeleton() {
  return (
    <Box
      sx={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        p: "24px",
      }}
    >
      {/* Card header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2.5 }}>
        <Skeleton animation="wave" variant="rounded" width={44} height={44} sx={{ borderRadius: "10px" }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton animation="wave" variant="text" width="70%" height={18} sx={{ mb: 0.5 }} />
          <Skeleton animation="wave" variant="text" width="45%" height={14} />
        </Box>
      </Box>

      {/* Content lines */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton animation="wave" variant="text" width="100%" height={13} />
        <Skeleton animation="wave" variant="text" width="88%" height={13} />
        <Skeleton animation="wave" variant="text" width="65%" height={13} />
      </Box>

      {/* Action row */}
      <Box sx={{ display: "flex", gap: 1.5, mt: 2.5 }}>
        <Skeleton animation="wave" variant="rounded" width={80} height={32} sx={{ borderRadius: "8px" }} />
        <Skeleton animation="wave" variant="rounded" width={96} height={32} sx={{ borderRadius: "8px" }} />
      </Box>
    </Box>
  );
}

/**
 * SkeletonCard renders `count` placeholder cards.
 * Use `variant="flight"` for the horizontal flight-card layout.
 */
const SkeletonCard: React.FC<SkeletonCardProps> = ({
  count = 3,
  variant = "general",
  className = "",
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) =>
        variant === "flight" ? (
          <Box key={i} className={className}>
            <FlightSkeleton />
          </Box>
        ) : (
          <Box key={i} className={className}>
            <GeneralSkeleton />
          </Box>
        )
      )}
    </>
  );
};

export default SkeletonCard;
