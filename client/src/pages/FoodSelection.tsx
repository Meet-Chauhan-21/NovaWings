import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import BackButton from "../components/ui/BackButton";
import ErrorMessage from "../components/ErrorMessage";
import BookingProgress from "../components/BookingProgress";
import foodService from "../services/foodService";
import type { FoodItem, FoodOrder, FoodOrderItem } from "../types";

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

function getDietBadge(dietType: FoodItem["dietType"]) {
  if (dietType === "VEG") return "bg-green-100 text-green-700";
  if (dietType === "NON_VEG") return "bg-red-100 text-red-700";
  if (dietType === "VEGAN") return "bg-gray-100 text-gray-700";
  return "bg-yellow-100 text-yellow-700";
}

function getDietDot(dietType: FoodItem["dietType"]) {
  if (dietType === "VEG") return "🟢";
  if (dietType === "NON_VEG") return "🔴";
  if (dietType === "VEGAN") return "⚪";
  return "🟡";
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

  // ⚠️ CRITICAL: All hooks must be at the top, before any conditional returns
  // Move useMemo hooks here with safe defaults
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

  // NOW we can do conditional returns after all hooks are called
  if (!bookingState || !flightId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-semibold mb-4">Booking information not available</p>
        <p className="text-gray-600 mb-6">Please select seats again to proceed with meal selection.</p>
        <button 
          onClick={() => navigate("/explore")} 
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          Go to Flights
        </button>
      </div>
    );
  }

  const confirmedState = bookingState;

  // Show loading spinner while fetching menu
  if (menuQuery.isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border border-sky-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold">Loading meal options...</p>
          <p className="text-sm text-gray-500 mt-2">Airline: {confirmedState.airlineName} | Class: {confirmedState.cabinClass}</p>
        </div>
      </div>
    );
  }

  // Show error message if menu fetch failed
  if (menuQuery.isError) {
    console.error("Menu query error:", menuQuery.error);
    const errorMsg = menuQuery.error instanceof Error ? menuQuery.error.message : 'Unknown error';
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-red-600 font-semibold mb-4">⚠️ Failed to Load Menu</p>
        <p className="text-gray-600 mb-6">{errorMsg}</p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate(`/select-seats/${flightId}?seats=${confirmedState.numberOfSeats}`)} 
            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  // Validate menu data structure
  if (!menuQuery.data) {
    console.error("Menu data is empty");
    return (
      <ErrorMessage message="No menu data received from server. Please try again." />
    );
  }

  const menu = menuQuery.data;
  
  if (!Array.isArray(menu.categories)) {
    console.error("Invalid menu structure - categories is not an array:", menu);
    return (
      <ErrorMessage message="Invalid menu data structure. Please refresh and try again." />
    );
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <BackButton to={`/select-seats/${flightId}?seats=${bookingState.numberOfSeats}`} label="Back to Seat Selection" />
      <BookingProgress activeStep={3} />

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Meals to Your Flight</h1>
        <p className="text-sm text-gray-600 mt-1">
          {bookingState.airlineName} {bookingState.flightNumber} | {bookingState.source} to {bookingState.destination} | {bookingState.numberOfSeats} Passenger(s)
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">Select meals for each passenger</p>
        <div className="flex flex-wrap gap-2">
          {foodOrders.map((order, index) => {
            const hasItems = order.items.length > 0;
            const active = index === selectedPassenger;
            return (
              <button
                key={order.seatNumber}
                onClick={() => setSelectedPassenger(index)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-sky-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Seat {order.seatNumber} {hasItems ? "●" : ""} - {order.passengerLabel}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {[
          { key: "all", label: "All" },
          { key: "VEG", label: "🟢 Veg" },
          { key: "NON_VEG", label: "🔴 Non-Veg" },
          { key: "VEGAN", label: "⚪ Vegan" },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setDietFilter(filter.key)}
            className={`px-3 py-1.5 rounded-full text-sm ${dietFilter === filter.key ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-2 rounded-lg text-sm ${activeCategory === "all" ? "bg-sky-600 text-white" : "bg-white border border-gray-300 text-gray-700"}`}
        >
          All Categories
        </button>
        {categories.map((group) => (
          <button
            key={group.category.id}
            onClick={() => setActiveCategory(group.category.id)}
            className={`px-3 py-2 rounded-lg text-sm ${
              activeCategory === group.category.id
                ? "bg-sky-600 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            {group.category.icon} {group.category.name}
          </button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500">
          No food items found for selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 pb-28">
          {filteredItems.map((item) => {
            const qty = getQty(item.id);
            const price = getCabinPrice(item, bookingState.cabinClass);
            const complimentary = confirmedState.cabinClass !== "Economy" && price === 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-sm ${
                  qty > 0 ? "border-sky-400 ring-2 ring-sky-100" : "border-gray-200"
                }`}
              >
                <div className="relative">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-40 object-cover" />
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getDietBadge(item.dietType)}`}>
                    {getDietDot(item.dietType)} {item.dietType.replace("_", " ")}
                  </span>
                  {qty > 0 && (
                    <span className="absolute left-0 top-0 bg-sky-500 text-white text-xs px-2 py-1 rounded-br-lg">
                      Added to your meal
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {item.newItem && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">New</span>}
                    {item.popular && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Popular</span>}
                  </div>
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {item.calories} cal • {item.weight}
                  </p>
                  {item.allergens.length > 0 && (
                    <p className="text-xs text-amber-700">Contains: {item.allergens.join(", ")}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-lg font-bold text-sky-700">
                      {complimentary ? "FREE" : `₹${price.toLocaleString("en-IN")}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updatePassengerItem(item, -1)}
                        className="h-8 w-8 rounded-lg border border-gray-300 text-gray-700"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center text-sm font-semibold">{qty}</span>
                      <button
                        onClick={() => {
                          if (qty >= 3) {
                            toast("Max quantity is 3");
                            return;
                          }
                          updatePassengerItem(item, 1);
                        }}
                        className="h-8 w-8 rounded-lg border border-gray-300 text-gray-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-sky-700">₹{foodTotal.toLocaleString("en-IN")} added</p>
            <p className="text-xs text-gray-500">{totalItems} item(s) across {bookingState.numberOfSeats} seat(s)</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
            >
              Skip - No Meals
            </button>
            <button
              onClick={handleContinue}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
            >
              Proceed to Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
