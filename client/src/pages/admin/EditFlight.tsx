// src/pages/admin/EditFlight.tsx
// Admin form to edit an existing flight, pre-populated with current values

import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage as FormikError } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFlightById, updateFlight } from "../../services/flightService";
import type { FlightFormValues } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMsg from "../../components/ErrorMessage";

/** Yup validation schema for the flight form */
const flightSchema = Yup.object().shape({
  flightNumber: Yup.string().required("Flight number is required"),
  airlineName: Yup.string().required("Airline name is required"),
  source: Yup.string().required("Source is required"),
  destination: Yup.string().required("Destination is required"),
  departureTime: Yup.string().required("Departure time is required"),
  arrivalTime: Yup.string().required("Arrival time is required"),
  price: Yup.number().typeError("Price must be a number").required("Price is required").min(1, "Price must be at least ₹1"),
  availableSeats: Yup.number().typeError("Seats must be a number").required("Available seats is required").min(1, "At least 1 seat required"),
});

/**
 * EditFlight page fetches existing flight data, pre-populates the form,
 * and submits updates via PUT request.
 */
export default function EditFlight() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: flight, isLoading, isError } = useQuery({
    queryKey: ["flight", id],
    queryFn: () => getFlightById(id!),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (values: FlightFormValues) => updateFlight(id!, values),
    onSuccess: () => {
      toast.success("Flight updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["flights"] });
      queryClient.invalidateQueries({ queryKey: ["flight", id] });
      navigate("/admin/flights");
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to update flight.";
      toast.error(message);
    },
  });

  /** Handle form submission */
  const handleSubmit = async (values: FlightFormValues, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    updateMutation.mutate(values);
    setSubmitting(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMsg message="Failed to load flight data." />;
  if (!flight) return <ErrorMsg message="Flight not found." />;

  const initialValues: FlightFormValues = {
    flightNumber: flight.flightNumber,
    airlineName: flight.airlineName,
    source: flight.source,
    destination: flight.destination,
    departureTime: flight.departureTime.slice(0, 16),
    arrivalTime: flight.arrivalTime.slice(0, 16),
    price: flight.price,
    availableSeats: flight.availableSeats,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Flight</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <Formik initialValues={initialValues} validationSchema={flightSchema} onSubmit={handleSubmit} enableReinitialize>
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <EditField name="flightNumber" label="Flight Number" touched={touched} errors={errors} />
                <EditField name="airlineName" label="Airline Name" touched={touched} errors={errors} />
                <EditField name="source" label="Source" touched={touched} errors={errors} />
                <EditField name="destination" label="Destination" touched={touched} errors={errors} />
                <EditField name="departureTime" label="Departure Time" type="datetime-local" touched={touched} errors={errors} />
                <EditField name="arrivalTime" label="Arrival Time" type="datetime-local" touched={touched} errors={errors} />
                <EditField name="price" label="Price (₹)" type="number" touched={touched} errors={errors} />
                <EditField name="availableSeats" label="Available Seats" type="number" touched={touched} errors={errors} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating Flight..." : "Update Flight"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

/** Reusable form field component for the edit flight form */
function EditField({
  name,
  label,
  type = "text",
  touched,
  errors,
}: {
  name: string;
  label: string;
  type?: string;
  touched: Record<string, boolean | undefined>;
  errors: Record<string, string | undefined>;
}) {
  const hasError = touched[name] && errors[name];
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type={type}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none ${
          hasError ? "border-red-400" : "border-gray-200"
        }`}
      />
      <FormikError name={name} component="p" className="text-red-500 text-sm mt-1" />
    </div>
  );
}
