// src/pages/admin/AdminDashboard.tsx
// Admin dashboard with sidebar navigation and tab-based content

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllFlights, deleteFlight, searchAdmin } from "../../services/flightService";
import { getAllBookings } from "../../services/bookingService";
import { getAllUsers } from "../../services/userService";
import homeService from "../../services/homeService";
import locationService from "../../services/locationService";
import destinationService from "../../services/destinationService";
import paymentService from "../../services/paymentService";
import foodService from "../../services/foodService";
import LoadingSpinner from "../../components/LoadingSpinner";
import BookingStatusDropdown from "../../components/BookingStatusDropdown";
import Pagination from "../../components/Pagination";
import CityCombobox from "../../components/CityCombobox";
import { useAuthContext } from "../../context/AuthContext";
import useDebounce from "../../hooks/useDebounce";
import type {
  UserResponse,
  BookingResponse,
  HomeConfig,
  RouteConfig,
  Flight,
  Location,
  DestinationCard,
  PaymentRecord,
  FoodCategory,
  FoodItem,
} from "../../types";

type TabType = "overview" | "flights" | "bookings" | "users" | "locations" | "food" | "analytics" | "payments" | "homepage";
type FoodSubTab = "categories" | "items";

const FOOD_AIRLINES = ["IndiGo", "Air India", "Vistara", "SpiceJet", "Akasa Air"];
const FOOD_CABINS = ["Economy", "Business", "First Class"];
const FOOD_ALLERGENS = ["Gluten", "Dairy", "Nuts", "Eggs", "Soy", "Fish"];
const FOOD_MEAL_TIMINGS = ["Breakfast", "Lunch", "Dinner", "Anytime"];

/** Sidebar tab definition */
interface Tab {
  id: TabType;
  icon: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "flights", icon: "✈", label: "Flights" },
  { id: "bookings", icon: "📋", label: "All Bookings" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "locations", icon: "📍", label: "Locations" },
  { id: "food", icon: "🍽", label: "Food Menu" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "homepage", icon: "🏠", label: "Homepage" },
];

/**
 * Admin Dashboard — comprehensive metrics, management, and analytics.
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // ── Flights tab state ──
  const [flightsEnabled, setFlightsEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [destFilter, setDestFilter] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchPageSize, setSearchPageSize] = useState(20);
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Bookings tab filters
  const [seatFilter, setSeatFilter] = useState<"all" | "confirmed" | "cancelled">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingUserSearch, setBookingUserSearch] = useState("");
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPageSize, setBookingsPageSize] = useState(25);

  // Users tab state
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPageSize, setUsersPageSize] = useState(20);

  // Homepage tab state
  const [hcHeroTitle, setHcHeroTitle] = useState("");
  const [hcHeroSubtitle, setHcHeroSubtitle] = useState("");
  const [hcPopularRoutes, setHcPopularRoutes] = useState<RouteConfig[]>([]);
  const [hcDealRoutes, setHcDealRoutes] = useState<RouteConfig[]>([]);

  // Destination cards state
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

  // Payments tab state
  const [payStatusFilter, setPayStatusFilter] = useState<"all" | "SUCCESS" | "FAILED" | "PENDING">("all");
  const [paySearch, setPaySearch] = useState("");
  const [payPage, setPayPage] = useState(1);
  const [payPageSize] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  // Food tab state
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

  // Locations tab state
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

  // Parallel queries for flights & bookings
  const [flightsQuery, bookingsQuery] = useQueries({
    queries: [
      {
        queryKey: ["flights"],
        queryFn: getAllFlights,
        staleTime: 5 * 60 * 1000,
        enabled: flightsEnabled,
      },
      { queryKey: ["allBookings"], queryFn: getAllBookings, staleTime: 5 * 60 * 1000 },
    ],
  });

  // Server-side admin search query
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

  // Homepage config query
  const homeConfigQuery = useQuery({
    queryKey: ["homeConfig"],
    queryFn: homeService.getConfig,
    staleTime: 5 * 60 * 1000,
  });

  // Destination cards query
  const destCardsQuery = useQuery({
    queryKey: ["destinationsAdmin"],
    queryFn: destinationService.getAllAdmin,
    staleTime: 5 * 60 * 1000,
  });
  const allDestCards: DestinationCard[] = destCardsQuery.data ?? [];

  // Payments queries
  const paymentsQuery = useQuery({
    queryKey: ["adminPayments"],
    queryFn: paymentService.getAllPayments,
    staleTime: 2 * 60 * 1000,
  });
  const revenueQuery = useQuery({
    queryKey: ["adminRevenue"],
    queryFn: paymentService.getTotalRevenue,
    staleTime: 2 * 60 * 1000,
  });
  const allPayments: PaymentRecord[] = paymentsQuery.data ?? [];
  const totalRevenueFromPayments: number = revenueQuery.data ?? 0;

  // Filtered & paginated payments
  const filteredPayments = useMemo(() => {
    let result = allPayments;
    if (payStatusFilter !== "all") result = result.filter((p) => p.status === payStatusFilter);
    if (paySearch) {
      const q = paySearch.toLowerCase();
      result = result.filter(
        (p) =>
          p.razorpayPaymentId?.toLowerCase().includes(q) ||
          p.razorpayOrderId?.toLowerCase().includes(q) ||
          p.userEmail?.toLowerCase().includes(q) ||
          p.userName?.toLowerCase().includes(q) ||
          p.flightNumber?.toLowerCase().includes(q),
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPayments, payStatusFilter, paySearch]);

  const paginatedPayments = useMemo(() => {
    const start = (payPage - 1) * payPageSize;
    return filteredPayments.slice(start, start + payPageSize);
  }, [filteredPayments, payPage, payPageSize]);

  // Payment stats
  const paymentStats = useMemo(() => {
    const success = allPayments.filter((p) => p.status === "SUCCESS").length;
    const failed = allPayments.filter((p) => p.status === "FAILED").length;
    const pending = allPayments.filter((p) => p.status === "PENDING").length;
    return { success, failed, pending, total: allPayments.length };
  }, [allPayments]);

  // Payment revenue over time for chart
  const paymentRevenueData = useMemo(() => {
    const dateMap = new Map<string, number>();
    allPayments
      .filter((p) => p.status === "SUCCESS")
      .forEach((p) => {
        const date = new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        dateMap.set(date, (dateMap.get(date) || 0) + p.totalAmount);
      });
    return Array.from(dateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .slice(-14);
  }, [allPayments]);

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

  useEffect(() => { setPayPage(1); }, [payStatusFilter, paySearch]);

  // Filtered destination cards
  const filteredDestCards = useMemo(() => {
    let result = allDestCards;
    if (destStatusFilter === "active") result = result.filter((c) => c.active);
    if (destStatusFilter === "inactive") result = result.filter((c) => !c.active);
    if (destStatusFilter === "featured") result = result.filter((c) => c.featured);
    if (destCategoryFilter !== "all") result = result.filter((c) => c.category === destCategoryFilter);
    return result;
  }, [allDestCards, destStatusFilter, destCategoryFilter]);

  // Destination card mutations
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

  // Helper to reset destination form
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

  // Load destination card into form for editing
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

  // Submit destination card form
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

  // Sync homepage config to local state when loaded
  useEffect(() => {
    if (homeConfigQuery.data) {
      const c = homeConfigQuery.data;
      setHcHeroTitle(c.heroTitle ?? "");
      setHcHeroSubtitle(c.heroSubtitle ?? "");
      setHcPopularRoutes(c.popularRoutes ?? []);
      setHcDealRoutes(c.dealRoutes ?? []);
    }
  }, [homeConfigQuery.data]);

  // Homepage config save mutation
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

  // ── Locations queries & mutations ──
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

  // Users query
  const usersQuery = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsers,
    staleTime: 5 * 60 * 1000,
  });

  const flights = flightsQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const isLoading = bookingsQuery.isLoading;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFlight(id),
    onSuccess: () => {
      toast.success("Flight deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["flights"] });
    },
    onError: () => {
      toast.error("Failed to delete flight.");
    },
  });

  /** Called after BookingStatusDropdown saves successfully */
  function handleBookingStatusSaved() {
    queryClient.invalidateQueries({ queryKey: ["allBookings"] });
  }

  // Build a map of userId → user for fast lookup
  const userMap = useMemo(() => {
    const map = new Map<string, UserResponse>();
    users.forEach((u) => map.set(u.id, u));
    return map;
  }, [users]);

  // Build a map of userId → booking count
  const userBookingCountMap = useMemo(() => {
    const map = new Map<string, number>();
    bookings.forEach((b) => {
      map.set(b.userId, (map.get(b.userId) || 0) + 1);
    });
    return map;
  }, [bookings]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED").length;
    const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
    const totalRevenue = bookings
      .filter((b) => b.status === "CONFIRMED")
      .reduce((sum, b) => sum + b.totalPrice, 0);
    const avgBookingValue = confirmed > 0 ? Math.round(totalRevenue / confirmed) : 0;

    return {
      totalFlights: flights.length,
      totalBookings: bookings.length,
      confirmed,
      cancelled,
      totalRevenue,
      avgBookingValue,
      totalUsers: users.length,
    };
  }, [flights, bookings, users]);

  // ─── Charts Data ───
  const bookingsPerFlightData = useMemo(() => {
    const flightMap = new Map<string, number>();
    bookings.forEach((b) => {
      flightMap.set(b.flightNumber, (flightMap.get(b.flightNumber) || 0) + 1);
    });
    return Array.from(flightMap.entries())
      .map(([flightNumber, count]) => ({ flightNumber, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [bookings]);

  const bookingStatusData = useMemo(() => {
    return [
      { name: "Confirmed", value: stats.confirmed, fill: "#10b981" },
      { name: "Cancelled", value: stats.cancelled, fill: "#ef4444" },
    ];
  }, [stats]);

  const revenueData = useMemo(() => {
    const dateMap = new Map<string, number>();
    bookings
      .filter((b) => b.status === "CONFIRMED")
      .forEach((b) => {
        const date = new Date(b.bookingDate).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        });
        dateMap.set(date, (dateMap.get(date) || 0) + b.totalPrice);
      });
    return Array.from(dateMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);
  }, [bookings]);

  const topFlightsData = useMemo(() => {
    const flightMap = new Map<string, number>();
    bookings.forEach((b) => {
      flightMap.set(b.flightNumber, (flightMap.get(b.flightNumber) || 0) + 1);
    });
    return Array.from(flightMap.entries())
      .map(([flight, count]) => ({ flight, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = bookings;
    if (seatFilter !== "all") {
      result = result.filter((b) => b.status === seatFilter.toUpperCase());
    }
    if (searchTerm) {
      result = result.filter((b) =>
        b.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (bookingUserSearch) {
      const q = bookingUserSearch.toLowerCase();
      result = result.filter((b) => {
        const u = userMap.get(b.userId);
        if (!u) return false;
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      });
    }
    return result.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  }, [bookings, seatFilter, searchTerm, bookingUserSearch, userMap]);

  // ─── Filtered Users (Users tab) ───
  const filteredUsers = useMemo(() => {
    let result = users;
    if (userRoleFilter !== "all") {
      result = result.filter((u) => u.role === userRoleFilter);
    }
    if (userSearch) {
      const q = userSearch.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return [...result].reverse();
  }, [users, userRoleFilter, userSearch]);

  // Reset bookings page when filters change
  useEffect(() => { setBookingsPage(1); }, [seatFilter, searchTerm, bookingUserSearch, bookingsPageSize]);
  // Reset users page when filters change
  useEffect(() => { setUsersPage(1); }, [userRoleFilter, userSearch, usersPageSize]);
  // Reset search page when search filters change
  useEffect(() => { setSearchPage(1); }, [debouncedSearch, sourceFilter, destFilter, airlineFilter, searchPageSize]);

  // ─── Paginated slices ───
  const paginatedBookings = useMemo(() => {
    const start = (bookingsPage - 1) * bookingsPageSize;
    return filteredBookings.slice(start, start + bookingsPageSize);
  }, [filteredBookings, bookingsPage, bookingsPageSize]);

  const paginatedUsers = useMemo(() => {
    const start = (usersPage - 1) * usersPageSize;
    return filteredUsers.slice(start, start + usersPageSize);
  }, [filteredUsers, usersPage, usersPageSize]);

  // Flights tab: determine what to display
  const flightsClientPage = useMemo(() => {
    if (hasSearchFilters) return [];
    const sorted = [...flights].sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());
    const start = (searchPage - 1) * searchPageSize;
    return sorted.slice(start, start + searchPageSize);
  }, [flights, searchPage, searchPageSize, hasSearchFilters]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-64 bg-gray-900 text-white fixed h-screen flex flex-col shadow-lg z-40">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold flex items-center gap-2">✈ SkyBook Admin</h1>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-left ${
                activeTab === tab.id
                  ? "bg-sky-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className="text-sm text-gray-400">
            <p className="font-medium text-white">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <button
            onClick={logout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 ml-64 overflow-auto page-enter">
        <div className="p-8 space-y-8">
          {/* ─── TAB: OVERVIEW ─── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
                <StatCard label="Total Flights" value={stats.totalFlights} color="bg-sky-500" icon="✈" />
                <StatCard
                  label="Total Bookings"
                  value={stats.totalBookings}
                  color="bg-indigo-500"
                  icon="📋"
                />
                <StatCard label="Confirmed" value={stats.confirmed} color="bg-green-500" icon="✓" />
                <StatCard label="Cancelled" value={stats.cancelled} color="bg-red-500" icon="✕" />
                <StatCard label="Total Users" value={stats.totalUsers} color="bg-purple-500" icon="👥" />
                <StatCard
                  label="Total Revenue"
                  value={`₹${totalRevenueFromPayments.toLocaleString("en-IN")}`}
                  color="bg-emerald-500"
                  icon="💰"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bookings Per Flight */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Bookings per Flight</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsPerFlightData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="flightNumber" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Booking Status */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Booking Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bookingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {bookingStatusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Bookings Table */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">Recent Bookings</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Seats</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Total</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => {
                        const statusColor =
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700";
                        return (
                          <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 font-mono text-xs">{booking.flightNumber}</td>
                            <td className="px-6 py-3">{booking.numberOfSeats}</td>
                            <td className="px-6 py-3 font-bold text-sky-600">
                              ₹{booking.totalPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor}`}>
                                {booking.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: FLIGHTS ─── */}
          {activeTab === "flights" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Manage Flights</h2>
                <div className="flex items-center gap-3">
                  {!flightsEnabled && (
                    <button
                      onClick={() => setFlightsEnabled(true)}
                      className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium text-sm"
                    >
                      📥 Load All Flights
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/admin/flights/add")}
                    className="bg-sky-500 text-white px-6 py-2.5 rounded-xl hover:bg-sky-600 transition font-medium"
                  >
                    + Add Flight
                  </button>
                </div>
              </div>

              {/* Search & Filter Bar */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Search flight number or airline..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Source city..."
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Destination city..."
                    value={destFilter}
                    onChange={(e) => setDestFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Airline name..."
                    value={airlineFilter}
                    onChange={(e) => setAirlineFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                  />
                </div>
                {hasSearchFilters && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSourceFilter("");
                      setDestFilter("");
                      setAirlineFilter("");
                    }}
                    className="mt-3 text-sm text-sky-600 hover:text-sky-800 font-medium"
                  >
                    ✕ Clear all filters
                  </button>
                )}
              </div>

              {/* Flights Table */}
              {(() => {
                // Determine data source
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
                    <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                      <p className="text-gray-500 text-lg mb-2">Flights are not loaded yet</p>
                      <p className="text-gray-400 text-sm mb-6">
                        Use the search bar above to find specific flights, or click "Load All Flights" to browse everything.
                      </p>
                      <button
                        onClick={() => setFlightsEnabled(true)}
                        className="bg-sky-500 text-white px-6 py-2.5 rounded-xl hover:bg-sky-600 transition font-medium"
                      >
                        📥 Load All Flights
                      </button>
                    </div>
                  );
                }

                if (isFlightsLoading) return <LoadingSpinner />;

                return (
                  <>
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                              <th className="px-6 py-3 font-semibold text-gray-700">Airline</th>
                              <th className="px-6 py-3 font-semibold text-gray-700">Route</th>
                              <th className="px-6 py-3 font-semibold text-gray-700">Departure</th>
                              <th className="px-6 py-3 font-semibold text-gray-700">Price</th>
                              <th className="px-6 py-3 font-semibold text-gray-700">Seats</th>
                              <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayFlights.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                                  No flights found
                                </td>
                              </tr>
                            ) : (
                              displayFlights.map((flight) => (
                                <tr key={flight.id} className="border-b border-gray-200 hover:bg-gray-50">
                                  <td className="px-6 py-3 font-mono text-xs">{flight.flightNumber}</td>
                                  <td className="px-6 py-3">{flight.airlineName}</td>
                                  <td className="px-6 py-3">
                                    {flight.source} → {flight.destination}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-gray-600">
                                    {new Date(flight.departureTime).toLocaleString("en-IN", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </td>
                                  <td className="px-6 py-3 font-bold text-sky-600">₹{flight.price.toLocaleString("en-IN")}</td>
                                  <td className="px-6 py-3">{flight.availableSeats}</td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => navigate(`/admin/flights/${flight.id}/edit`)}
                                        className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-amber-200 transition"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          const confirmed = window.confirm(
                                            `Delete flight ${flight.flightNumber}? This cannot be undone.`
                                          );
                                          if (confirmed) deleteMutation.mutate(flight.id);
                                        }}
                                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-200 transition"
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
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
            </div>
          )}

          {/* ─── TAB: ALL BOOKINGS ─── */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">All Bookings</h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by flight number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by user name or email..."
                      value={bookingUserSearch}
                      onChange={(e) => setBookingUserSearch(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(["all", "confirmed", "cancelled"] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSeatFilter(status)}
                        className={`px-4 py-2.5 rounded-xl font-medium transition ${
                          seatFilter === status
                            ? "bg-sky-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:border-sky-500"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-700">ID</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Booked By</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Route</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Seats</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Total</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedBookings.map((booking) => {
                        const bookedByUser = userMap.get(booking.userId);
                        const roleBadge = bookedByUser?.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-sky-100 text-sky-700";
                        return (
                          <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-3 font-mono text-xs">#{booking.id.slice(0, 8)}</td>
                            <td className="px-6 py-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {bookedByUser?.name || `User #${booking.userId.slice(0, 6)}`}
                                </span>
                                {bookedByUser && (
                                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge}`}>
                                    {bookedByUser.role}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-3 text-gray-600 text-xs">
                              {bookedByUser?.email || "—"}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs">{booking.flightNumber}</td>
                            <td className="px-6 py-3">
                              {booking.source} → {booking.destination}
                            </td>
                            <td className="px-6 py-3">{booking.numberOfSeats}</td>
                            <td className="px-6 py-3 font-bold text-sky-600">
                              ₹{booking.totalPrice.toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-3">
                              <BookingStatusDropdown
                                bookingId={booking.id}
                                currentStatus={booking.status as "CONFIRMED" | "CANCELLED"}
                                onSaved={handleBookingStatusSaved}
                              />
                            </td>
                            <td className="px-6 py-3 text-gray-600">
                              {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <Pagination
                currentPage={bookingsPage}
                totalItems={filteredBookings.length}
                itemsPerPage={bookingsPageSize}
                onPageChange={setBookingsPage}
                onItemsPerPageChange={(size) => setBookingsPageSize(size)}
              />
            </div>
          )}

          {/* ─── TAB: USERS ─── */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Users</h2>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "USER", "ADMIN"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-4 py-2.5 rounded-xl font-medium transition ${
                        userRoleFilter === role
                          ? "bg-sky-600 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:border-sky-500"
                      }`}
                    >
                      {role === "all" ? "All" : role}
                    </button>
                  ))}
                </div>
              </div>

              {usersQuery.isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-gray-700">#</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Name</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Role</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Total Bookings</th>
                          <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map((u, idx) => {
                          const isExpanded = expandedUserId === u.id;
                          const userBookings = bookings.filter((b) => b.userId === u.id);
                          const roleBadge =
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-sky-100 text-sky-700";
                          return (
                            <UserRow
                              key={u.id}
                              user={u}
                              index={(usersPage - 1) * usersPageSize + idx + 1}
                              roleBadge={roleBadge}
                              bookingCount={userBookingCountMap.get(u.id) || 0}
                              isExpanded={isExpanded}
                              userBookings={userBookings}
                              onToggleExpand={() =>
                                setExpandedUserId(isExpanded ? null : u.id)
                              }
                              onStatusSaved={handleBookingStatusSaved}
                            />
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  currentPage={usersPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={usersPageSize}
                  onPageChange={setUsersPage}
                  onItemsPerPageChange={(size) => setUsersPageSize(size)}
                />
                </>
              )}
            </div>
          )}

          {/* ─── TAB: LOCATIONS ─── */}
          {activeTab === "locations" && (
            <div className="space-y-6 relative">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Manage Locations</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => locRefreshCountsMutation.mutate()}
                    disabled={locRefreshCountsMutation.isPending}
                    className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition font-medium text-sm disabled:opacity-50"
                  >
                    {locRefreshCountsMutation.isPending ? "Refreshing..." : "🔄 Refresh Counts"}
                  </button>
                  <button
                    onClick={() => { setEditingLocation(null); resetLocForm(); setLocPanelOpen(true); }}
                    className="bg-sky-500 text-white px-6 py-2.5 rounded-xl hover:bg-sky-600 transition font-medium"
                  >
                    + Add Location
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-sky-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Total</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{allLocations.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-green-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Active</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{allLocations.filter((l) => l.active).length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-purple-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Metro</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{allLocations.filter((l) => l.type === "metro").length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-amber-500">
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">On Explore</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{allLocations.filter((l) => l.showOnExplore).length}</p>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="bg-white rounded-2xl shadow-md p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Search city, state, code..."
                    value={locSearch}
                    onChange={(e) => setLocSearch(e.target.value)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                  />
                  <select
                    value={locTypeFilter}
                    onChange={(e) => setLocTypeFilter(e.target.value as any)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="all">All Types</option>
                    <option value="metro">Metro</option>
                    <option value="city">City</option>
                    <option value="town">Town</option>
                  </select>
                  <select
                    value={locStatusFilter}
                    onChange={(e) => setLocStatusFilter(e.target.value as any)}
                    className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  {(locSearch || locTypeFilter !== "all" || locStatusFilter !== "all") && (
                    <button
                      onClick={() => { setLocSearch(""); setLocTypeFilter("all"); setLocStatusFilter("all"); }}
                      className="text-sm text-sky-600 hover:text-sky-800 font-medium flex items-center justify-center"
                    >
                      ✕ Clear filters
                    </button>
                  )}
                </div>
              </div>

              {/* Locations Table */}
              {locationsQuery.isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-700">#</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">City</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">State</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Country</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Code</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Airport</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Type</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Flights</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Explore</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Home</th>
                            <th className="px-4 py-3 font-semibold text-gray-700 text-center">Active</th>
                            <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedLocations.length === 0 ? (
                            <tr>
                              <td colSpan={12} className="px-6 py-12 text-center text-gray-400">
                                No locations found
                              </td>
                            </tr>
                          ) : (
                            paginatedLocations.map((loc, i) => {
                              const typeBadge =
                                loc.type === "metro"
                                  ? "bg-purple-100 text-purple-700"
                                  : loc.type === "city"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-600";
                              return (
                                <tr key={loc.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="px-4 py-3 text-gray-400 text-xs">
                                    {(locPage - 1) * locPageSize + i + 1}
                                  </td>
                                  <td className="px-4 py-3 font-medium">{loc.city}</td>
                                  <td className="px-4 py-3 text-gray-600">{loc.state}</td>
                                  <td className="px-4 py-3 text-gray-600">{loc.country}</td>
                                  <td className="px-4 py-3 font-mono text-xs font-bold">{loc.airportCode}</td>
                                  <td className="px-4 py-3 text-gray-600 text-xs">{loc.airportName}</td>
                                  <td className="px-4 py-3">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${typeBadge}`}>
                                      {loc.type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center font-medium">
                                    {loc.totalFlights ?? 0}
                                    {loc.activeFlights != null && loc.activeFlights !== loc.totalFlights && (
                                      <span className="text-xs text-gray-400 ml-1">({loc.activeFlights})</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-center">
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
                                  <td className="px-4 py-3 text-center">
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
                                  <td className="px-4 py-3 text-center">
                                    <ToggleSwitch
                                      checked={loc.active}
                                      onChange={() => locToggleMutation.mutate(loc.id)}
                                    />
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => openEditLocation(loc)}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition"
                                      >
                                        ✏️ Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`Delete ${loc.city}?`)) {
                                            locDeleteMutation.mutate(loc.id);
                                          }
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                                      >
                                        🗑
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

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
              {locPanelOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                  <div className="absolute inset-0 bg-black/30" onClick={() => { setLocPanelOpen(false); setEditingLocation(null); }} />
                  <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-slideIn">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingLocation ? "Edit Location" : "Add Location"}
                      </h3>
                      <button
                        onClick={() => { setLocPanelOpen(false); setEditingLocation(null); }}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          value={locForm.city}
                          onChange={(e) => setLocForm({ ...locForm, city: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                        <input
                          value={locForm.state}
                          onChange={(e) => setLocForm({ ...locForm, state: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          value={locForm.country}
                          onChange={(e) => setLocForm({ ...locForm, country: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Airport Code *</label>
                          <input
                            value={locForm.airportCode}
                            onChange={(e) => setLocForm({ ...locForm, airportCode: e.target.value.toUpperCase() })}
                            maxLength={4}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                          <select
                            value={locForm.type}
                            onChange={(e) => setLocForm({ ...locForm, type: e.target.value as any })}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm bg-white"
                          >
                            <option value="metro">Metro</option>
                            <option value="city">City</option>
                            <option value="town">Town</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Airport Name *</label>
                        <input
                          value={locForm.airportName}
                          onChange={(e) => setLocForm({ ...locForm, airportName: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={locForm.displayOrder}
                          onChange={(e) => setLocForm({ ...locForm, displayOrder: Number(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={locForm.active}
                            onChange={(e) => setLocForm({ ...locForm, active: e.target.checked })}
                            className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                          />
                          <span className="text-sm text-gray-700">Active</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={locForm.showOnExplore}
                            onChange={(e) => setLocForm({ ...locForm, showOnExplore: e.target.checked })}
                            className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                          />
                          <span className="text-sm text-gray-700">Show on Explore page</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={locForm.showOnHome}
                            onChange={(e) => setLocForm({ ...locForm, showOnHome: e.target.checked })}
                            className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                          />
                          <span className="text-sm text-gray-700">Show on Home page</span>
                        </label>
                      </div>
                      <button
                        onClick={handleLocFormSave}
                        disabled={locCreateMutation.isPending || locUpdateMutation.isPending}
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      >
                        {(locCreateMutation.isPending || locUpdateMutation.isPending)
                          ? "Saving..."
                          : editingLocation
                            ? "💾 Update Location"
                            : "➕ Create Location"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: ANALYTICS ─── */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>

              {/* Revenue Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Over Time (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => (value ? `₹${(value as number).toLocaleString("en-IN")}` : "₹0")} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Flights Chart */}
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Most Booked Flights</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topFlightsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="flight" type="category" width={90} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Average Booking Value</h3>
                  <p className="text-3xl font-bold text-sky-600">₹{stats.avgBookingValue.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-600 mt-2">Average price per confirmed booking</p>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-sm uppercase tracking-wide text-gray-500 font-medium mb-2">Total Revenue</h3>
                  <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-gray-600 mt-2">From {stats.confirmed} confirmed bookings</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB: PAYMENTS ─── */}
          {activeTab === "payments" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">💳 Payment Management</h2>
                <p className="text-gray-500 text-sm mt-1">Track all Razorpay transactions and revenue</p>
              </div>

              {/* Payment Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <p className="text-sm font-medium opacity-80">Total Revenue</p>
                  <p className="text-3xl font-black mt-1">₹{totalRevenueFromPayments.toLocaleString("en-IN")}</p>
                  <p className="text-xs opacity-70 mt-2">From {paymentStats.success} successful payments</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <p className="text-sm text-gray-500">Successful</p>
                  <p className="text-3xl font-black text-green-600 mt-1">{paymentStats.success}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-3xl font-black text-red-500 mt-1">{paymentStats.failed}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-3xl font-black text-amber-500 mt-1">{paymentStats.pending}</p>
                </div>
              </div>

              {/* Revenue Chart */}
              {paymentRevenueData.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Revenue (Last 14 days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={paymentRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]} />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                <select
                  value={payStatusFilter}
                  onChange={(e) => setPayStatusFilter(e.target.value as typeof payStatusFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="SUCCESS">✅ Success</option>
                  <option value="FAILED">❌ Failed</option>
                  <option value="PENDING">⏳ Pending</option>
                </select>
                <input
                  type="text"
                  placeholder="Search by payment ID, email, flight..."
                  value={paySearch}
                  onChange={(e) => setPaySearch(e.target.value)}
                  className="flex-1 min-w-[250px] px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
                <span className="text-sm text-gray-500">
                  {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Payments Table */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-gray-700">Payment ID</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">User</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Flight</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Amount</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Date</th>
                        <th className="px-6 py-3 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsQuery.isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading payments...</td>
                        </tr>
                      ) : paginatedPayments.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No payments found</td>
                        </tr>
                      ) : (
                        paginatedPayments.map((payment) => {
                          const statusStyles: Record<string, string> = {
                            SUCCESS: "bg-green-100 text-green-700",
                            FAILED: "bg-red-100 text-red-700",
                            PENDING: "bg-amber-100 text-amber-700",
                          };
                          return (
                            <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-3 font-mono text-xs text-gray-700 max-w-[160px] truncate">
                                {payment.razorpayPaymentId || payment.razorpayOrderId}
                              </td>
                              <td className="px-6 py-3">
                                <p className="font-medium text-gray-800 text-sm">{payment.userName}</p>
                                <p className="text-xs text-gray-400">{payment.userEmail}</p>
                              </td>
                              <td className="px-6 py-3 font-mono text-xs">{payment.flightNumber}</td>
                              <td className="px-6 py-3 font-bold text-sky-600">
                                ₹{payment.totalAmount.toLocaleString("en-IN")}
                              </td>
                              <td className="px-6 py-3">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[payment.status] || "bg-gray-100 text-gray-600"}`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-gray-600 text-xs">
                                {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                              </td>
                              <td className="px-6 py-3">
                                <button
                                  onClick={() => setSelectedPayment(payment)}
                                  className="text-sky-600 hover:text-sky-800 text-xs font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Pagination */}
              {filteredPayments.length > payPageSize && (
                <Pagination
                  currentPage={payPage}
                  totalItems={filteredPayments.length}
                  itemsPerPage={payPageSize}
                  onPageChange={setPayPage}
                />
              )}

              {/* Payment Detail Modal */}
              {selectedPayment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPayment(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-800">Payment Details</h3>
                      <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Razorpay Order ID</p>
                          <p className="font-mono text-sm break-all">{selectedPayment.razorpayOrderId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Razorpay Payment ID</p>
                          <p className="font-mono text-sm break-all">{selectedPayment.razorpayPaymentId || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Status</p>
                          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium mt-1 ${
                            selectedPayment.status === "SUCCESS" ? "bg-green-100 text-green-700" :
                            selectedPayment.status === "FAILED" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {selectedPayment.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-xl font-black text-sky-600 mt-1">₹{selectedPayment.totalAmount.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <hr />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">User</p>
                          <p className="font-medium text-sm">{selectedPayment.userName}</p>
                          <p className="text-xs text-gray-400">{selectedPayment.userEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Flight</p>
                          <p className="font-mono text-sm">{selectedPayment.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Route</p>
                          <p className="text-sm">{selectedPayment.source} → {selectedPayment.destination}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Seats</p>
                          <p className="text-sm">{selectedPayment.numberOfSeats} seat{selectedPayment.numberOfSeats !== 1 ? "s" : ""}</p>
                          {selectedPayment.selectedSeats?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedPayment.selectedSeats.map((s: string) => (
                                <span key={s} className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-mono">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <hr />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Base Price</p>
                          <p>₹{selectedPayment.baseFare.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Taxes</p>
                          <p>₹{selectedPayment.taxes.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Convenience Fee</p>
                          <p>₹{selectedPayment.convenienceFee.toLocaleString("en-IN")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Booking ID</p>
                          <p className="font-mono text-xs break-all">{selectedPayment.bookingId || "—"}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 pt-2">
                        Created: {new Date(selectedPayment.createdAt).toLocaleString("en-IN")}
                        {selectedPayment.updatedAt && <> · Updated: {new Date(selectedPayment.updatedAt).toLocaleString("en-IN")}</>}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: FOOD MENU ─── */}
          {activeTab === "food" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Food Menu Management</h2>
                  <p className="text-gray-500 text-sm mt-1">Manage in-flight meals by categories and menu items</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFoodSubTab("categories");
                      resetCategoryForm();
                      setCategoryFormOpen(true);
                    }}
                    className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700"
                  >
                    + Add Category
                  </button>
                  <button
                    onClick={() => {
                      setFoodSubTab("items");
                      resetItemForm();
                      setItemFormOpen(true);
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard label="Total Items" value={foodStats.total} color="bg-sky-500" icon="🍽" />
                <StatCard label="Available" value={foodStats.available} color="bg-green-500" icon="✅" />
                <StatCard label="Veg Items" value={foodStats.veg} color="bg-emerald-500" icon="🥗" />
                <StatCard label="Non-Veg Items" value={foodStats.nonVeg} color="bg-red-500" icon="🍗" />
                <StatCard label="Avg Economy Price" value={`₹${foodStats.avgEconomy}`} color="bg-indigo-500" icon="💸" />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-2 inline-flex gap-2">
                <button
                  onClick={() => setFoodSubTab("categories")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    foodSubTab === "categories" ? "bg-sky-600 text-white" : "text-gray-600"
                  }`}
                >
                  📂 Categories
                </button>
                <button
                  onClick={() => setFoodSubTab("items")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${
                    foodSubTab === "items" ? "bg-sky-600 text-white" : "text-gray-600"
                  }`}
                >
                  🍱 Menu Items
                </button>
              </div>

              {foodSubTab === "categories" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="text-left px-4 py-3">Icon</th>
                        <th className="text-left px-4 py-3">Name</th>
                        <th className="text-left px-4 py-3">Airlines</th>
                        <th className="text-left px-4 py-3">Cabin Classes</th>
                        <th className="text-left px-4 py-3">Items</th>
                        <th className="text-left px-4 py-3">Active</th>
                        <th className="text-left px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodCategories.map((category) => {
                        const count = foodItems.filter((item) => item.categoryId === category.id).length;
                        return (
                          <tr key={category.id} className="border-t border-gray-100">
                            <td className="px-4 py-3 text-xl">{category.icon}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{category.name}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {category.airlineNames.length ? category.airlineNames.join(", ") : "All"}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {category.cabinClasses.length ? category.cabinClasses.join(", ") : "All"}
                            </td>
                            <td className="px-4 py-3">{count}</td>
                            <td className="px-4 py-3">{category.active ? "✅" : "❌"}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setCategoryForm(category);
                                    setCategoryFormOpen(true);
                                  }}
                                  className="px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete category ${category.name}?`)) {
                                      deleteCategoryMutation.mutate(category.id);
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {foodSubTab === "items" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
                    <select
                      value={foodCategoryFilter}
                      onChange={(e) => setFoodCategoryFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Categories</option>
                      {foodCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    <select
                      value={foodDietFilter}
                      onChange={(e) => setFoodDietFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Diet Types</option>
                      <option value="VEG">VEG</option>
                      <option value="NON_VEG">NON_VEG</option>
                      <option value="VEGAN">VEGAN</option>
                      <option value="JAIN">JAIN</option>
                    </select>
                    <select
                      value={foodAirlineFilter}
                      onChange={(e) => setFoodAirlineFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="all">All Airlines</option>
                      {FOOD_AIRLINES.map((airline) => (
                        <option key={airline} value={airline}>{airline}</option>
                      ))}
                    </select>
                    <input
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      placeholder="Search items..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[220px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        selectedFoodItemIds.forEach((id) => {
                          const target = foodItems.find((item) => item.id === id);
                          if (target && !target.available) toggleItemMutation.mutate(id);
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm"
                    >
                      Enable All
                    </button>
                    <button
                      onClick={() => {
                        selectedFoodItemIds.forEach((id) => {
                          const target = foodItems.find((item) => item.id === id);
                          if (target && target.available) toggleItemMutation.mutate(id);
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm"
                    >
                      Disable All
                    </button>
                    <button
                      onClick={() => {
                        if (!selectedFoodItemIds.length) return;
                        if (!window.confirm(`Delete ${selectedFoodItemIds.length} selected item(s)?`)) return;
                        selectedFoodItemIds.forEach((id) => deleteItemMutation.mutate(id));
                        setSelectedFoodItemIds([]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredFoodItems.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selectedFoodItemIds.includes(item.id)}
                              onChange={(e) => {
                                setSelectedFoodItemIds((prev) =>
                                  e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                                );
                              }}
                              className="mt-1"
                            />
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1 justify-end">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700">{item.dietType}</span>
                            {item.popular && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">Popular</span>}
                            {item.newItem && <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">New</span>}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.categoryName}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>Economy: ₹{item.economyPrice}</p>
                          <p>Business: ₹{item.businessPrice} {item.businessPrice === 0 ? "(FREE)" : ""}</p>
                          <p>{item.calories} cal • {item.weight}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            onClick={() => toggleItemMutation.mutate(item.id)}
                            className={`px-2 py-1 text-xs rounded ${item.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {item.available ? "Available" : "Unavailable"}
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm(item);
                              setItemFormOpen(true);
                            }}
                            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${item.name}?`)) deleteItemMutation.mutate(item.id);
                            }}
                            className="px-2 py-1 text-xs rounded bg-red-100 text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {categoryFormOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">{editingCategory ? "Edit Category" : "Add Category"}</h3>
                    <input value={categoryForm.name || ""} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Name" className="w-full px-3 py-2 border rounded-lg" />
                    <input value={categoryForm.icon || ""} onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })} placeholder="Icon" className="w-full px-3 py-2 border rounded-lg" />
                    <input value={categoryForm.description || ""} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description" className="w-full px-3 py-2 border rounded-lg" />
                    <input type="number" value={categoryForm.displayOrder ?? 1} onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })} placeholder="Display Order" className="w-full px-3 py-2 border rounded-lg" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Airlines</p>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_AIRLINES.map((airline) => (
                          <label key={airline} className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <input
                              type="checkbox"
                              checked={(categoryForm.airlineNames || []).includes(airline)}
                              onChange={(e) => {
                                const current = categoryForm.airlineNames || [];
                                setCategoryForm({
                                  ...categoryForm,
                                  airlineNames: e.target.checked
                                    ? [...current, airline]
                                    : current.filter((a) => a !== airline),
                                });
                              }}
                            />
                            {airline}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Cabin Classes</p>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_CABINS.map((cabin) => (
                          <label key={cabin} className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <input
                              type="checkbox"
                              checked={(categoryForm.cabinClasses || []).includes(cabin)}
                              onChange={(e) => {
                                const current = categoryForm.cabinClasses || [];
                                setCategoryForm({
                                  ...categoryForm,
                                  cabinClasses: e.target.checked
                                    ? [...current, cabin]
                                    : current.filter((a) => a !== cabin),
                                });
                              }}
                            />
                            {cabin}
                          </label>
                        ))}
                      </div>
                    </div>
                    <label className="text-sm flex items-center gap-2">
                      <input type="checkbox" checked={categoryForm.active ?? true} onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })} /> Active
                    </label>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setCategoryFormOpen(false); resetCategoryForm(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                      <button onClick={submitCategory} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Save</button>
                    </div>
                  </div>
                </div>
              )}

              {itemFormOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-800">{editingItem ? "Edit Food Item" : "Add Food Item"}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        value={itemForm.categoryId || ""}
                        onChange={(e) => {
                          const selected = foodCategories.find((category) => category.id === e.target.value);
                          setItemForm({ ...itemForm, categoryId: e.target.value, categoryName: selected?.name || "" });
                        }}
                        className="px-3 py-2 border rounded-lg"
                      >
                        <option value="">Select Category</option>
                        {foodCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <input value={itemForm.name || ""} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} placeholder="Item name" className="px-3 py-2 border rounded-lg" />
                      <input value={itemForm.imageUrl || ""} onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })} placeholder="Image URL" className="px-3 py-2 border rounded-lg" />
                      <select value={itemForm.dietType || "VEG"} onChange={(e) => setItemForm({ ...itemForm, dietType: e.target.value as FoodItem["dietType"] })} className="px-3 py-2 border rounded-lg">
                        <option value="VEG">VEG</option>
                        <option value="NON_VEG">NON_VEG</option>
                        <option value="VEGAN">VEGAN</option>
                        <option value="JAIN">JAIN</option>
                      </select>
                      <input type="number" value={itemForm.economyPrice || 0} onChange={(e) => setItemForm({ ...itemForm, economyPrice: parseInt(e.target.value) || 0 })} placeholder="Economy Price" className="px-3 py-2 border rounded-lg" />
                      <input type="number" value={itemForm.businessPrice || 0} onChange={(e) => setItemForm({ ...itemForm, businessPrice: parseInt(e.target.value) || 0 })} placeholder="Business Price" className="px-3 py-2 border rounded-lg" />
                      <input type="number" value={itemForm.firstClassPrice || 0} onChange={(e) => setItemForm({ ...itemForm, firstClassPrice: parseInt(e.target.value) || 0 })} placeholder="First Class Price" className="px-3 py-2 border rounded-lg" />
                      <input type="number" value={itemForm.calories || 0} onChange={(e) => setItemForm({ ...itemForm, calories: parseInt(e.target.value) || 0 })} placeholder="Calories" className="px-3 py-2 border rounded-lg" />
                      <input value={itemForm.weight || ""} onChange={(e) => setItemForm({ ...itemForm, weight: e.target.value })} placeholder="Weight (e.g. 350g)" className="px-3 py-2 border rounded-lg" />
                      <input type="number" value={itemForm.displayOrder || 1} onChange={(e) => setItemForm({ ...itemForm, displayOrder: parseInt(e.target.value) || 1 })} placeholder="Display Order" className="px-3 py-2 border rounded-lg" />
                    </div>
                    <textarea value={itemForm.description || ""} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} rows={3} placeholder="Description" className="w-full px-3 py-2 border rounded-lg" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Allergens</p>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_ALLERGENS.map((allergen) => (
                          <label key={allergen} className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <input
                              type="checkbox"
                              checked={(itemForm.allergens || []).includes(allergen)}
                              onChange={(e) => {
                                const current = itemForm.allergens || [];
                                setItemForm({
                                  ...itemForm,
                                  allergens: e.target.checked
                                    ? [...current, allergen]
                                    : current.filter((value) => value !== allergen),
                                });
                              }}
                            />
                            {allergen}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Meal Timing</p>
                      <div className="flex flex-wrap gap-2">
                        {FOOD_MEAL_TIMINGS.map((timing) => (
                          <label key={timing} className="text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                            <input
                              type="checkbox"
                              checked={(itemForm.mealTiming || []).includes(timing)}
                              onChange={(e) => {
                                const current = itemForm.mealTiming || [];
                                setItemForm({
                                  ...itemForm,
                                  mealTiming: e.target.checked
                                    ? [...current, timing]
                                    : current.filter((value) => value !== timing),
                                });
                              }}
                            />
                            {timing}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={itemForm.popular || false} onChange={(e) => setItemForm({ ...itemForm, popular: e.target.checked })} /> Popular</label>
                      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={itemForm.newItem || false} onChange={(e) => setItemForm({ ...itemForm, newItem: e.target.checked })} /> New Item</label>
                      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={itemForm.available ?? true} onChange={(e) => setItemForm({ ...itemForm, available: e.target.checked })} /> Available</label>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => { setItemFormOpen(false); resetItemForm(); }} className="px-4 py-2 border rounded-lg">Cancel</button>
                      <button onClick={submitItem} className="px-4 py-2 bg-sky-600 text-white rounded-lg">Save Item</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── TAB: HOMEPAGE ─── */}
          {activeTab === "homepage" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Homepage Settings</h2>
                <p className="text-gray-500 text-sm mt-1">Control what appears on the public homepage</p>
              </div>

              {homeConfigQuery.isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* ── Hero Section Editor ── */}
                  <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800">Hero Section</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                      <input
                        type="text"
                        value={hcHeroTitle}
                        onChange={(e) => setHcHeroTitle(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        placeholder="Where do you want to fly?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                      <input
                        type="text"
                        value={hcHeroSubtitle}
                        onChange={(e) => setHcHeroSubtitle(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        placeholder="Search and book flights at the best prices"
                      />
                    </div>
                    <button
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
                      className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2.5 rounded-xl transition disabled:opacity-50"
                    >
                      {homeConfigMutation.isPending ? "Saving..." : "💾 Save Hero"}
                    </button>
                  </div>

                  {/* ── Destination Cards Manager ── */}
                  <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">Destination Cards</h3>
                        <p className="text-xs text-gray-500">Control cards shown on homepage</p>
                      </div>
                      <button
                        onClick={() => {
                          resetDestForm();
                          setDestPanelOpen(true);
                        }}
                        className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 transition"
                      >
                        + Add New Card
                      </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-3">
                      <select
                        value={destStatusFilter}
                        onChange={(e) => setDestStatusFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                        <option value="featured">Featured Only</option>
                      </select>
                      <select
                        value={destCategoryFilter}
                        onChange={(e) => setDestCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      >
                        <option value="all">All Categories</option>
                        <option value="Beach">Beach</option>
                        <option value="Hills">Hills</option>
                        <option value="Heritage">Heritage</option>
                        <option value="Honeymoon">Honeymoon</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Spiritual">Spiritual</option>
                        <option value="Wildlife">Wildlife</option>
                        <option value="City Break">City Break</option>
                        <option value="Weekend Getaway">Weekend Getaway</option>
                      </select>
                    </div>

                    {/* Cards Grid */}
                    {destCardsQuery.isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-64" />
                        ))}
                      </div>
                    ) : filteredDestCards.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">No destination cards found.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDestCards.map((card) => (
                          <div
                            key={card.id}
                            className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition"
                          >
                            {/* Image */}
                            <div className="relative h-32">
                              <img
                                src={card.imageUrl}
                                alt={card.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
                                }}
                              />
                              <div className="absolute top-2 right-2 flex gap-1">
                                {card.featured && (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                    ⭐ Featured
                                  </span>
                                )}
                                {card.active ? (
                                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                    ✅ Active
                                  </span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-bold">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2">
                              <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                                {card.title}
                              </h4>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                                  {card.category}
                                </span>
                                <span className="text-gray-500">{card.badge}</span>
                              </div>
                              <p className="text-xs text-gray-500">{card.state}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <label className="text-gray-600">Order:</label>
                                <input
                                  type="number"
                                  value={card.displayOrder}
                                  onChange={(e) => {
                                    const order = parseInt(e.target.value);
                                    if (!isNaN(order)) {
                                      destOrderMutation.mutate({ id: card.id, order });
                                    }
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                />
                              </div>

                              {/* Actions */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={() => destFeatureMutation.mutate(card.id)}
                                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                                    card.featured
                                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  ⭐ Feature
                                </button>
                                <button
                                  onClick={() => destToggleMutation.mutate(card.id)}
                                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                                    card.active
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  👁 Toggle
                                </button>
                                <button
                                  onClick={() => handleEditDestCard(card)}
                                  className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete "${card.title}"?`)) {
                                      destDeleteMutation.mutate(card.id);
                                    }
                                  }}
                                  className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium px-3 py-1.5 rounded-lg transition"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ─── Destination Card Add/Edit Panel ─── */}
              {destPanelOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                  <div
                    className="absolute inset-0 bg-black/30"
                    onClick={() => {
                      setDestPanelOpen(false);
                      setEditingDestCard(null);
                      resetDestForm();
                    }}
                  />
                  <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-slideIn">
                    <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                      <h3 className="text-lg font-bold text-gray-800">
                        {editingDestCard ? "Edit Destination Card" : "Add Destination Card"}
                      </h3>
                      <button
                        onClick={() => {
                          setDestPanelOpen(false);
                          setEditingDestCard(null);
                          resetDestForm();
                        }}
                        className="text-gray-400 hover:text-gray-600 text-xl"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-6 space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          value={destForm.title}
                          onChange={(e) =>
                            setDestForm({ ...destForm, title: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          placeholder="Goa — Beach Paradise"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destination City *
                        </label>
                        <CityCombobox
                          value={destForm.destination}
                          onChange={(val) =>
                            setDestForm({ ...destForm, destination: val })
                          }
                          placeholder="Select destination city"
                          label=""
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          City name that links to flight search
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          value={destForm.state}
                          onChange={(e) =>
                            setDestForm({ ...destForm, state: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          placeholder="Goa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tagline *
                        </label>
                        <input
                          value={destForm.tagline}
                          onChange={(e) =>
                            setDestForm({ ...destForm, tagline: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          placeholder="Sun, sand & sea awaits"
                        />
                        <p className="text-xs text-gray-500 mt-1">Short catchy line</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={destForm.description}
                          onChange={(e) =>
                            setDestForm({ ...destForm, description: e.target.value })
                          }
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          placeholder="2-3 sentences about the destination..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL *
                        </label>
                        <input
                          value={destForm.imageUrl}
                          onChange={(e) =>
                            setDestForm({ ...destForm, imageUrl: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Use Unsplash: https://images.unsplash.com/photo-ID?w=800&q=80
                        </p>
                        {destForm.imageUrl && (
                          <img
                            src={destForm.imageUrl}
                            alt="Preview"
                            className="rounded-xl h-32 w-full object-cover mt-2"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                          </label>
                          <select
                            value={destForm.category}
                            onChange={(e) =>
                              setDestForm({ ...destForm, category: e.target.value })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm bg-white"
                          >
                            <option value="Beach">Beach</option>
                            <option value="Hills">Hills</option>
                            <option value="Heritage">Heritage</option>
                            <option value="Honeymoon">Honeymoon</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Spiritual">Spiritual</option>
                            <option value="Wildlife">Wildlife</option>
                            <option value="City Break">City Break</option>
                            <option value="Weekend Getaway">Weekend Getaway</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Display Order
                          </label>
                          <input
                            type="number"
                            value={destForm.displayOrder}
                            onChange={(e) =>
                              setDestForm({
                                ...destForm,
                                displayOrder: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Badge *
                        </label>
                        <input
                          value={destForm.badge}
                          onChange={(e) =>
                            setDestForm({ ...destForm, badge: e.target.value })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none text-sm"
                          placeholder="🔥 Trending"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Examples: 🔥 Trending, 💕 Honeymoon Special, 🏔 Adventure
                        </p>
                      </div>
                      <div className="space-y-3 pt-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={destForm.featured}
                            onChange={(e) =>
                              setDestForm({ ...destForm, featured: e.target.checked })
                            }
                            className="w-5 h-5 text-sky-600 focus:ring-sky-500 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            ⭐ Featured (larger card on homepage)
                          </span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={destForm.active}
                            onChange={(e) =>
                              setDestForm({ ...destForm, active: e.target.checked })
                            }
                            className="w-5 h-5 text-sky-600 focus:ring-sky-500 rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            ✅ Active (visible on homepage)
                          </span>
                        </label>
                      </div>
                      <button
                        onClick={handleSubmitDestCard}
                        disabled={
                          destCreateMutation.isPending || destUpdateMutation.isPending
                        }
                        className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                      >
                        {destCreateMutation.isPending || destUpdateMutation.isPending
                          ? "Saving..."
                          : editingDestCard
                          ? "💾 Update Card"
                          : "➕ Create Card"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/** Stat card component */
function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-sky-500">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{typeof value === "number" ? value.toLocaleString("en-IN") : value}</p>
        </div>
        <div className={`${color} text-white p-3 rounded-lg text-xl`}>{icon}</div>
      </div>
    </div>
  );
}

/** Expandable user row with accordion bookings table */
function UserRow({
  user: u,
  index,
  roleBadge,
  bookingCount,
  isExpanded,
  userBookings,
  onToggleExpand,
  onStatusSaved,
}: {
  user: UserResponse;
  index: number;
  roleBadge: string;
  bookingCount: number;
  isExpanded: boolean;
  userBookings: BookingResponse[];
  onToggleExpand: () => void;
  onStatusSaved: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleBookings = showAll ? userBookings : userBookings.slice(0, 5);

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-3 text-gray-500">{index}</td>
        <td className="px-6 py-3 font-medium">{u.name}</td>
        <td className="px-6 py-3 text-gray-600 text-xs">{u.email}</td>
        <td className="px-6 py-3">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${roleBadge}`}>
            {u.role}
          </span>
        </td>
        <td className="px-6 py-3 font-medium">{bookingCount}</td>
        <td className="px-6 py-3">
          {bookingCount > 0 && (
            <button
              onClick={onToggleExpand}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-sky-100 text-sky-700 hover:bg-sky-200 transition flex items-center gap-1"
            >
              {isExpanded ? "▲ Hide" : "👁 View Bookings"}
            </button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="px-6 py-4 bg-gray-50">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Flight No</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Route</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Seats</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Total Price</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Status</th>
                    <th className="px-4 py-2 font-semibold text-gray-600 text-xs">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((b) => {
                    return (
                      <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono text-xs">{b.flightNumber}</td>
                        <td className="px-4 py-2 text-xs">
                          {b.source} → {b.destination}
                        </td>
                        <td className="px-4 py-2 text-xs">{b.numberOfSeats}</td>
                        <td className="px-4 py-2 text-xs font-bold text-sky-600">
                          ₹{b.totalPrice.toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-2">
                          <BookingStatusDropdown
                            bookingId={b.id}
                            currentStatus={b.status as "CONFIRMED" | "CANCELLED"}
                            onSaved={onStatusSaved}
                          />
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {new Date(b.bookingDate).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {userBookings.length > 5 && (
                <div className="px-4 py-2 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                  >
                    {showAll ? `▲ Show less` : `▼ Show all ${userBookings.length} bookings`}
                  </button>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/** Toggle switch used in the Locations table */
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-sky-500" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
