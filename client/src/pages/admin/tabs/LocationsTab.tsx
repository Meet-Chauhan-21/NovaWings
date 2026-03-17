// tabs/LocationsTab.tsx
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import locationService from "../../../services/locationService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import Pagination from "../../../components/Pagination";
import type { Location } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Drawer from "@mui/material/Drawer";
import Switch from "@mui/material/Switch";
import MuiCheckbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import CloseIcon from "@mui/icons-material/Close";

export default function LocationsTab() {
  const queryClient = useQueryClient();

  const [locSearch, setLocSearch] = useState("");
  const [locTypeFilter, setLocTypeFilter] = useState<"all" | "metro" | "city" | "town">("all");
  const [locStatusFilter, setLocStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [locPage, setLocPage] = useState(1);
  const [locPageSize, setLocPageSize] = useState(20);
  const [locPanelOpen, setLocPanelOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locForm, setLocForm] = useState({
    city: "", state: "", country: "India", airportCode: "", airportName: "",
    type: "city" as "metro" | "city" | "town",
    active: true, showOnExplore: false, showOnHome: false, displayOrder: 0,
  });

  const locationsQuery = useQuery({
    queryKey: ["locationsAdmin"],
    queryFn: locationService.getAllAdmin,
    staleTime: 5 * 60 * 1000,
  });
  const allLocations: Location[] = locationsQuery.data ?? [];

  const filteredLocations = useMemo(() => {
    let result = allLocations;
    if (locTypeFilter !== "all") result = result.filter((l) => l.type === locTypeFilter);
    if (locStatusFilter === "active") result = result.filter((l) => l.active);
    if (locStatusFilter === "inactive") result = result.filter((l) => !l.active);
    if (locSearch) {
      const q = locSearch.toLowerCase();
      result = result.filter(
        (l) =>
          l.city.toLowerCase().includes(q) ||
          l.state.toLowerCase().includes(q) ||
          l.airportCode.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q),
      );
    }
    return result;
  }, [allLocations, locTypeFilter, locStatusFilter, locSearch]);

  const paginatedLocations = useMemo(() => {
    const start = (locPage - 1) * locPageSize;
    return filteredLocations.slice(start, start + locPageSize);
  }, [filteredLocations, locPage, locPageSize]);

  useEffect(() => { setLocPage(1); }, [locSearch, locTypeFilter, locStatusFilter, locPageSize]);

  const locCreateMutation = useMutation({
    mutationFn: (data: Partial<Location>) => locationService.create(data),
    onSuccess: () => {
      toast.success("Location created!");
      queryClient.invalidateQueries({ queryKey: ["locationsAdmin"] });
      setLocPanelOpen(false);
      resetLocForm();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? "Failed to create location"),
  });

  const locUpdateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Location> }) => locationService.update(id, data),
    onSuccess: () => {
      toast.success("Location updated!");
      queryClient.invalidateQueries({ queryKey: ["locationsAdmin"] });
      setLocPanelOpen(false);
      setEditingLocation(null);
      resetLocForm();
    },
    onError: () => toast.error("Failed to update location"),
  });

  const locDeleteMutation = useMutation({
    mutationFn: (id: string) => locationService.delete(id),
    onSuccess: () => {
      toast.success("Location deleted!");
      queryClient.invalidateQueries({ queryKey: ["locationsAdmin"] });
    },
    onError: () => toast.error("Failed to delete location"),
  });

  const locToggleMutation = useMutation({
    mutationFn: (id: string) => locationService.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locationsAdmin"] }),
    onError: () => toast.error("Toggle failed"),
  });

  const locRefreshCountsMutation = useMutation({
    mutationFn: () => locationService.refreshCounts(),
    onSuccess: () => {
      toast.success("Flight counts refreshed!");
      queryClient.invalidateQueries({ queryKey: ["locationsAdmin"] });
    },
    onError: () => toast.error("Failed to refresh counts"),
  });

  function resetLocForm() {
    setLocForm({
      city: "", state: "", country: "India", airportCode: "", airportName: "",
      type: "city", active: true, showOnExplore: false, showOnHome: false, displayOrder: 0,
    });
  }

  function openEditLocation(loc: Location) {
    setEditingLocation(loc);
    setLocForm({
      city: loc.city, state: loc.state, country: loc.country,
      airportCode: loc.airportCode, airportName: loc.airportName,
      type: loc.type as "metro" | "city" | "town",
      active: loc.active, showOnExplore: loc.showOnExplore, showOnHome: loc.showOnHome,
      displayOrder: loc.displayOrder,
    });
    setLocPanelOpen(true);
  }

  function handleLocFormSave() {
    if (!locForm.city || !locForm.state || !locForm.airportCode || !locForm.airportName) {
      toast.error("Fill all required fields");
      return;
    }
    if (editingLocation) {
      locUpdateMutation.mutate({ id: editingLocation.id, data: locForm });
    } else {
      locCreateMutation.mutate(locForm);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h5" sx={{ color: "var(--nw-text-primary)", fontWeight: 800 }}>Manage Locations</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            onClick={() => locRefreshCountsMutation.mutate()}
            disabled={locRefreshCountsMutation.isPending}
            variant="outlined"
            sx={{
              color: "var(--nw-text-secondary)",
              borderColor: "var(--nw-border-strong)",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              px: 2.5,
              py: 1,
              "&:hover": { borderColor: "var(--nw-border-strong)", background: "var(--nw-border-soft)" },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {locRefreshCountsMutation.isPending ? "Refreshing..." : "Refresh Counts"}
          </Button>
          <Button
            onClick={() => { setEditingLocation(null); resetLocForm(); setLocPanelOpen(true); }}
            sx={{
              background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-light))",
              color: "var(--nw-text-primary)",
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1,
              "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-primary))" },
            }}
          >
            + Add Location
          </Button>
        </Box>
      </Box>

      {/* Stats Row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2 }}>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5, borderLeft: "4px solid var(--nw-accent-blue)" }}>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</Typography>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800, mt: 0.5 }}>{allLocations.length}</Typography>
        </Paper>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5, borderLeft: "4px solid var(--nw-success-bright)" }}>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Active</Typography>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800, mt: 0.5 }}>{allLocations.filter((l) => l.active).length}</Typography>
        </Paper>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5, borderLeft: "4px solid var(--nw-accent-violet)" }}>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Metro</Typography>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800, mt: 0.5 }}>{allLocations.filter((l) => l.type === "metro").length}</Typography>
        </Paper>
        <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5, borderLeft: "4px solid var(--nw-secondary)" }}>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>On Explore</Typography>
          <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800, mt: 0.5 }}>{allLocations.filter((l) => l.showOnExplore).length}</Typography>
        </Paper>
      </Box>

      {/* Filter Bar */}
      <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" }, gap: 1.5 }}>
          <TextField
            size="small"
            placeholder="Search city, state, code..."
            value={locSearch}
            onChange={(e) => setLocSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "var(--nw-text-primary)",
                fontSize: "0.85rem",
                borderRadius: "10px",
                background: "var(--nw-glass)",
                "& fieldset": { borderColor: "var(--nw-border-strong)" },
                "&:hover fieldset": { borderColor: "var(--nw-border-strong)" },
                "&.Mui-focused fieldset": { borderColor: "var(--nw-primary)" },
              },
              "& .MuiOutlinedInput-input::placeholder": { color: "var(--nw-text-muted)", opacity: 1 },
            }}
          />
          <FormControl size="small">
            <Select
              value={locTypeFilter}
              onChange={(e) => setLocTypeFilter(e.target.value as any)}
              sx={{
                color: "var(--nw-text-primary)",
                fontSize: "0.85rem",
                borderRadius: "10px",
                background: "var(--nw-glass)",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-border-strong)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-border-strong)" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-primary)" },
                "& .MuiSvgIcon-root": { color: "var(--nw-text-muted)" },
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="metro">Metro</MenuItem>
              <MenuItem value="city">City</MenuItem>
              <MenuItem value="town">Town</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <Select
              value={locStatusFilter}
              onChange={(e) => setLocStatusFilter(e.target.value as any)}
              sx={{
                color: "var(--nw-text-primary)",
                fontSize: "0.85rem",
                borderRadius: "10px",
                background: "var(--nw-glass)",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-border-strong)" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-border-strong)" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--nw-primary)" },
                "& .MuiSvgIcon-root": { color: "var(--nw-text-muted)" },
              }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
              <MenuItem value="inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>
          {(locSearch || locTypeFilter !== "all" || locStatusFilter !== "all") && (
            <Button
              onClick={() => { setLocSearch(""); setLocTypeFilter("all"); setLocStatusFilter("all"); }}
              sx={{
                color: "var(--nw-primary)",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                "&:hover": { background: "var(--nw-primary-08)" },
              }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Locations Table */}
      {locationsQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", overflow: "hidden" }}>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", textAlign: "left" as const, fontSize: "0.85rem", borderCollapse: "collapse" as const }}>
                <thead>
                  <tr style={{ background: "var(--nw-glass)", borderBottom: "1px solid var(--nw-border)" }}>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>#</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>City</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>State</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Country</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Code</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Airport</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Type</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", textAlign: "center" as const }}>Flights</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", textAlign: "center" as const }}>Explore</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", textAlign: "center" as const }}>Home</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em", textAlign: "center" as const }}>Active</th>
                    <th style={{ padding: "12px 16px", fontWeight: 600, color: "var(--nw-text-muted)", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLocations.length === 0 ? (
                    <tr>
                      <td colSpan={12} style={{ padding: "48px 24px", textAlign: "center" as const, color: "var(--nw-text-disabled)" }}>
                        No locations found
                      </td>
                    </tr>
                  ) : (
                    paginatedLocations.map((loc, i) => {
                      const typeBadge =
                        loc.type === "metro"
                          ? { background: "rgba(168,85,247,0.15)", color: "var(--nw-accent-violet)" }
                          : loc.type === "city"
                            ? { background: "rgba(59,130,246,0.15)", color: "var(--nw-info)" }
                            : { background: "var(--nw-border)", color: "var(--nw-text-secondary)" };
                      return (
                        <tr key={loc.id} style={{ borderBottom: "1px solid var(--nw-border-soft)" }}>
                          <td style={{ padding: "12px 16px", color: "var(--nw-text-disabled)", fontSize: "0.75rem" }}>
                            {(locPage - 1) * locPageSize + i + 1}
                          </td>
                          <td style={{ padding: "12px 16px", color: "var(--nw-text-primary)", fontWeight: 500 }}>{loc.city}</td>
                          <td style={{ padding: "12px 16px", color: "var(--nw-text-secondary)" }}>{loc.state}</td>
                          <td style={{ padding: "12px 16px", color: "var(--nw-text-secondary)" }}>{loc.country}</td>
                          <td style={{ padding: "12px 16px", fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, color: "var(--nw-text-primary)" }}>{loc.airportCode}</td>
                          <td style={{ padding: "12px 16px", color: "var(--nw-text-secondary)", fontSize: "0.75rem" }}>{loc.airportName}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ ...typeBadge, borderRadius: "9999px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 500 }}>
                              {loc.type}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" as const, color: "var(--nw-text-primary)", fontWeight: 500 }}>
                            {loc.totalFlights ?? 0}
                            {loc.activeFlights != null && loc.activeFlights !== loc.totalFlights && (
                              <span style={{ fontSize: "0.75rem", color: "var(--nw-text-disabled)", marginLeft: "4px" }}>({loc.activeFlights})</span>
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" as const }}>
                            <ToggleSwitch
                              checked={loc.showOnExplore}
                              onChange={() => {
                                locUpdateMutation.mutate({
                                  id: loc.id,
                                  data: { ...loc, showOnExplore: !loc.showOnExplore },
                                });
                              }}
                            />
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" as const }}>
                            <ToggleSwitch
                              checked={loc.showOnHome}
                              onChange={() => {
                                locUpdateMutation.mutate({
                                  id: loc.id,
                                  data: { ...loc, showOnHome: !loc.showOnHome },
                                });
                              }}
                            />
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center" as const }}>
                            <ToggleSwitch
                              checked={loc.active}
                              onChange={() => locToggleMutation.mutate(loc.id)}
                            />
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Button
                                onClick={() => openEditLocation(loc)}
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: "var(--nw-primary)",
                                  borderColor: "var(--nw-primary-30)",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  borderRadius: "8px",
                                  px: 1.5,
                                  py: 0.5,
                                  minWidth: "auto",
                                  "&:hover": { borderColor: "var(--nw-primary)", background: "var(--nw-primary-08)" },
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => {
                                  if (window.confirm(`Delete ${loc.city}?`)) {
                                    locDeleteMutation.mutate(loc.id);
                                  }
                                }}
                                variant="outlined"
                                size="small"
                                sx={{
                                  color: "var(--nw-error)",
                                  borderColor: "var(--nw-error-30)",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "0.75rem",
                                  borderRadius: "8px",
                                  px: 1.5,
                                  py: 0.5,
                                  minWidth: "auto",
                                  "&:hover": { borderColor: "var(--nw-error)", background: "var(--nw-error-08)" },
                                }}
                              >
                                Delete
                              </Button>
                            </Box>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </Box>
          </Paper>

          <Pagination
            currentPage={locPage}
            totalItems={filteredLocations.length}
            itemsPerPage={locPageSize}
            onPageChange={setLocPage}
            onItemsPerPageChange={(size) => setLocPageSize(size)}
          />
        </>
      )}

      {/* ─── Slide-in Add/Edit Panel ─── */}
      <Drawer
        anchor="right"
        open={locPanelOpen}
        onClose={() => { setLocPanelOpen(false); setEditingLocation(null); }}
        PaperProps={{
          sx: {
            width: 420,
            background: "var(--nw-card)",
            borderLeft: "1px solid var(--nw-border)",
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid var(--nw-border)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--nw-card)", zIndex: 10 }}>
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 800, fontSize: "1.1rem" }}>
            {editingLocation ? "Edit Location" : "Add Location"}
          </Typography>
          <IconButton
            onClick={() => { setLocPanelOpen(false); setEditingLocation(null); }}
            sx={{ color: "var(--nw-text-muted)", "&:hover": { color: "var(--nw-text-primary)" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>City *</Typography>
            <input
              value={locForm.city}
              onChange={(e) => setLocForm({ ...locForm, city: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const }}
            />
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>State *</Typography>
            <input
              value={locForm.state}
              onChange={(e) => setLocForm({ ...locForm, state: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const }}
            />
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Country</Typography>
            <input
              value={locForm.country}
              onChange={(e) => setLocForm({ ...locForm, country: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const }}
            />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Airport Code *</Typography>
              <input
                value={locForm.airportCode}
                onChange={(e) => setLocForm({ ...locForm, airportCode: e.target.value.toUpperCase() })}
                maxLength={4}
                style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const, fontFamily: "monospace" }}
              />
            </Box>
            <Box>
              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Type</Typography>
              <select
                value={locForm.type}
                onChange={(e) => setLocForm({ ...locForm, type: e.target.value as any })}
                style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const }}
              >
                <option value="metro">Metro</option>
                <option value="city">City</option>
                <option value="town">Town</option>
              </select>
            </Box>
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Airport Name *</Typography>
            <input
              value={locForm.airportName}
              onChange={(e) => setLocForm({ ...locForm, airportName: e.target.value })}
              style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const }}
            />
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Display Order</Typography>
            <input
              type="text"
              inputMode="numeric"
              value={locForm.displayOrder}
              onChange={(e) => setLocForm({ ...locForm, displayOrder: Number(e.target.value) || 0 })}
              style={{ width: "100%", padding: "10px 14px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none", boxSizing: "border-box" as const }}
            />
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 1 }}>
            <FormControlLabel
              control={
                <MuiCheckbox
                  checked={locForm.active}
                  onChange={(e) => setLocForm({ ...locForm, active: e.target.checked })}
                  sx={{ color: "var(--nw-text-muted)", "&.Mui-checked": { color: "var(--nw-primary)" } }}
                />
              }
              label="Active"
              sx={{ color: "var(--nw-text-secondary)" }}
            />
            <FormControlLabel
              control={
                <MuiCheckbox
                  checked={locForm.showOnExplore}
                  onChange={(e) => setLocForm({ ...locForm, showOnExplore: e.target.checked })}
                  sx={{ color: "var(--nw-text-muted)", "&.Mui-checked": { color: "var(--nw-primary)" } }}
                />
              }
              label="Show on Explore page"
              sx={{ color: "var(--nw-text-secondary)" }}
            />
            <FormControlLabel
              control={
                <MuiCheckbox
                  checked={locForm.showOnHome}
                  onChange={(e) => setLocForm({ ...locForm, showOnHome: e.target.checked })}
                  sx={{ color: "var(--nw-text-muted)", "&.Mui-checked": { color: "var(--nw-primary)" } }}
                />
              }
              label="Show on Home page"
              sx={{ color: "var(--nw-text-secondary)" }}
            />
          </Box>
          <Button
            onClick={handleLocFormSave}
            disabled={locCreateMutation.isPending || locUpdateMutation.isPending}
            sx={{
              width: "100%",
              background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-light))",
              color: "var(--nw-text-primary)",
              fontWeight: 700,
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: "0.9rem",
              mt: 1,
              "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-primary))" },
              "&:disabled": { opacity: 0.5 },
            }}
          >
            {(locCreateMutation.isPending || locUpdateMutation.isPending)
              ? "Saving..."
              : editingLocation
                ? "Update Location"
                : "Create Location"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}

/** Toggle switch used in the Locations table */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      size="small"
      sx={{
        "& .MuiSwitch-switchBase.Mui-checked": { color: "var(--nw-primary)" },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "var(--nw-primary)" },
      }}
    />
  );
}




