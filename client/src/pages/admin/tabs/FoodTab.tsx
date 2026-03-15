// tabs/FoodTab.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import foodService from "../../../services/foodService";
import type { FoodCategory, FoodItem } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

type FoodSubTab = "categories" | "items";

const FOOD_AIRLINES = ["IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"];
const FOOD_CABINS = ["Economy", "Business", "First Class"];
const FOOD_ALLERGENS = ["Gluten", "Dairy", "Nuts", "Eggs", "Soy", "Fish"];
const FOOD_MEAL_TIMINGS = ["Breakfast", "Lunch", "Dinner", "Anytime"];

/** Stat card component */
function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: string }) {
  return (
    <Paper sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "1.1rem" }}>
            {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          </Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.7rem" }}>{label}</Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function FoodTab() {
  const queryClient = useQueryClient();

  const [foodSubTab, setFoodSubTab] = useState<FoodSubTab>("categories");
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FoodCategory | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [selectedFoodItemIds, setSelectedFoodItemIds] = useState<string[]>([]);
  const [foodCategoryFilter, setFoodCategoryFilter] = useState("all");
  const [foodDietFilter, setFoodDietFilter] = useState("all");
  const [foodAirlineFilter, setFoodAirlineFilter] = useState("all");
  const [foodSearch, setFoodSearch] = useState("");

  const [categoryForm, setCategoryForm] = useState<Partial<FoodCategory>>({
    name: "",
    icon: "🍱",
    description: "",
    active: true,
    displayOrder: 1,
    airlineNames: [],
    cabinClasses: [],
  });

  const [itemForm, setItemForm] = useState<Partial<FoodItem>>({
    categoryId: "",
    categoryName: "",
    name: "",
    description: "",
    imageUrl: "",
    dietType: "VEG",
    economyPrice: 0,
    businessPrice: 0,
    firstClassPrice: 0,
    calories: 0,
    weight: "",
    allergens: [],
    airlineNames: [],
    cabinClasses: [],
    mealTiming: ["Anytime"],
    popular: false,
    newItem: false,
    available: true,
    displayOrder: 1,
  });

  const foodCategoriesQuery = useQuery({
    queryKey: ["foodCategories"],
    queryFn: foodService.getAllCategories,
    staleTime: 60 * 1000,
  });

  const foodItemsQuery = useQuery({
    queryKey: ["foodItems"],
    queryFn: foodService.getAllItems,
    staleTime: 60 * 1000,
  });

  const foodCategories = foodCategoriesQuery.data ?? [];
  const foodItems = foodItemsQuery.data ?? [];

  const filteredFoodItems = useMemo(() => {
    let result = foodItems;
    if (foodCategoryFilter !== "all") {
      result = result.filter((item) => item.categoryId === foodCategoryFilter);
    }
    if (foodDietFilter !== "all") {
      result = result.filter((item) => item.dietType === foodDietFilter);
    }
    if (foodAirlineFilter !== "all") {
      result = result.filter((item) =>
        item.airlineNames.length === 0 || item.airlineNames.includes(foodAirlineFilter)
      );
    }
    if (foodSearch) {
      const q = foodSearch.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.categoryName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [foodItems, foodCategoryFilter, foodDietFilter, foodAirlineFilter, foodSearch]);

  const foodStats = useMemo(() => {
    const total = foodItems.length;
    const available = foodItems.filter((item) => item.available).length;
    const veg = foodItems.filter((item) => item.dietType === "VEG" || item.dietType === "VEGAN" || item.dietType === "JAIN").length;
    const nonVeg = foodItems.filter((item) => item.dietType === "NON_VEG").length;
    const avgEconomy =
      total === 0 ? 0 : Math.round(foodItems.reduce((sum, item) => sum + item.economyPrice, 0) / total);
    return { total, available, veg, nonVeg, avgEconomy };
  }, [foodItems]);

  const createCategoryMutation = useMutation({
    mutationFn: (payload: Partial<FoodCategory>) => foodService.createCategory(payload),
    onSuccess: () => {
      toast.success("Food category created");
      queryClient.invalidateQueries({ queryKey: ["foodCategories"] });
      setCategoryFormOpen(false);
      setEditingCategory(null);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FoodCategory> }) =>
      foodService.updateCategory(id, payload),
    onSuccess: () => {
      toast.success("Food category updated");
      queryClient.invalidateQueries({ queryKey: ["foodCategories"] });
      setCategoryFormOpen(false);
      setEditingCategory(null);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => foodService.deleteCategory(id),
    onSuccess: () => {
      toast.success("Food category deleted");
      queryClient.invalidateQueries({ queryKey: ["foodCategories"] });
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const createItemMutation = useMutation({
    mutationFn: (payload: Partial<FoodItem>) => foodService.createItem(payload),
    onSuccess: () => {
      toast.success("Food item created");
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
      setItemFormOpen(false);
      setEditingItem(null);
    },
    onError: () => toast.error("Failed to create food item"),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FoodItem> }) =>
      foodService.updateItem(id, payload),
    onSuccess: () => {
      toast.success("Food item updated");
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
      setItemFormOpen(false);
      setEditingItem(null);
    },
    onError: () => toast.error("Failed to update food item"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => foodService.deleteItem(id),
    onSuccess: () => {
      toast.success("Food item deleted");
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
    onError: () => toast.error("Failed to delete food item"),
  });

  const toggleItemMutation = useMutation({
    mutationFn: (id: string) => foodService.toggleItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foodItems"] });
    },
    onError: () => toast.error("Failed to toggle availability"),
  });

  const resetCategoryForm = () => {
    setCategoryForm({
      name: "",
      icon: "🍱",
      description: "",
      active: true,
      displayOrder: 1,
      airlineNames: [],
      cabinClasses: [],
    });
    setEditingCategory(null);
  };

  const resetItemForm = () => {
    setItemForm({
      categoryId: foodCategories[0]?.id || "",
      categoryName: foodCategories[0]?.name || "",
      name: "",
      description: "",
      imageUrl: "",
      dietType: "VEG",
      economyPrice: 0,
      businessPrice: 0,
      firstClassPrice: 0,
      calories: 0,
      weight: "",
      allergens: [],
      airlineNames: [],
      cabinClasses: [],
      mealTiming: ["Anytime"],
      popular: false,
      newItem: false,
      available: true,
      displayOrder: 1,
    });
    setEditingItem(null);
  };

  const submitCategory = () => {
    if (!categoryForm.name || !categoryForm.icon) {
      toast.error("Category name and icon are required");
      return;
    }
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, payload: categoryForm });
      return;
    }
    createCategoryMutation.mutate(categoryForm);
  };

  const submitItem = () => {
    if (!itemForm.name || !itemForm.categoryId || !itemForm.description) {
      toast.error("Category, name and description are required");
      return;
    }
    const category = foodCategories.find((cat) => cat.id === itemForm.categoryId);
    const payload = { ...itemForm, categoryName: category?.name || itemForm.categoryName || "" };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, payload });
      return;
    }
    createItemMutation.mutate(payload);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.5rem" }}>Food Menu Management</Typography>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", mt: 0.5 }}>Manage in-flight meals by categories and menu items</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={() => { setFoodSubTab("categories"); resetCategoryForm(); setCategoryFormOpen(true); }}
            startIcon={<AddIcon />}
            sx={{ background: "rgba(14,165,233,0.12)", color: "#0EA5E9", borderRadius: "10px", px: 2, py: 1, fontWeight: 700, fontSize: "0.85rem", textTransform: "none", border: "1px solid rgba(14,165,233,0.25)", "&:hover": { background: "rgba(14,165,233,0.2)" } }}
          >
            Add Category
          </Button>
          <Button
            onClick={() => { setFoodSubTab("items"); resetItemForm(); setItemFormOpen(true); }}
            startIcon={<AddIcon />}
            sx={{ background: "rgba(34,197,94,0.12)", color: "#22C55E", borderRadius: "10px", px: 2, py: 1, fontWeight: 700, fontSize: "0.85rem", textTransform: "none", border: "1px solid rgba(34,197,94,0.25)", "&:hover": { background: "rgba(34,197,94,0.2)" } }}
          >
            Add Item
          </Button>
        </Box>
      </Box>

      {/* Stats */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", lg: "repeat(5, 1fr)" }, gap: 2.5 }}>
        <StatCard label="Total Items" value={foodStats.total} color="#0EA5E9" icon="🍽" />
        <StatCard label="Available" value={foodStats.available} color="#22C55E" icon="✅" />
        <StatCard label="Veg Items" value={foodStats.veg} color="#10B981" icon="🥗" />
        <StatCard label="Non-Veg" value={foodStats.nonVeg} color="#EF4444" icon="🍗" />
        <StatCard label="Avg Economy" value={`₹${foodStats.avgEconomy}`} color="#6366F1" icon="💸" />
      </Box>

      {/* Sub-tab toggle */}
      <Box sx={{ display: "flex", gap: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", p: 0.6, alignSelf: "flex-start" }}>
        <Button onClick={() => setFoodSubTab("categories")} startIcon={<FolderOpenIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: "none", borderRadius: "10px", px: 2.5, py: 0.8, fontSize: "0.85rem", fontWeight: 700, color: foodSubTab === "categories" ? "#FFFFFF" : "#6B7280", background: foodSubTab === "categories" ? "#0EA5E9" : "transparent", "&:hover": { background: foodSubTab === "categories" ? "#0EA5E9" : "rgba(255,255,255,0.06)" } }}>Categories</Button>
        <Button onClick={() => setFoodSubTab("items")} startIcon={<RestaurantMenuIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: "none", borderRadius: "10px", px: 2.5, py: 0.8, fontSize: "0.85rem", fontWeight: 700, color: foodSubTab === "items" ? "#FFFFFF" : "#6B7280", background: foodSubTab === "items" ? "#0EA5E9" : "transparent", "&:hover": { background: foodSubTab === "items" ? "#0EA5E9" : "rgba(255,255,255,0.06)" } }}>Menu Items</Button>
      </Box>

      {/* Categories sub-tab */}
      {foodSubTab === "categories" && (
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Icon", "Name", "Airlines", "Cabin Classes", "Items", "Active", "Actions"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: "#6B7280", fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {foodCategories.map((category) => {
                  const count = foodItems.filter((item) => item.categoryId === category.id).length;
                  return (
                    <tr key={category.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "12px 16px", fontSize: "1.5rem" }}>{category.icon}</td>
                      <td style={{ padding: "12px 16px", color: "#FFFFFF", fontWeight: 600, fontSize: "0.85rem" }}>{category.name}</td>
                      <td style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: "0.8rem" }}>{category.airlineNames.length ? category.airlineNames.join(", ") : "All"}</td>
                      <td style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: "0.8rem" }}>{category.cabinClasses.length ? category.cabinClasses.join(", ") : "All"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <Box sx={{ display: "inline-flex", alignItems: "center", background: "rgba(14,165,233,0.12)", color: "#0EA5E9", borderRadius: "8px", px: 1.5, py: 0.3, fontSize: "0.78rem", fontWeight: 700 }}>{count}</Box>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        {category.active
                          ? <Chip size="small" label="Active" sx={{ fontSize: "0.65rem", fontWeight: 700, backgroundColor: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }} />
                          : <Chip size="small" label="Inactive" sx={{ fontSize: "0.65rem", fontWeight: 700, backgroundColor: "rgba(107,114,128,0.12)", color: "#6B7280", border: "1px solid rgba(107,114,128,0.3)" }} />}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button size="small" onClick={() => { setEditingCategory(category); setCategoryForm(category); setCategoryFormOpen(true); }} sx={{ fontSize: "0.72rem", textTransform: "none", fontWeight: 600, borderRadius: "8px", color: "#60A5FA", border: "1px solid rgba(96,165,250,0.3)", "&:hover": { background: "rgba(96,165,250,0.1)" } }}>Edit</Button>
                          <Button size="small" onClick={() => { if (window.confirm(`Delete category ${category.name}?`)) deleteCategoryMutation.mutate(category.id); }} sx={{ fontSize: "0.72rem", textTransform: "none", fontWeight: 600, borderRadius: "8px", color: "#F87171", border: "1px solid rgba(248,113,113,0.3)", "&:hover": { background: "rgba(248,113,113,0.1)" } }}>Delete</Button>
                        </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
        </Paper>
      )}

      {/* Items sub-tab */}
      {foodSubTab === "items" && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Filter bar */}
          <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", p: 2.5, display: "flex", flexWrap: "wrap", gap: 2 }}>
            <select value={foodCategoryFilter} onChange={(e) => setFoodCategoryFilter(e.target.value)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.85rem", outline: "none" }}>
              <option value="all" style={{ background: "#111" }}>All Categories</option>
              {foodCategories.map((cat) => <option key={cat.id} value={cat.id} style={{ background: "#111" }}>{cat.name}</option>)}
            </select>
            <select value={foodDietFilter} onChange={(e) => setFoodDietFilter(e.target.value)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.85rem", outline: "none" }}>
              <option value="all" style={{ background: "#111" }}>All Diet Types</option>
              <option value="VEG" style={{ background: "#111" }}>VEG</option>
              <option value="NON_VEG" style={{ background: "#111" }}>NON_VEG</option>
              <option value="VEGAN" style={{ background: "#111" }}>VEGAN</option>
              <option value="JAIN" style={{ background: "#111" }}>JAIN</option>
            </select>
            <select value={foodAirlineFilter} onChange={(e) => setFoodAirlineFilter(e.target.value)} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.85rem", outline: "none" }}>
              <option value="all" style={{ background: "#111" }}>All Airlines</option>
              {FOOD_AIRLINES.map((a) => <option key={a} value={a} style={{ background: "#111" }}>{a}</option>)}
            </select>
            <input value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} placeholder="Search items..." style={{ padding: "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.85rem", outline: "none", minWidth: 220, flex: 1 }} />
          </Paper>

          {/* Bulk actions */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            <Button onClick={() => { selectedFoodItemIds.forEach((id) => { const target = foodItems.find((item) => item.id === id); if (target && !target.available) toggleItemMutation.mutate(id); }); }} sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600, borderRadius: "8px", px: 2, py: 0.8, color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)", "&:hover": { background: "rgba(34,197,94,0.1)" } }}>Enable All Selected</Button>
            <Button onClick={() => { selectedFoodItemIds.forEach((id) => { const target = foodItems.find((item) => item.id === id); if (target && target.available) toggleItemMutation.mutate(id); }); }} sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600, borderRadius: "8px", px: 2, py: 0.8, color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)", "&:hover": { background: "rgba(245,158,11,0.1)" } }}>Disable All Selected</Button>
          </Box>

          {/* Item cards grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2.5 }}>
            {filteredFoodItems.map((item) => (
              <Paper key={item.id} elevation={0} sx={{ background: "#111111", border: selectedFoodItemIds.includes(item.id) ? "1px solid rgba(249,115,22,0.4)" : "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden", transition: "border-color 0.2s", "&:hover": { borderColor: "rgba(255,255,255,0.12)" } }}>
                <Box sx={{ position: "relative" }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: 120, objectFit: "cover" }} onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80"; }} />
                  <Box sx={{ position: "absolute", top: 8, left: 8 }}>
                    <input type="checkbox" checked={selectedFoodItemIds.includes(item.id)} onChange={(e) => setSelectedFoodItemIds((prev) => e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id))} style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#F97316" }} />
                  </Box>
                  <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "flex-end" }}>
                    <Chip size="small" label={item.dietType} sx={{ fontSize: "0.6rem", fontWeight: 700, backgroundColor: item.dietType === "NON_VEG" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)", color: item.dietType === "NON_VEG" ? "#F87171" : "#4ADE80", border: "none" }} />
                    {item.popular && <Chip size="small" label="Popular" sx={{ fontSize: "0.6rem", fontWeight: 700, backgroundColor: "rgba(245,158,11,0.2)", color: "#FBBF24", border: "none" }} />}
                    {item.newItem && <Chip size="small" label="New" sx={{ fontSize: "0.6rem", fontWeight: 700, backgroundColor: "rgba(20,184,166,0.2)", color: "#2DD4BF", border: "none" }} />}
                  </Box>
                </Box>
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, color: "#FFFFFF", fontSize: "0.88rem" }}>{item.name}</Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.72rem" }}>{item.categoryName}</Typography>
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.72rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{item.description}</Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                    <Box>
                      <Typography sx={{ color: "#6B7280", fontSize: "0.65rem" }}>Economy</Typography>
                      <Typography sx={{ color: "#F97316", fontWeight: 700, fontSize: "0.78rem" }}>₹{item.economyPrice}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#6B7280", fontSize: "0.65rem" }}>Business</Typography>
                      <Typography sx={{ color: "#A78BFA", fontWeight: 700, fontSize: "0.78rem" }}>{item.businessPrice === 0 ? "FREE" : `₹${item.businessPrice}`}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#6B7280", fontSize: "0.65rem" }}>Calories</Typography>
                      <Typography sx={{ color: "#9CA3AF", fontWeight: 600, fontSize: "0.78rem" }}>{item.calories} kcal</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, pt: 0.5 }}>
                    <Button size="small" onClick={() => toggleItemMutation.mutate(item.id)} sx={{ flex: 1, textTransform: "none", fontSize: "0.7rem", fontWeight: 700, borderRadius: "8px", py: 0.5, color: item.available ? "#22C55E" : "#6B7280", border: item.available ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(107,114,128,0.3)", "&:hover": { background: item.available ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)" } }}>{item.available ? "Available" : "Unavailable"}</Button>
                    <Button size="small" onClick={() => { setEditingItem(item); setItemForm(item); setItemFormOpen(true); }} sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 700, borderRadius: "8px", py: 0.5, px: 1.5, color: "#60A5FA", border: "1px solid rgba(96,165,250,0.3)", "&:hover": { background: "rgba(96,165,250,0.1)" } }}>Edit</Button>
                    <Button size="small" onClick={() => { if (window.confirm(`Delete ${item.name}?`)) deleteItemMutation.mutate(item.id); }} sx={{ textTransform: "none", fontSize: "0.7rem", fontWeight: 700, borderRadius: "8px", py: 0.5, px: 1.5, color: "#F87171", border: "1px solid rgba(248,113,113,0.3)", "&:hover": { background: "rgba(248,113,113,0.1)" } }}>Delete</Button>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Category Form Modal */}
      {categoryFormOpen && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Paper sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", width: "100%", maxWidth: 500, p: 3.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.1rem" }}>{editingCategory ? "Edit Category" : "Add Category"}</Typography>
              <IconButton onClick={() => { setCategoryFormOpen(false); resetCategoryForm(); }} sx={{ color: "#6B7280", "&:hover": { color: "#FFFFFF" } }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
            </Box>
            {[
              { label: "Name", key: "name", placeholder: "Category name" },
              { label: "Icon (emoji)", key: "icon", placeholder: "🍱" },
              { label: "Description", key: "description", placeholder: "Brief description" },
            ].map((field) => (
              <Box key={field.key}>
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>{field.label}</Typography>
                <input value={(categoryForm as any)[field.key] || ""} onChange={(e) => setCategoryForm({ ...categoryForm, [field.key]: e.target.value })} placeholder={field.placeholder} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
              </Box>
            ))}
            <Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>Display Order</Typography>
              <input type="number" value={categoryForm.displayOrder ?? 1} onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })} style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>Airlines</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {FOOD_AIRLINES.map((airline) => (
                  <label key={airline} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: (categoryForm.airlineNames || []).includes(airline) ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${(categoryForm.airlineNames || []).includes(airline) ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", color: (categoryForm.airlineNames || []).includes(airline) ? "#38BDF8" : "#9CA3AF" }}>
                    <input type="checkbox" checked={(categoryForm.airlineNames || []).includes(airline)} onChange={(e) => { const current = categoryForm.airlineNames || []; setCategoryForm({ ...categoryForm, airlineNames: e.target.checked ? [...current, airline] : current.filter((a) => a !== airline) }); }} style={{ accentColor: "#0EA5E9" }} />
                    {airline}
                  </label>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>Cabin Classes</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {FOOD_CABINS.map((cabin) => (
                  <label key={cabin} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: (categoryForm.cabinClasses || []).includes(cabin) ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${(categoryForm.cabinClasses || []).includes(cabin) ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", color: (categoryForm.cabinClasses || []).includes(cabin) ? "#38BDF8" : "#9CA3AF" }}>
                    <input type="checkbox" checked={(categoryForm.cabinClasses || []).includes(cabin)} onChange={(e) => { const current = categoryForm.cabinClasses || []; setCategoryForm({ ...categoryForm, cabinClasses: e.target.checked ? [...current, cabin] : current.filter((a) => a !== cabin) }); }} style={{ accentColor: "#0EA5E9" }} />
                    {cabin}
                  </label>
                ))}
              </Box>
            </Box>
            <FormControlLabel
              control={<Switch checked={categoryForm.active ?? true} onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })} size="small" sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#22C55E" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#22C55E" } }} />}
              label={<Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem" }}>Active</Typography>}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
              <Button onClick={() => { setCategoryFormOpen(false); resetCategoryForm(); }} sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", color: "#6B7280", border: "1px solid rgba(107,114,128,0.3)", "&:hover": { background: "rgba(107,114,128,0.1)" } }}>Cancel</Button>
              <Button onClick={submitCategory} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", background: "#0EA5E9", color: "#FFFFFF", px: 3, "&:hover": { background: "#0284C7" } }}>Save</Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Item Form Modal */}
      {itemFormOpen && (
        <Box sx={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
          <Paper sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", width: "100%", maxWidth: 720, p: 3.5, display: "flex", flexDirection: "column", gap: 2.5, maxHeight: "90vh", overflowY: "auto" }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.1rem" }}>{editingItem ? "Edit Food Item" : "Add Food Item"}</Typography>
              <IconButton onClick={() => { setItemFormOpen(false); resetItemForm(); }} sx={{ color: "#6B7280", "&:hover": { color: "#FFFFFF" } }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>Category</Typography>
                <select value={itemForm.categoryId || ""} onChange={(e) => { const selected = foodCategories.find((cat) => cat.id === e.target.value); setItemForm({ ...itemForm, categoryId: e.target.value, categoryName: selected?.name || "" }); }} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }}>
                  <option value="" style={{ background: "#111" }}>Select Category</option>
                  {foodCategories.map((cat) => <option key={cat.id} value={cat.id} style={{ background: "#111" }}>{cat.name}</option>)}
                </select>
              </Box>
              {[
                { label: "Item Name", key: "name", placeholder: "e.g. Paneer Tikka", type: "text" },
                { label: "Image URL", key: "imageUrl", placeholder: "https://...", type: "text" },
              ].map((f) => (
                <Box key={f.key}>
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>{f.label}</Typography>
                  <input value={(itemForm as any)[f.key] || ""} onChange={(e) => setItemForm({ ...itemForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </Box>
              ))}
              <Box>
                <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>Diet Type</Typography>
                <select value={itemForm.dietType || "VEG"} onChange={(e) => setItemForm({ ...itemForm, dietType: e.target.value as FoodItem["dietType"] })} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none" }}>
                  {["VEG", "NON_VEG", "VEGAN", "JAIN"].map((d) => <option key={d} value={d} style={{ background: "#111" }}>{d}</option>)}
                </select>
              </Box>
              {[
                { label: "Economy Price (₹)", key: "economyPrice", type: "number" },
                { label: "Business Price (₹)", key: "businessPrice", type: "number" },
                { label: "First Class Price (₹)", key: "firstClassPrice", type: "number" },
                { label: "Calories (kcal)", key: "calories", type: "number" },
                { label: "Weight (e.g. 350g)", key: "weight", type: "text" },
                { label: "Display Order", key: "displayOrder", type: "number" },
              ].map((f) => (
                <Box key={f.key}>
                  <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>{f.label}</Typography>
                  <input type={f.type} value={(itemForm as any)[f.key] ?? ""} onChange={(e) => setItemForm({ ...itemForm, [f.key]: f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value })} style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" }} />
                </Box>
              ))}
            </Box>
            <Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 0.8 }}>Description</Typography>
              <textarea value={itemForm.description || ""} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={3} placeholder="Item description" style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#FFFFFF", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", resize: "vertical" }} />
            </Box>
            <Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>Allergens</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {FOOD_ALLERGENS.map((allergen) => (
                  <label key={allergen} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: (itemForm.allergens || []).includes(allergen) ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${(itemForm.allergens || []).includes(allergen) ? "rgba(249,115,22,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", color: (itemForm.allergens || []).includes(allergen) ? "#FB923C" : "#9CA3AF" }}>
                    <input type="checkbox" checked={(itemForm.allergens || []).includes(allergen)} onChange={(e) => { const current = itemForm.allergens || []; setItemForm({ ...itemForm, allergens: e.target.checked ? [...current, allergen] : current.filter((v) => v !== allergen) }); }} style={{ accentColor: "#F97316" }} />
                    {allergen}
                  </label>
                ))}
              </Box>
            </Box>
            <Box>
              <Typography sx={{ color: "#9CA3AF", fontSize: "0.78rem", fontWeight: 600, mb: 1 }}>Meal Timing</Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {FOOD_MEAL_TIMINGS.map((timing) => (
                  <label key={timing} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", background: (itemForm.mealTiming || []).includes(timing) ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${(itemForm.mealTiming || []).includes(timing) ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, cursor: "pointer", fontSize: "0.78rem", color: (itemForm.mealTiming || []).includes(timing) ? "#38BDF8" : "#9CA3AF" }}>
                    <input type="checkbox" checked={(itemForm.mealTiming || []).includes(timing)} onChange={(e) => { const current = itemForm.mealTiming || []; setItemForm({ ...itemForm, mealTiming: e.target.checked ? [...current, timing] : current.filter((v) => v !== timing) }); }} style={{ accentColor: "#0EA5E9" }} />
                    {timing}
                  </label>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {[
                { label: "Popular", key: "popular" },
                { label: "New Item", key: "newItem" },
                { label: "Available", key: "available" },
              ].map((f) => (
                <FormControlLabel key={f.key} control={<Switch checked={(itemForm as any)[f.key] ?? false} onChange={(e) => setItemForm({ ...itemForm, [f.key]: e.target.checked })} size="small" sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#F97316" }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#F97316" } }} />} label={<Typography sx={{ color: "#9CA3AF", fontSize: "0.85rem" }}>{f.label}</Typography>} />
              ))}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 1 }}>
              <Button onClick={() => { setItemFormOpen(false); resetItemForm(); }} sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px", color: "#6B7280", border: "1px solid rgba(107,114,128,0.3)", "&:hover": { background: "rgba(107,114,128,0.1)" } }}>Cancel</Button>
              <Button onClick={submitItem} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", background: "#0EA5E9", color: "#FFFFFF", px: 3, "&:hover": { background: "#0284C7" } }}>Save Item</Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
