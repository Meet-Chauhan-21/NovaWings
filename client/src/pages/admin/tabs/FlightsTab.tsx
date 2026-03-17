// tabs/FlightsTab.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFlight, searchAdmin } from "../../../services/flightService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination";
import useDebounce from "../../../hooks/useDebounce";
import type { Flight } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

interface FlightsTabProps {
  flightsEnabled: boolean;
  setFlightsEnabled: (v: boolean) => void;
  flightsQuery: { isLoading: boolean };
  flights: Flight[];
}

export default function FlightsTab({
  flightsEnabled,
  setFlightsEnabled,
  flightsQuery,
  flights,
}: FlightsTabProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchPageSize, setSearchPageSize] = useState(20);
  const debouncedSearch = useDebounce(searchQuery, 400);

  const hasSearchFilters = !!(debouncedSearch || sourceFilter || destFilter || airlineFilter);

  const adminSearchQuery = useQuery({
    queryKey: ["adminFlightSearch", debouncedSearch, sourceFilter, destFilter, airlineFilter, searchPage, searchPageSize],
    queryFn: () =>
      searchAdmin({
        q: debouncedSearch || undefined,
        source: sourceFilter || undefined,
        destination: destFilter || undefined,
        airline: airlineFilter || undefined,
        page: searchPage - 1,
        size: searchPageSize,
      }),
    enabled: hasSearchFilters,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlight(id),
    onSuccess: () => {
      import("react-hot-toast").then(({ default: toast }) => toast.success("Flight deleted successfully."));
      queryClient.invalidateQueries({ queryKey: ["flights"] });
    },
    onError: () => {
      import("react-hot-toast").then(({ default: toast }) => toast.error("Failed to delete flight."));
    },
  });

  useEffect(() => { setSearchPage(1); }, [debouncedSearch, sourceFilter, destFilter, airlineFilter, searchPageSize]);

  const flightsClientPage = useMemo(() => {
    if (hasSearchFilters) return [];
    const sorted = [...flights].sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
    const start = (searchPage - 1) * searchPageSize;
    return sorted.slice(start, start + searchPageSize);
  }, [flights, searchPage, searchPageSize, hasSearchFilters]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--nw-text-primary)" }}>Manage Flights</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {!flightsEnabled && (
            <Button
              variant="outlined"
              onClick={() => setFlightsEnabled(true)}
              sx={{ borderColor: "var(--nw-border-strong)", color: "var(--nw-text-primary)", borderRadius: "12px", textTransform: "none", fontWeight: 600, fontSize: "0.85rem", "&:hover": { borderColor: "rgba(255,255,255,0.3)", background: "var(--nw-border-soft)" } }}
            >
              Load All Flights
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate("/admin/flights/add")}
            sx={{ background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-light))", color: "var(--nw-text-primary)", borderRadius: "12px", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-primary))" } }}
          >
            + Add Flight
          </Button>
        </Box>
      </Box>

      {/* Search & Filter Bar */}
      <Paper elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
          <TextField
            size="small"
            type="text"
            placeholder="Search flight number or airline..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { background: "var(--nw-glass)", borderRadius: "10px", fontSize: "0.85rem", color: "var(--nw-text-primary)", "& fieldset": { borderColor: "var(--nw-border-strong)" }, "&:hover fieldset": { borderColor: "var(--nw-border-strong)" }, "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" } } }}
          />
          <TextField
            size="small"
            type="text"
            placeholder="Source city..."
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { background: "var(--nw-glass)", borderRadius: "10px", fontSize: "0.85rem", color: "var(--nw-text-primary)", "& fieldset": { borderColor: "var(--nw-border-strong)" }, "&:hover fieldset": { borderColor: "var(--nw-border-strong)" }, "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" } } }}
          />
          <TextField
            size="small"
            type="text"
            placeholder="Destination city..."
            value={destFilter}
            onChange={(e) => setDestFilter(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { background: "var(--nw-glass)", borderRadius: "10px", fontSize: "0.85rem", color: "var(--nw-text-primary)", "& fieldset": { borderColor: "var(--nw-border-strong)" }, "&:hover fieldset": { borderColor: "var(--nw-border-strong)" }, "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" } } }}
          />
          <TextField
            size="small"
            type="text"
            placeholder="Airline name..."
            value={airlineFilter}
            onChange={(e) => setAirlineFilter(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { background: "var(--nw-glass)", borderRadius: "10px", fontSize: "0.85rem", color: "var(--nw-text-primary)", "& fieldset": { borderColor: "var(--nw-border-strong)" }, "&:hover fieldset": { borderColor: "var(--nw-border-strong)" }, "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" } } }}
          />
        </Box>
        {hasSearchFilters && (
          <Button
            variant="text"
            onClick={() => {
              setSearchQuery("");
              setSourceFilter("");
              setDestFilter("");
              setAirlineFilter("");
            }}
            sx={{ mt: 1.5, color: "var(--nw-primary)", textTransform: "none", fontSize: "0.85rem", fontWeight: 600, "&:hover": { background: "var(--nw-primary-08)" } }}
          >
            Clear all filters
          </Button>
        )}
      </Paper>

      {/* Flights Table */}
      {(() => {
        const isServerSearch = hasSearchFilters;
        const displayFlights: Flight[] = isServerSearch
          ? (adminSearchQuery.data?.content ?? [])
          : flightsClientPage;
        const totalItems = isServerSearch
          ? (adminSearchQuery.data?.totalElements ?? 0)
          : flights.length;
        const isFlightsLoading = isServerSearch
          ? adminSearchQuery.isLoading
          : flightsQuery.isLoading;

        if (!flightsEnabled && !hasSearchFilters) {
          return (
            <Paper elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 6, textAlign: "center" }}>
              <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "1.1rem", mb: 1 }}>Flights are not loaded yet</Typography>
              <Typography sx={{ color: "var(--nw-text-disabled)", fontSize: "0.85rem", mb: 3 }}>
                Use the search bar above to find specific flights, or click "Load All Flights" to browse everything.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setFlightsEnabled(true)}
                sx={{ background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-light))", color: "var(--nw-text-primary)", borderRadius: "12px", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-primary))" } }}
              >
                Load All Flights
              </Button>
            </Paper>
          );
        }

        if (isFlightsLoading) return <LoadingSpinner />;

        return (
          <>
            <Paper elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", overflow: "hidden" }}>
              <Box sx={{ overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Flight</th>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Airline</th>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Route</th>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Departure</th>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Price</th>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Seats</th>
                      <th style={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "var(--nw-border-soft)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid var(--nw-border)" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayFlights.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ color: "var(--nw-text-muted)", fontSize: "0.85rem", padding: "32px 20px", textAlign: "center" as const, borderBottom: "1px solid var(--nw-border-soft)" }}>
                          No flights found
                        </td>
                      </tr>
                    ) : (
                      displayFlights.map((flight) => (
                        <tr key={flight.id} style={{ transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--nw-glass)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)", fontFamily: "monospace" }}>{flight.flightNumber}</td>
                          <td style={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>{flight.airlineName}</td>
                          <td style={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>
                            {flight.source} → {flight.destination}
                          </td>
                          <td style={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>
                            {new Date(flight.departureTime).toLocaleString("en-IN", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td style={{ color: "var(--nw-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)", fontWeight: 700 }}>₹{flight.price.toLocaleString("en-IN")}</td>
                          <td style={{ color: "var(--nw-text-primary)", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>{flight.availableSeats}</td>
                          <td style={{ padding: "14px 20px", borderBottom: "1px solid var(--nw-border-soft)" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/admin/flights/${flight.id}/edit`)}
                                sx={{ borderColor: "rgba(251,191,36,0.4)", color: "var(--nw-secondary)", borderRadius: "8px", textTransform: "none", fontSize: "0.75rem", fontWeight: 600, minWidth: 0, px: 1.5, py: 0.5, "&:hover": { borderColor: "var(--nw-secondary)", background: "rgba(251,191,36,0.08)" } }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  const confirmed = window.confirm(
                                    `Delete flight ${flight.flightNumber}? This cannot be undone.`
                                  );
                                  if (confirmed) deleteMutation.mutate(flight.id);
                                }}
                                sx={{ borderColor: "rgba(239,68,68,0.4)", color: "var(--nw-error)", borderRadius: "8px", textTransform: "none", fontSize: "0.75rem", fontWeight: 600, minWidth: 0, px: 1.5, py: 0.5, "&:hover": { borderColor: "var(--nw-error)", background: "var(--nw-error-08)" } }}
                              >
                                Delete
                              </Button>
                            </Box>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Box>
            </Paper>
            <Pagination
              currentPage={searchPage}
              totalItems={totalItems}
              itemsPerPage={searchPageSize}
              onPageChange={setSearchPage}
              onItemsPerPageChange={(size) => setSearchPageSize(size)}
            />
          </>
        );
      })()}
    </Box>
  );
}




