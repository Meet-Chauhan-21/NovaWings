// src/pages/FoodSelection.tsx
// Meal selection page for booking flow — dark theme with MUI components

import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import ErrorMessage from "../components/ErrorMessage";
import BookingProgress from "../components/BookingProgress";
import foodService from "../services/foodService";
import type { FoodItem, FoodOrder, FoodOrderItem } from "../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";

interface FoodSelectionState {
  flightId: string;
  flightNumber: string;
  airlineName: string;
  source: string;
  destination: string;
  departureTime: string;
  numberOfSeats: number;
  selectedSeats: string[];
  cabinClass: string;
  basePrice: number;
  totalBeforeFood: number;
}

function getDietColor(dietType: FoodItem["dietType"]) {
  if (dietType === "VEG") return { bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", text: "#22C55E" };
  if (dietType === "NON_VEG") return { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#EF4444" };
  if (dietType === "VEGAN") return { bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.3)", text: "#9CA3AF" };
  return { bg: "rgba(234,179,8,0.1)", border: "rgba(234,179,8,0.3)", text: "#EAB308" };
}

function getCabinPrice(item: FoodItem, cabinClass: string) {
  if (cabinClass === "Business") return item.businessPrice;
  if (cabinClass === "First Class") return item.firstClassPrice;
  return item.economyPrice;
}

export default function FoodSelection() {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  let state = location.state as FoodSelectionState | undefined;

  // Fallback to sessionStorage if location.state is not available (page refresh)
  if (!state && typeof window !== "undefined") {
    const savedState = sessionStorage.getItem("foodSelectionState");
    if (savedState) {
      try {
        state = JSON.parse(savedState);
      } catch (e) {
        console.error("Error parsing saved state:", e);
      }
    }
  }

  // Save state to sessionStorage when it's available
  if (state && typeof window !== "undefined") {
    sessionStorage.setItem("foodSelectionState", JSON.stringify(state));
  }

  const bookingState = state;
  const seatNumbers = bookingState?.selectedSeats ?? [];

  const [selectedPassenger, setSelectedPassenger] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [dietFilter, setDietFilter] = useState<string>("all");
  const [foodOrders, setFoodOrders] = useState<FoodOrder[]>(
    seatNumbers.map((seat, index) => ({
      seatNumber: seat,
      passengerLabel: `Passenger ${index + 1}`,
      items: [],
      subtotal: 0,
    }))
  );

  // Update foodOrders when seatNumbers change (e.g., from sessionStorage recovery)
  useEffect(() => {
    if (seatNumbers.length > 0 && seatNumbers.length !== foodOrders.length) {
      setFoodOrders(
        seatNumbers.map((seat, index) => ({
          seatNumber: seat,
          passengerLabel: `Passenger ${index + 1}`,
          items: [],
          subtotal: 0,
        }))
      );
    }
  }, [seatNumbers.length]);

  const menuQuery = useQuery({
    queryKey: ["foodMenu", bookingState?.airlineName, bookingState?.cabinClass],
    queryFn: () => {
      console.log("Fetching food menu for:", bookingState?.airlineName, bookingState?.cabinClass);
      return foodService.getMenu(bookingState?.airlineName || "IndiGo", bookingState?.cabinClass || "Economy");
    },
    enabled: !!bookingState,
    retry: 2,
    gcTime: 0,
  });

  const categories = menuQuery.data?.categories || [];
  const currentOrder = foodOrders[selectedPassenger] || { items: [], subtotal: 0, seatNumber: '', passengerLabel: '' };

  const filteredItems = useMemo(() => {
    const items = categories
      .filter((group) => activeCategory === "all" || group.category.id === activeCategory)
      .flatMap((group) => group.items);

    if (dietFilter === "all") return items;
    return items.filter((item) => item.dietType === dietFilter);
  }, [categories, activeCategory, dietFilter]);

  const foodTotal = useMemo(
    () => foodOrders.reduce((sum, order) => sum + order.subtotal, 0),
    [foodOrders]
  );

  const totalItems = useMemo(
    () => foodOrders.reduce((sum, order) => sum + order.items.reduce((n, item) => n + item.quantity, 0), 0),
    [foodOrders]
  );

  console.log("FoodSelection - bookingState:", bookingState);
  console.log("FoodSelection - menuQuery:", { isLoading: menuQuery.isLoading, isError: menuQuery.isError, data: menuQuery.data });

  // Conditional returns after all hooks
  if (!bookingState || !flightId) {
    return (
      <Box sx={{ maxWidth: 600, mx: "auto", px: 3, py: 12, textAlign: "center" }}>
        <Typography sx={{ color: "#EF4444", fontWeight: 600, mb: 2 }}>Booking information not available</Typography>
        <Typography sx={{ color: "#6B7280", mb: 4, fontSize: "0.9rem" }}>Please select seats again to proceed with meal selection.</Typography>
        <Button variant="contained" onClick={() => navigate("/explore")} sx={{ borderRadius: "10px" }}>
          Go to Flights
        </Button>
      </Box>
    );
  }

  const confirmedState = bookingState;

  if (menuQuery.isLoading) {
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            border: "3px solid rgba(249,115,22,0.2)",
            borderTop: "3px solid #F97316",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            mb: 3,
            "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
          }}
        />
        <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>Loading meal options...</Typography>
        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", mt: 1 }}>
          {confirmedState.airlineName} | {confirmedState.cabinClass}
        </Typography>
      </Box>
    );
  }

  if (menuQuery.isError) {
    console.error("Menu query error:", menuQuery.error);
    const errorMsg = menuQuery.error instanceof Error ? menuQuery.error.message : 'Unknown error';
    return (
      <Box sx={{ maxWidth: 480, mx: "auto", px: 3, py: 12, textAlign: "center" }}>
        <Typography sx={{ color: "#EF4444", fontWeight: 600, mb: 2 }}>Failed to Load Menu</Typography>
        <Typography sx={{ color: "#6B7280", mb: 4, fontSize: "0.9rem" }}>{errorMsg}</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button variant="contained" fullWidth onClick={() => window.location.reload()} sx={{ borderRadius: "10px" }}>
            Retry
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => navigate(`/select-seats/${flightId}?seats=${confirmedState.numberOfSeats}`)}
            sx={{ borderRadius: "10px" }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (!menuQuery.data) {
    console.error("Menu data is empty");
    return <ErrorMessage message="No menu data received from server. Please try again." />;
  }

  const menu = menuQuery.data;

  if (!Array.isArray(menu.categories)) {
    console.error("Invalid menu structure - categories is not an array:", menu);
    return <ErrorMessage message="Invalid menu data structure. Please refresh and try again." />;
  }

  function updatePassengerItem(item: FoodItem, delta: number) {
    setFoodOrders((prev) => {
      const next = [...prev];
      const order = { ...next[selectedPassenger] };
      const price = getCabinPrice(item, confirmedState.cabinClass);
      const existing = order.items.find((food) => food.foodItemId === item.id);

      if (!existing && delta < 0) return prev;

      let updatedItems: FoodOrderItem[];
      if (!existing) {
        updatedItems = [
          ...order.items,
          {
            foodItemId: item.id,
            foodItemName: item.name,
            categoryName: item.categoryName,
            dietType: item.dietType,
            price,
            quantity: 1,
            imageUrl: item.imageUrl,
          },
        ];
      } else {
        const newQty = Math.max(0, Math.min(3, existing.quantity + delta));
        updatedItems = order.items
          .map((food) => (food.foodItemId === item.id ? { ...food, quantity: newQty } : food))
          .filter((food) => food.quantity > 0);
      }

      const subtotal = updatedItems.reduce((sum, food) => sum + food.price * food.quantity, 0);
      next[selectedPassenger] = { ...order, items: updatedItems, subtotal };
      return next;
    });
  }

  function getQty(itemId: string) {
    return currentOrder?.items.find((item) => item.foodItemId === itemId)?.quantity || 0;
  }

  function handleSkip() {
    navigate("/payment-preview", {
      state: {
        ...bookingState,
        flightId,
        foodOrders: [],
        foodTotal: 0,
        mealSkipped: true,
      },
    });
  }

  function handleContinue() {
    navigate("/payment-preview", {
      state: {
        ...bookingState,
        flightId,
        foodOrders,
        foodTotal,
        mealSkipped: false,
      },
    });
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 3, md: 5 }, pb: 16 }}>
      {/* Back button */}
      <IconButton
        onClick={() => navigate(`/select-seats/${flightId}?seats=${bookingState.numberOfSeats}`)}
        sx={{
          mb: 2,
          color: "#9CA3AF",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          "&:hover": { background: "rgba(249,115,22,0.1)", color: "#F97316" },
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      <BookingProgress activeStep={3} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Paper
          sx={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            p: { xs: 2.5, sm: 3.5 },
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <RestaurantMenuIcon sx={{ color: "#F97316", fontSize: 24 }} />
            <Typography sx={{ fontSize: { xs: "1.2rem", md: "1.4rem" }, fontWeight: 800, color: "#FFFFFF" }}>
              Add Meals to Your Flight
            </Typography>
          </Box>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
            {bookingState.airlineName} {bookingState.flightNumber} | {bookingState.source} to {bookingState.destination} | {bookingState.numberOfSeats} Passenger(s)
          </Typography>
        </Paper>
      </motion.div>

      {/* Passenger tabs */}
      <Paper
        sx={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "16px",
          p: 2.5,
          mb: 3,
        }}
      >
        <Typography sx={{ color: "#9CA3AF", fontSize: "0.8rem", fontWeight: 600, mb: 2 }}>
          Select meals for each passenger
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {foodOrders.map((order, index) => {
            const hasItems = order.items.length > 0;
            const active = index === selectedPassenger;
            return (
              <Chip
                key={order.seatNumber}
                label={`Seat ${order.seatNumber} ${hasItems ? "•" : ""} ${order.passengerLabel}`}
                onClick={() => setSelectedPassenger(index)}
                sx={{
                  borderRadius: "10px",
                  fontWeight: active ? 600 : 400,
                  fontSize: "0.8rem",
                  background: active
                    ? "linear-gradient(135deg, #F97316, #EA580C)"
                    : "rgba(255,255,255,0.04)",
                  color: active ? "#FFFFFF" : "#9CA3AF",
                  border: active ? "none" : "1px solid rgba(255,255,255,0.08)",
                  "&:hover": {
                    background: active
                      ? "linear-gradient(135deg, #F97316, #EA580C)"
                      : "rgba(255,255,255,0.08)",
                  },
                }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Diet + Category Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {[
          { key: "all", label: "All" },
          { key: "VEG", label: "Veg" },
          { key: "NON_VEG", label: "Non-Veg" },
          { key: "VEGAN", label: "Vegan" },
        ].map((filter) => (
          <Chip
            key={filter.key}
            label={filter.label}
            onClick={() => setDietFilter(filter.key)}
            size="small"
            sx={{
              borderRadius: "8px",
              fontSize: "0.8rem",
              background: dietFilter === filter.key
                ? "linear-gradient(135deg, #F97316, #EA580C)"
                : "rgba(255,255,255,0.04)",
              color: dietFilter === filter.key ? "#FFFFFF" : "#9CA3AF",
              border: dietFilter === filter.key ? "none" : "1px solid rgba(255,255,255,0.08)",
              "&:hover": {
                background: dietFilter === filter.key
                  ? "linear-gradient(135deg, #F97316, #EA580C)"
                  : "rgba(255,255,255,0.08)",
              },
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        <Chip
          label="All Categories"
          onClick={() => setActiveCategory("all")}
          size="small"
          sx={{
            borderRadius: "8px",
            fontSize: "0.8rem",
            background: activeCategory === "all"
              ? "linear-gradient(135deg, #F97316, #EA580C)"
              : "rgba(255,255,255,0.04)",
            color: activeCategory === "all" ? "#FFFFFF" : "#9CA3AF",
            border: activeCategory === "all" ? "none" : "1px solid rgba(255,255,255,0.08)",
            "&:hover": {
              background: activeCategory === "all"
                ? "linear-gradient(135deg, #F97316, #EA580C)"
                : "rgba(255,255,255,0.08)",
            },
          }}
        />
        {categories.map((group) => (
          <Chip
            key={group.category.id}
            label={`${group.category.icon} ${group.category.name}`}
            onClick={() => setActiveCategory(group.category.id)}
            size="small"
            sx={{
              borderRadius: "8px",
              fontSize: "0.8rem",
              background: activeCategory === group.category.id
                ? "linear-gradient(135deg, #F97316, #EA580C)"
                : "rgba(255,255,255,0.04)",
              color: activeCategory === group.category.id ? "#FFFFFF" : "#9CA3AF",
              border: activeCategory === group.category.id ? "none" : "1px solid rgba(255,255,255,0.08)",
              "&:hover": {
                background: activeCategory === group.category.id
                  ? "linear-gradient(135deg, #F97316, #EA580C)"
                  : "rgba(255,255,255,0.08)",
              },
            }}
          />
        ))}
      </Box>

      {/* Food Items Grid */}
      {filteredItems.length === 0 ? (
        <Paper
          sx={{
            background: "#111111",
            border: "1px dashed rgba(255,255,255,0.1)",
            borderRadius: "16px",
            p: 8,
            textAlign: "center",
          }}
        >
          <Typography sx={{ color: "#6B7280" }}>No food items found for selected filters.</Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", xl: "1fr 1fr 1fr" }, gap: 2.5 }}>
          {filteredItems.map((item) => {
            const qty = getQty(item.id);
            const price = getCabinPrice(item, bookingState.cabinClass);
            const complimentary = confirmedState.cabinClass !== "Economy" && price === 0;
            const dietColors = getDietColor(item.dietType);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Paper
                  sx={{
                    background: "#111111",
                    border: qty > 0
                      ? "1px solid rgba(249,115,22,0.3)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      border: "1px solid rgba(255,255,255,0.12)",
                    },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: "relative" }}>
                    <Box
                      component="img"
                      src={item.imageUrl}
                      alt={item.name}
                      sx={{ width: "100%", height: 160, objectFit: "cover" }}
                    />
                    {/* Diet badge */}
                    <Chip
                      label={item.dietType.replace("_", " ")}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background: dietColors.bg,
                        border: `1px solid ${dietColors.border}`,
                        color: dietColors.text,
                        fontWeight: 600,
                        fontSize: "0.65rem",
                      }}
                    />
                    {qty > 0 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          background: "linear-gradient(135deg, #F97316, #EA580C)",
                          color: "#FFFFFF",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          px: 1.5,
                          py: 0.5,
                          borderBottomRightRadius: "10px",
                        }}
                      >
                        Added
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ p: 2.5 }}>
                    {/* Tags */}
                    <Box sx={{ display: "flex", gap: 0.8, mb: 1 }}>
                      {item.newItem && (
                        <Chip label="New" size="small" sx={{ background: "rgba(16,185,129,0.1)", color: "#10B981", fontSize: "0.65rem", height: 22 }} />
                      )}
                      {item.popular && (
                        <Chip label="Popular" size="small" sx={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", fontSize: "0.65rem", height: 22 }} />
                      )}
                    </Box>

                    <Typography sx={{ color: "#FFFFFF", fontWeight: 600, fontSize: "0.95rem", mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#6B7280",
                        fontSize: "0.8rem",
                        lineHeight: 1.5,
                        mb: 1,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.description}
                    </Typography>
                    <Typography sx={{ color: "#4B5563", fontSize: "0.75rem", mb: 0.5 }}>
                      {item.calories} cal • {item.weight}
                    </Typography>
                    {item.allergens.length > 0 && (
                      <Typography sx={{ color: "#F59E0B", fontSize: "0.7rem", mb: 1.5 }}>
                        Contains: {item.allergens.join(", ")}
                      </Typography>
                    )}

                    {/* Price + Controls */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.05rem",
                          background: complimentary
                            ? "linear-gradient(135deg, #10B981, #059669)"
                            : "linear-gradient(135deg, #F97316, #F59E0B)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {complimentary ? "FREE" : `₹${price.toLocaleString("en-IN")}`}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton
                          onClick={() => updatePassengerItem(item, -1)}
                          size="small"
                          sx={{
                            width: 32,
                            height: 32,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#9CA3AF",
                            "&:hover": { background: "rgba(255,255,255,0.08)" },
                          }}
                        >
                          <RemoveIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <Typography sx={{ color: "#FFFFFF", fontWeight: 700, fontSize: "0.9rem", minWidth: 20, textAlign: "center" }}>
                          {qty}
                        </Typography>
                        <IconButton
                          onClick={() => {
                            if (qty >= 3) {
                              toast("Max quantity is 3");
                              return;
                            }
                            updatePassengerItem(item, 1);
                          }}
                          size="small"
                          sx={{
                            width: 32,
                            height: 32,
                            background: "rgba(249,115,22,0.1)",
                            border: "1px solid rgba(249,115,22,0.2)",
                            color: "#F97316",
                            "&:hover": { background: "rgba(249,115,22,0.2)" },
                          }}
                        >
                          <AddIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            );
          })}
        </Box>
      )}

      {/* Fixed bottom bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#111111",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          py: 2,
          px: 3,
          zIndex: 30,
          backdropFilter: "blur(20px)",
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                background: "linear-gradient(135deg, #F97316, #F59E0B)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ₹{foodTotal.toLocaleString("en-IN")} added
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>
              {totalItems} item(s) across {bookingState.numberOfSeats} seat(s)
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              onClick={handleSkip}
              variant="outlined"
              sx={{
                borderRadius: "10px",
                borderColor: "rgba(255,255,255,0.12)",
                color: "#9CA3AF",
                fontSize: "0.85rem",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.04)",
                },
              }}
            >
              Skip Meals
            </Button>
            <Button
              onClick={handleContinue}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.85rem",
                background: "linear-gradient(135deg, #F97316, #EA580C)",
                "&:hover": {
                  background: "linear-gradient(135deg, #EA580C, #DC2626)",
                },
              }}
            >
              Proceed to Review
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
