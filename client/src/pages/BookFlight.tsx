// src/pages/BookFlight.tsx
// Booking form page — shows flight summary and allows seat selection

import { useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage as FormikError } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { getFlightById } from "../services/flightService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMsg from "../components/ErrorMessage";

/**
 * BookFlight page displays a flight summary and a form to select number of seats.
 * On submit, navigates to the seat selection page.
 * Pre-fills seat count from passengers query param if available.
 */
export default function BookFlight() {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultSeats = parseInt(searchParams.get("passengers") || "1");

  const { data: flight, isLoading, isError } = useQuery({
    queryKey: ["flight", flightId],
    queryFn: () => getFlightById(flightId!),
    enabled: !!flightId,
  });

  /** Dynamic Yup schema that depends on available seats */
  const bookingSchema = useMemo(() => {
    return Yup.object().shape({
      numberOfSeats: Yup.number()
        .required("Number of seats is required")
        .min(1, "At least 1 seat required")
        .max(flight?.availableSeats ?? 1, `Maximum ${flight?.availableSeats ?? 1} seats available`),
    });
  }, [flight?.availableSeats]);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMsg message="Failed to load flight details." />;
  if (!flight) return <ErrorMsg message="Flight not found." />;

  /** Format an ISO date string to a readable format */
  const formatDateTime = (iso: string): string => {
    return new Date(iso).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Flight Summary */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Flight Summary</h2>
        <div className="flex items-center gap-3 mb-3 text-gray-800 font-medium">
          <span className="text-sky-600 font-bold">{flight.airlineName}</span>
          <span className="text-gray-400 font-mono text-sm">{flight.flightNumber}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700 mb-3">
          <span className="font-medium">{flight.source}</span>
          <span className="text-sky-500">→</span>
          <span className="font-medium">{flight.destination}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{formatDateTime(flight.departureTime)} — {formatDateTime(flight.arrivalTime)}</span>
          <span className="font-bold text-sky-600">₹{flight.price.toLocaleString("en-IN")} / seat</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">💺 {flight.availableSeats} seats available</p>
      </div>

      {/* Booking Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Book Your Seats</h2>

        <Formik
          initialValues={{ numberOfSeats: defaultSeats }}
          validationSchema={bookingSchema}
          onSubmit={async (values, { setSubmitting }) => {
            navigate(`/select-seats/${flight.id}?seats=${values.numberOfSeats}`);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, values, touched, errors }) => {
            const totalPrice = values.numberOfSeats * flight.price;
            return (
              <Form className="space-y-5">
                <div>
                  <label htmlFor="numberOfSeats" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Seats
                  </label>
                  <Field
                    id="numberOfSeats"
                    name="numberOfSeats"
                    type="number"
                    min={1}
                    max={flight.availableSeats}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none ${
                      touched.numberOfSeats && errors.numberOfSeats ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  <FormikError name="numberOfSeats" component="p" className="text-red-500 text-sm mt-1" />
                </div>

                {/* Live total price calculation */}
                <div className="bg-sky-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-gray-700 font-medium">Total Price</span>
                  <span className="text-2xl font-bold text-sky-600">
                    ₹{(totalPrice > 0 ? totalPrice : 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Booking..." : "Confirm Booking"}
                </button>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
