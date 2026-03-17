// tabs/HomepageTab.tsx
import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import homeService from "../../../services/homeService";
import destinationService from "../../../services/destinationService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CityCombobox from "../../../components/CityCombobox";
import type { HomeConfig, RouteConfig, DestinationCard } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import MuiCheckbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import MapIcon from "@mui/icons-material/Map";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

export default function HomepageTab() {
  const queryClient = useQueryClient();

  const [hcHeroTitle, setHcHeroTitle] = useState("");
  const [hcHeroSubtitle, setHcHeroSubtitle] = useState("");
  const [hcPopularRoutes, setHcPopularRoutes] = useState<RouteConfig[]>([]);
  const [hcDealRoutes, setHcDealRoutes] = useState<RouteConfig[]>([]);

  const [destPanelOpen, setDestPanelOpen] = useState(false);
  const [editingDestCard, setEditingDestCard] = useState<DestinationCard | null>(null);
  const [destCategoryFilter, setDestCategoryFilter] = useState<string>("all");
  const [destStatusFilter, setDestStatusFilter] = useState<"all" | "active" | "inactive" | "featured">("all");
  const [destForm, setDestForm] = useState({
    title: "",
    destination: "",
    state: "",
    tagline: "",
    description: "",
    imageUrl: "",
    category: "Beach",
    badge: "🔥 Trending",
    displayOrder: 0,
    featured: false,
    active: true,
  });

  const homeConfigQuery = useQuery({
    queryKey: ["homeConfig"],
    queryFn: homeService.getConfig,
    staleTime: 5 * 60 * 1000,
  });

  const destCardsQuery = useQuery({
    queryKey: ["destinationsAdmin"],
    queryFn: destinationService.getAllAdmin,
    staleTime: 5 * 60 * 1000,
  });
  const allDestCards: DestinationCard[] = destCardsQuery.data ?? [];

  useEffect(() => {
    if (homeConfigQuery.data) {
      const c = homeConfigQuery.data;
      setHcHeroTitle(c.heroTitle ?? "");
      setHcHeroSubtitle(c.heroSubtitle ?? "");
      setHcPopularRoutes(c.popularRoutes ?? []);
      setHcDealRoutes(c.dealRoutes ?? []);
    }
  }, [homeConfigQuery.data]);

  const homeConfigMutation = useMutation({
    mutationFn: (config: HomeConfig) => homeService.updateConfig(config),
    onSuccess: () => {
      toast.success("Homepage updated!");
      queryClient.invalidateQueries({ queryKey: ["homeConfig"] });
    },
    onError: () => {
      toast.error("Failed to save changes");
    },
  });

  const filteredDestCards = useMemo(() => {
    let result = allDestCards;
    if (destStatusFilter === "active") result = result.filter((c) => c.active);
    if (destStatusFilter === "inactive") result = result.filter((c) => !c.active);
    if (destStatusFilter === "featured") result = result.filter((c) => c.featured);
    if (destCategoryFilter !== "all") result = result.filter((c) => c.category === destCategoryFilter);
    return result;
  }, [allDestCards, destStatusFilter, destCategoryFilter]);

  const destCreateMutation = useMutation({
    mutationFn: (card: Partial<DestinationCard>) => destinationService.create(card),
    onSuccess: () => {
      toast.success("Destination card created!");
      queryClient.invalidateQueries({ queryKey: ["destinationsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["destinationCards"] });
      setDestPanelOpen(false);
      resetDestForm();
    },
    onError: () => toast.error("Failed to create destination card"),
  });

  const destUpdateMutation = useMutation({
    mutationFn: ({ id, card }: { id: string; card: Partial<DestinationCard> }) =>
      destinationService.update(id, card),
    onSuccess: () => {
      toast.success("Destination card updated!");
      queryClient.invalidateQueries({ queryKey: ["destinationsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["destinationCards"] });
      setDestPanelOpen(false);
      setEditingDestCard(null);
      resetDestForm();
    },
    onError: () => toast.error("Failed to update destination card"),
  });

  const destDeleteMutation = useMutation({
    mutationFn: (id: string) => destinationService.delete(id),
    onSuccess: () => {
      toast.success("Destination card deleted!");
      queryClient.invalidateQueries({ queryKey: ["destinationsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["destinationCards"] });
    },
    onError: () => toast.error("Failed to delete destination card"),
  });

  const destToggleMutation = useMutation({
    mutationFn: (id: string) => destinationService.toggle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinationsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["destinationCards"] });
    },
    onError: () => toast.error("Failed to toggle status"),
  });

  const destFeatureMutation = useMutation({
    mutationFn: (id: string) => destinationService.toggleFeatured(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinationsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["destinationCards"] });
    },
    onError: () => toast.error("Failed to toggle featured status"),
  });

  const destOrderMutation = useMutation({
    mutationFn: ({ id, order }: { id: string; order: number }) =>
      destinationService.updateOrder(id, order),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinationsAdmin"] });
      queryClient.invalidateQueries({ queryKey: ["destinationCards"] });
    },
    onError: () => toast.error("Failed to update order"),
  });

  const resetDestForm = () => {
    setDestForm({
      title: "",
      destination: "",
      state: "",
      tagline: "",
      description: "",
      imageUrl: "",
      category: "Beach",
      badge: "🔥 Trending",
      displayOrder: 0,
      featured: false,
      active: true,
    });
    setEditingDestCard(null);
  };

  const handleEditDestCard = (card: DestinationCard) => {
    setEditingDestCard(card);
    setDestForm({
      title: card.title,
      destination: card.destination,
      state: card.state,
      tagline: card.tagline,
      description: card.description,
      imageUrl: card.imageUrl,
      category: card.category,
      badge: card.badge,
      displayOrder: card.displayOrder,
      featured: card.featured,
      active: card.active,
    });
    setDestPanelOpen(true);
  };

  const handleSubmitDestCard = () => {
    if (!destForm.title || !destForm.destination || !destForm.state || !destForm.tagline || !destForm.description || !destForm.imageUrl) {
      toast.error("Please fill all required fields");
      return;
    }
    if (editingDestCard) {
      destUpdateMutation.mutate({ id: editingDestCard.id, card: destForm });
    } else {
      destCreateMutation.mutate(destForm);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 800, fontSize: "1.5rem" }}>Homepage Settings</Typography>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem", mt: 0.5 }}>Control what users see on the public homepage</Typography>
        </Box>
      </Box>

      {/* Destination Card Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
        {[
          { label: "Total Cards", value: allDestCards.length, icon: <MapIcon sx={{ fontSize: 18, color: "var(--nw-accent-blue)" }} />, accent: "var(--nw-accent-blue)" },
          { label: "Active Cards", value: allDestCards.filter((c) => c.active).length, icon: <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "var(--nw-success-bright)" }} />, accent: "var(--nw-success-bright)" },
          { label: "Featured Cards", value: allDestCards.filter((c) => c.featured).length, icon: <StarOutlineIcon sx={{ fontSize: 18, color: "var(--nw-secondary)" }} />, accent: "var(--nw-secondary)" },
          { label: "Categories", value: new Set(allDestCards.map((c) => c.category)).size, icon: <FolderOpenIcon sx={{ fontSize: 18, color: "var(--nw-accent-violet)" }} />, accent: "var(--nw-accent-violet)" },
        ].map((card) => (
          <Paper key={card.label} elevation={0} sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", background: `${card.accent}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{card.icon}</Box>
              <Box sx={{ height: 3, width: "35%", borderRadius: 2, background: card.accent, opacity: 0.5 }} />
            </Box>
            <Typography sx={{ color: "var(--nw-text-primary)", fontSize: "1.5rem", fontWeight: 800 }}>{card.value}</Typography>
            <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", mt: 0.3 }}>{card.label}</Typography>
          </Paper>
        ))}
      </Box>

      {homeConfigQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* ── Hero Section Editor ── */}
          <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: "var(--nw-primary-12)", display: "flex", alignItems: "center", justifyContent: "center" }}><HomeOutlinedIcon sx={{ fontSize: 20, color: "var(--nw-primary)" }} /></Box>
                <Box>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 800, fontSize: "1.1rem" }}>Hero Section</Typography>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.72rem" }}>The big banner users see first when visiting</Typography>
                </Box>
              </Box>
              <Divider sx={{ borderColor: "var(--nw-border)" }} />
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <Box>
                  <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Hero Title</Typography>
                  <input
                    type="text"
                    value={hcHeroTitle}
                    onChange={(e) => setHcHeroTitle(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
                    placeholder="Where do you want to fly?"
                  />
                </Box>
                <Box>
                  <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>Hero Subtitle</Typography>
                  <input
                    type="text"
                    value={hcHeroSubtitle}
                    onChange={(e) => setHcHeroSubtitle(e.target.value)}
                    style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
                    placeholder="Search and book flights at the best prices"
                  />
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                disabled={homeConfigMutation.isPending}
                onClick={() => {
                  homeConfigMutation.mutate({
                    id: homeConfigQuery.data?.id,
                    heroTitle: hcHeroTitle,
                    heroSubtitle: hcHeroSubtitle,
                    popularRoutes: hcPopularRoutes,
                    dealRoutes: hcDealRoutes,
                  });
                }}
                sx={{
                  background: "linear-gradient(135deg, var(--nw-primary), var(--nw-secondary))",
                  color: "var(--nw-text-primary)",
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  borderRadius: "12px",
                  textTransform: "none",
                  "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-secondary))" },
                  "&:disabled": { opacity: 0.5 },
                }}
              >
                {homeConfigMutation.isPending ? "Saving..." : "Save Hero"}
              </Button>
              </Box>
            </Box>
          </Paper>

          {/* ── Destination Cards Manager ── */}
          <Paper sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", p: 3 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: "var(--nw-primary-12)", display: "flex", alignItems: "center", justifyContent: "center" }}><MapIcon sx={{ fontSize: 20, color: "var(--nw-primary)" }} /></Box>
                <Box>
                  <Typography sx={{ color: "var(--nw-text-primary)", fontWeight: 800, fontSize: "1.1rem" }}>Destination Cards</Typography>
                  <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.72rem" }}>Cards displayed on the homepage explore section</Typography>
                </Box>
              </Box>
              <Button
                onClick={() => {
                  resetDestForm();
                  setDestPanelOpen(true);
                }}
                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                sx={{
                  background: "linear-gradient(135deg, var(--nw-primary), var(--nw-secondary))",
                  color: "var(--nw-text-primary)",
                  fontWeight: 700,
                  px: 2.5,
                  py: 1,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-secondary))" },
                }}
              >
                Add New Card
              </Button>
            </Box>
            <Divider sx={{ borderColor: "var(--nw-border)" }} />

            {/* Filters */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <select
                value={destStatusFilter}
                onChange={(e) => setDestStatusFilter(e.target.value as any)}
                style={{ padding: "8px 12px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="all" style={{ background: "var(--nw-card)" }}>All Status</option>
                <option value="active" style={{ background: "var(--nw-card)" }}>Active Only</option>
                <option value="inactive" style={{ background: "var(--nw-card)" }}>Inactive Only</option>
                <option value="featured" style={{ background: "var(--nw-card)" }}>Featured Only</option>
              </select>
              <select
                value={destCategoryFilter}
                onChange={(e) => setDestCategoryFilter(e.target.value)}
                style={{ padding: "8px 12px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="all" style={{ background: "var(--nw-card)" }}>All Categories</option>
                <option value="Beach" style={{ background: "var(--nw-card)" }}>Beach</option>
                <option value="Hills" style={{ background: "var(--nw-card)" }}>Hills</option>
                <option value="Heritage" style={{ background: "var(--nw-card)" }}>Heritage</option>
                <option value="Honeymoon" style={{ background: "var(--nw-card)" }}>Honeymoon</option>
                <option value="Adventure" style={{ background: "var(--nw-card)" }}>Adventure</option>
                <option value="Spiritual" style={{ background: "var(--nw-card)" }}>Spiritual</option>
                <option value="Wildlife" style={{ background: "var(--nw-card)" }}>Wildlife</option>
                <option value="City Break" style={{ background: "var(--nw-card)" }}>City Break</option>
                <option value="Weekend Getaway" style={{ background: "var(--nw-card)" }}>Weekend Getaway</option>
              </select>
            </Box>

            {/* Cards Grid */}
            {destCardsQuery.isLoading ? (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Box key={i} sx={{ background: "var(--nw-border-soft)", borderRadius: "16px", height: 256, animation: "pulse 2s ease-in-out infinite", "@keyframes pulse": { "0%, 100%": { opacity: 0.4 }, "50%": { opacity: 0.8 } } }} />
                ))}
              </Box>
            ) : filteredDestCards.length === 0 ? (
              <Typography sx={{ color: "var(--nw-text-muted)", textAlign: "center", py: 4 }}>No destination cards found.</Typography>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 2 }}>
                {filteredDestCards.map((card) => (
                  <Paper
                    key={card.id}
                    sx={{ background: "var(--nw-card)", border: "1px solid var(--nw-border)", borderRadius: "16px", overflow: "hidden", transition: "border-color 0.2s", "&:hover": { borderColor: "var(--nw-border-strong)" } }}
                  >
                    {/* Image */}
                    <Box sx={{ position: "relative", height: 128 }}>
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
                        }}
                      />
                      <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
                        {card.featured && (
                          <Chip size="small" label="Featured" sx={{ fontWeight: 700, fontSize: "0.65rem", backgroundColor: "var(--nw-warning-20)", color: "var(--nw-secondary)", border: "1px solid rgba(245,158,11,0.4)" }} />
                        )}
                        {card.active ? (
                          <Chip size="small" label="Active" sx={{ fontWeight: 700, fontSize: "0.65rem", backgroundColor: "var(--nw-success-20)", color: "var(--nw-success-bright)", border: "1px solid rgba(34,197,94,0.4)" }} />
                        ) : (
                          <Chip size="small" label="Inactive" sx={{ fontWeight: 700, fontSize: "0.65rem", backgroundColor: "rgba(107,114,128,0.2)", color: "var(--nw-text-muted)", border: "1px solid rgba(107,114,128,0.4)" }} />
                        )}
                      </Box>
                    </Box>

                    {/* Content */}
                    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, color: "var(--nw-text-primary)", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {card.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip size="small" label={card.category} sx={{ fontSize: "0.65rem", fontWeight: 600, backgroundColor: "rgba(59,130,246,0.15)", color: "var(--nw-info)", border: "1px solid rgba(59,130,246,0.3)" }} />
                        <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem" }}>{card.badge}</Typography>
                      </Box>
                      <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem" }}>{card.state}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.75rem" }}>Order:</Typography>
                        <input
                          type="number"
                          value={card.displayOrder}
                          onChange={(e) => {
                            const order = parseInt(e.target.value);
                            if (!isNaN(order)) {
                              destOrderMutation.mutate({ id: card.id, order });
                            }
                          }}
                          style={{ width: 60, padding: "4px 8px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "6px", color: "var(--nw-text-primary)", fontSize: "0.75rem", textAlign: "center" as const, outline: "none" }}
                        />
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, pt: 1 }}>
                        <Button
                          size="small"
                          onClick={() => destFeatureMutation.mutate(card.id)}
                          sx={{
                            textTransform: "none", fontSize: "0.7rem", fontWeight: 600, borderRadius: "8px", py: 0.6,
                            color: card.featured ? "var(--nw-secondary)" : "var(--nw-text-muted)",
                            border: card.featured ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(107,114,128,0.3)",
                            "&:hover": { backgroundColor: card.featured ? "var(--nw-warning-10)" : "rgba(107,114,128,0.1)" },
                          }}
                        >
                          Feature
                        </Button>
                        <Button
                          size="small"
                          onClick={() => destToggleMutation.mutate(card.id)}
                          sx={{
                            textTransform: "none", fontSize: "0.7rem", fontWeight: 600, borderRadius: "8px", py: 0.6,
                            color: card.active ? "var(--nw-success-bright)" : "var(--nw-text-muted)",
                            border: card.active ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(107,114,128,0.3)",
                            "&:hover": { backgroundColor: card.active ? "var(--nw-success-10)" : "rgba(107,114,128,0.1)" },
                          }}
                        >
                          Toggle
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleEditDestCard(card)}
                          sx={{
                            textTransform: "none", fontSize: "0.7rem", fontWeight: 600, borderRadius: "8px", py: 0.6,
                            color: "var(--nw-info)",
                            border: "1px solid rgba(59,130,246,0.4)",
                            "&:hover": { backgroundColor: "rgba(59,130,246,0.1)" },
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            if (window.confirm(`Delete "${card.title}"?`)) {
                              destDeleteMutation.mutate(card.id);
                            }
                          }}
                          sx={{
                            textTransform: "none", fontSize: "0.7rem", fontWeight: 600, borderRadius: "8px", py: 0.6,
                            color: "var(--nw-error)",
                            border: "1px solid rgba(239,68,68,0.4)",
                            "&:hover": { backgroundColor: "var(--nw-error-10)" },
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
            </Box>
          </Paper>
        </>
      )}

      {/* ─── Destination Card Add/Edit Panel ─── */}
      <Drawer
        anchor="right"
        open={destPanelOpen}
        onClose={() => {
          setDestPanelOpen(false);
          setEditingDestCard(null);
          resetDestForm();
        }}
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
            {editingDestCard ? "Edit Destination Card" : "Add Destination Card"}
          </Typography>
          <IconButton
            onClick={() => {
              setDestPanelOpen(false);
              setEditingDestCard(null);
              resetDestForm();
            }}
            sx={{ color: "var(--nw-text-muted)", "&:hover": { color: "var(--nw-text-primary)" } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5, overflowY: "auto" }}>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              Title *
            </Typography>
            <input
              value={destForm.title}
              onChange={(e) =>
                setDestForm({ ...destForm, title: e.target.value })
              }
              style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
              placeholder="Goa — Beach Paradise"
            />
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              Destination City *
            </Typography>
            <CityCombobox
              value={destForm.destination}
              onChange={(val) =>
                setDestForm({ ...destForm, destination: val })
              }
              placeholder="Select destination city"
              label=""
            />
            <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", mt: 0.5 }}>
              City name that links to flight search
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              State *
            </Typography>
            <input
              value={destForm.state}
              onChange={(e) =>
                setDestForm({ ...destForm, state: e.target.value })
              }
              style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
              placeholder="Goa"
            />
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              Tagline *
            </Typography>
            <input
              value={destForm.tagline}
              onChange={(e) =>
                setDestForm({ ...destForm, tagline: e.target.value })
              }
              style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
              placeholder="Sun, sand & sea awaits"
            />
            <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", mt: 0.5 }}>Short catchy line</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              Description *
            </Typography>
            <textarea
              value={destForm.description}
              onChange={(e) =>
                setDestForm({ ...destForm, description: e.target.value })
              }
              rows={3}
              style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const, resize: "vertical" }}
              placeholder="2-3 sentences about the destination..."
            />
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              Image URL *
            </Typography>
            <input
              value={destForm.imageUrl}
              onChange={(e) =>
                setDestForm({ ...destForm, imageUrl: e.target.value })
              }
              style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
              placeholder="https://images.unsplash.com/..."
            />
            <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", mt: 0.5 }}>
              Use Unsplash: https://images.unsplash.com/photo-ID?w=800&q=80
            </Typography>
            {destForm.imageUrl && (
              <img
                src={destForm.imageUrl}
                alt="Preview"
                style={{ borderRadius: "12px", height: 128, width: "100%", objectFit: "cover", marginTop: 8, border: "1px solid var(--nw-border-strong)" }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <Box>
              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
                Category *
              </Typography>
              <select
                value={destForm.category}
                onChange={(e) =>
                  setDestForm({ ...destForm, category: e.target.value })
                }
                style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none" }}
              >
                <option value="Beach" style={{ background: "var(--nw-card)" }}>Beach</option>
                <option value="Hills" style={{ background: "var(--nw-card)" }}>Hills</option>
                <option value="Heritage" style={{ background: "var(--nw-card)" }}>Heritage</option>
                <option value="Honeymoon" style={{ background: "var(--nw-card)" }}>Honeymoon</option>
                <option value="Adventure" style={{ background: "var(--nw-card)" }}>Adventure</option>
                <option value="Spiritual" style={{ background: "var(--nw-card)" }}>Spiritual</option>
                <option value="Wildlife" style={{ background: "var(--nw-card)" }}>Wildlife</option>
                <option value="City Break" style={{ background: "var(--nw-card)" }}>City Break</option>
                <option value="Weekend Getaway" style={{ background: "var(--nw-card)" }}>Weekend Getaway</option>
              </select>
            </Box>
            <Box>
              <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
                Display Order
              </Typography>
              <input
                type="number"
                value={destForm.displayOrder}
                onChange={(e) =>
                  setDestForm({
                    ...destForm,
                    displayOrder: parseInt(e.target.value) || 0,
                  })
                }
                style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
              />
            </Box>
          </Box>
          <Box>
            <Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}>
              Badge *
            </Typography>
            <input
              value={destForm.badge}
              onChange={(e) =>
                setDestForm({ ...destForm, badge: e.target.value })
              }
              style={{ width: "100%", padding: "12px 16px", background: "var(--nw-glass)", border: "1px solid var(--nw-border-strong)", borderRadius: "10px", color: "var(--nw-text-primary)", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" as const }}
              placeholder="🔥 Trending"
            />
            <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.7rem", mt: 0.5 }}>
              Examples: 🔥 Trending, 💕 Honeymoon Special, 🏔 Adventure
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
            <FormControlLabel
              control={
                <MuiCheckbox
                  checked={destForm.featured}
                  onChange={(e) =>
                    setDestForm({ ...destForm, featured: e.target.checked })
                  }
                  sx={{ color: "var(--nw-text-muted)", "&.Mui-checked": { color: "var(--nw-secondary)" } }}
                />
              }
              label={<Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>Featured (larger card on homepage)</Typography>}
            />
            <FormControlLabel
              control={
                <MuiCheckbox
                  checked={destForm.active}
                  onChange={(e) =>
                    setDestForm({ ...destForm, active: e.target.checked })
                  }
                  sx={{ color: "var(--nw-text-muted)", "&.Mui-checked": { color: "var(--nw-success-bright)" } }}
                />
              }
              label={<Typography sx={{ color: "var(--nw-text-secondary)", fontSize: "0.85rem", fontWeight: 500 }}>Active (visible on homepage)</Typography>}
            />
          </Box>
          <Button
            onClick={handleSubmitDestCard}
            disabled={
              destCreateMutation.isPending || destUpdateMutation.isPending
            }
            sx={{
              width: "100%",
              background: "linear-gradient(135deg, var(--nw-primary), var(--nw-secondary))",
              color: "var(--nw-text-primary)",
              fontWeight: 700,
              py: 1.5,
              borderRadius: "12px",
              textTransform: "none",
              mt: 2,
              "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-secondary))" },
              "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
            }}
          >
            {destCreateMutation.isPending || destUpdateMutation.isPending
              ? "Saving..."
              : editingDestCard
              ? "Update Card"
              : "Create Card"}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
}




