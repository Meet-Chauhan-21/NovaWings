// src/pages/admin/AddFlight.tsx
// Admin form to add a new flight using Formik + Yup

import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFlight } from "../../services/flightService";
import BackButton from "../../components/ui/BackButton";
import type { FlightFormValues } from "../../types";

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
 * AddFlight page provides a Formik form for admins to create a new flight.
 * On success, navigates to the manage flights page.
 */
export default function AddFlight() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (values: FlightFormValues) => createFlight(values),
    onSuccess: () => {
      toast.success("Flight added successfully!");
      queryClient.invalidateQueries({ queryKey: ["flights"] });
      navigate("/admin/flights");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to add flight.";
      toast.error(message);
    },
  });

  const initialValues: FlightFormValues = {
    flightNumber: "",
    airlineName: "",
    source: "",
    destination: "",
    departureTime: "",
    arrivalTime: "",
    price: 0,
    availableSeats: 0,
  };

  /** Handle form submission */
  const handleSubmit = async (values: FlightFormValues, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    addMutation.mutate(values);
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 page-enter">
      <div className="mb-4">
        <BackButton to="/admin" label="Dashboard" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Add New Flight</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <Formik initialValues={initialValues} validationSchema={flightSchema} onSubmit={handleSubmit}>
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FlightField name="flightNumber" label="Flight Number" placeholder="NW-101" touched={touched} errors={errors} />
                <FlightField name="airlineName" label="Airline Name" placeholder="NovaWings Air" touched={touched} errors={errors} />
                <FlightField name="source" label="Source" placeholder="Mumbai" touched={touched} errors={errors} />
                <FlightField name="destination" label="Destination" placeholder="Delhi" touched={touched} errors={errors} />
                <FlightField name="departureTime" label="Departure Time" type="datetime-local" touched={touched} errors={errors} />
                <FlightField name="arrivalTime" label="Arrival Time" type="datetime-local" touched={touched} errors={errors} />
                <FlightField name="price" label="Price (₹)" type="number" placeholder="4500" touched={touched} errors={errors} />
                <FlightField name="availableSeats" label="Available Seats" type="number" placeholder="120" touched={touched} errors={errors} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-sky-500 text-white py-3 rounded-xl hover:bg-sky-600 transition hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Adding Flight..." : "Add Flight"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

/** Reusable form field component for the flight form */
function FlightField({
  name,
  label,
  type = "text",
  placeholder,
  touched,
  errors,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none ${
          hasError ? "border-red-400" : "border-gray-200"
        }`}
      />
      <ErrorMessage name={name} component="p" className="text-red-500 text-sm mt-1" />
    </div>
  );
}
