// src/components/Pagination.tsx
// Dark-themed pagination matching NovaWings design system

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  showItemsPerPage?: boolean;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  function getPageNumbers(): (number | "...")[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (currentPage > 3) pages.push("...");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  }

  if (totalItems === 0) return null;

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    fontSize: "0.8125rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "#9CA3AF",
    transition: "all 0.18s ease",
    outline: "none",
    fontFamily: "inherit",
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    background: "linear-gradient(135deg,#F97316,#EA580C)",
    border: "1px solid transparent",
    color: "#fff",
    boxShadow: "0 0 0 3px rgba(249,115,22,0.2)",
  };

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity: 0.35,
    cursor: "not-allowed",
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 1,
        py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Info */}
      <Typography sx={{ fontSize: "0.8rem", color: "#6B7280", whiteSpace: "nowrap" }}>
        Showing{" "}
        <Box component="span" sx={{ color: "#D1D5DB", fontWeight: 600 }}>{startItem}</Box>
        {" – "}
        <Box component="span" sx={{ color: "#D1D5DB", fontWeight: 600 }}>{endItem}</Box>
        {" of "}
        <Box component="span" sx={{ color: "#F97316", fontWeight: 700 }}>{totalItems.toLocaleString("en-IN")}</Box>
        {" entries"}
      </Typography>

      {/* Page buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={currentPage === 1 ? btnDisabled : btnBase}
          onMouseEnter={(e) => {
            if (currentPage !== 1) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "#F97316";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.08)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== 1) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            }
          }}
        >
          ‹ Prev
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <Box
              key={`ellipsis-${idx}`}
              sx={{ px: 1, color: "#4B5563", fontSize: "0.8rem", userSelect: "none" }}
            >
              …
            </Box>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              style={page === currentPage ? btnActive : btnBase}
              onMouseEnter={(e) => {
                if (page !== currentPage) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.4)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#F97316";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (page !== currentPage) {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                }
              }}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={currentPage === totalPages ? btnDisabled : btnBase}
          onMouseEnter={(e) => {
            if (currentPage !== totalPages) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.4)";
              (e.currentTarget as HTMLButtonElement).style.color = "#F97316";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.08)";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== totalPages) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
            }
          }}
        >
          Next ›
        </button>
      </Box>

      {/* Per page selector */}
      {showItemsPerPage && onItemsPerPageChange && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#6B7280", whiteSpace: "nowrap" }}>
            Per page:
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {pageSizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => onItemsPerPageChange(size)}
                style={
                  size === itemsPerPage
                    ? { ...btnBase, background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)", color: "#F97316", minWidth: 32, padding: "0 8px" }
                    : { ...btnBase, minWidth: 32, padding: "0 8px" }
                }
                onMouseEnter={(e) => {
                  if (size !== itemsPerPage) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(249,115,22,0.35)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#F97316";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,115,22,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (size !== itemsPerPage) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#9CA3AF";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }
                }}
              >
                {size}
              </button>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
