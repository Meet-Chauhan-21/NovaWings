import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/ui/BackButton";
import BookingProgress from "../components/BookingProgress";
import { useRazorpay } from "../hooks/useRazorpay";
import type { FoodOrder } from "../types";

interface PaymentPreviewState {
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
  foodOrders?: FoodOrder[];
  foodTotal?: number;
  mealSkipped?: boolean;
}

export default function PaymentPreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { initiatePayment, isProcessing } = useRazorpay();
  const state = location.state as PaymentPreviewState | undefined;

  const [acceptTerms, setAcceptTerms] = useState(true);
  const [acceptRefundRule, setAcceptRefundRule] = useState(true);

  if (!state) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Booking information not found.</p>
        <button onClick={() => navigate("/")} className="px-4 py-2 bg-sky-600 text-white rounded-lg">
          Go Home
        </button>
      </div>
    );
  }

  const confirmedState = state;

  const baseFare = confirmedState.basePrice * confirmedState.numberOfSeats;
  const taxes = Math.round(baseFare * 0.18);
  const convenienceFee = 199;
  const meals = confirmedState.foodTotal || 0;
  const grandTotal = confirmedState.totalBeforeFood + meals;

  const selectedMeals = useMemo(
    () => (confirmedState.foodOrders || []).filter((order) => order.items.length > 0),
    [confirmedState.foodOrders]
  );

  async function handlePay() {
    await initiatePayment({
      flightId: confirmedState.flightId,
      numberOfSeats: confirmedState.numberOfSeats,
      selectedSeats: confirmedState.selectedSeats,
      totalAmount: grandTotal,
      foodOrders: confirmedState.foodOrders || [],
      foodTotal: meals,
      mealSkipped: !!confirmedState.mealSkipped,
      flightDetails: {
        flightNumber: confirmedState.flightNumber,
        source: confirmedState.source,
        destination: confirmedState.destination,
        airlineName: confirmedState.airlineName,
      },
    });
  }

  const canPay = acceptTerms && acceptRefundRule && !isProcessing;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <BackButton to={`/select-food/${confirmedState.flightId}`} label="Back" />

      <BookingProgress activeStep={4} />

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Review Your Booking</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-2">Flight Summary</h2>
            <p className="text-gray-700">
              {state.airlineName} {state.flightNumber} | {state.source} to {state.destination}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(confirmedState.departureTime).toLocaleString("en-IN")} | {confirmedState.cabinClass}
            </p>
            <p className="text-sm text-gray-600 mt-2">Seats: {confirmedState.selectedSeats.join(", ")}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Meal Summary</h2>
            {confirmedState.mealSkipped || selectedMeals.length === 0 ? (
              <p className="text-sm text-gray-500">No meals selected for this flight.</p>
            ) : (
              <div className="space-y-4">
                {selectedMeals.map((order) => (
                  <div key={order.seatNumber} className="border border-amber-100 bg-amber-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-800">
                      Seat {order.seatNumber} - {order.passengerLabel}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-gray-700">
                      {order.items.map((item) => (
                        <li key={item.foodItemId} className="flex justify-between">
                          <span>
                            {item.foodItemName} x {item.quantity}
                          </span>
                          <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm font-semibold text-right mt-2">Subtotal: ₹{order.subtotal.toLocaleString("en-IN")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Price Breakdown</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Base Fare ({confirmedState.numberOfSeats} x ₹{confirmedState.basePrice.toLocaleString("en-IN")})</span><span>₹{baseFare.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Taxes & Fees (18%)</span><span>₹{taxes.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Convenience Fee</span><span>₹{convenienceFee.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span>Meals</span><span>₹{meals.toLocaleString("en-IN")}</span></div>
              <div className="border-t pt-3 mt-3 flex justify-between text-lg font-bold text-emerald-700">
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-3 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Payment Methods</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-gray-100 rounded">Card</span>
              <span className="px-2 py-1 bg-gray-100 rounded">UPI</span>
              <span className="px-2 py-1 bg-gray-100 rounded">Net Banking</span>
            </div>
            <p className="text-xs text-gray-500">All methods are processed securely by Razorpay.</p>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
              <span>I agree to the Terms & Conditions.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={acceptRefundRule} onChange={(e) => setAcceptRefundRule(e.target.checked)} />
              <span>No refund for cancellation less than 24 hours before departure.</span>
            </label>
            <button
              onClick={handlePay}
              disabled={!canPay}
              className={`w-full py-3 rounded-xl font-bold transition ${canPay ? "bg-sky-600 text-white hover:bg-sky-700" : "bg-gray-200 text-gray-500"}`}
            >
              {isProcessing ? "Processing..." : `Pay ₹${grandTotal.toLocaleString("en-IN")} Securely`}
            </button>
            <div className="text-xs text-gray-500 flex gap-3">
              <span>256-bit SSL</span>
              <span>Razorpay</span>
              <span>PCI DSS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
