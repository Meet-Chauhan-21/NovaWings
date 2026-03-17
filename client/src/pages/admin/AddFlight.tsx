// src/pages/admin/AddFlight.tsx
// Admin form to add a new flight — dark MUI theme

import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFlight } from "../../services/flightService";
import type { FlightFormValues } from "../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AddIcon from "@mui/icons-material/Add";

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

  const handleSubmit = async (values: FlightFormValues, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    addMutation.mutate(values);
    setSubmitting(false);
  };

  const inputSx = (hasError: boolean) => ({
    width: "100%",
    px: 2,
    py: 1.5,
    background: "var(--nw-glass)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "var(--nw-border-strong)"}`,
    borderRadius: "10px",
    color: "var(--nw-text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    "&:focus": { borderColor: "var(--nw-primary)" },
    "&::placeholder": { color: "var(--nw-text-disabled)" },
  });

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
      {/* Back Button */}
      <IconButton
        onClick={() => navigate("/admin")}
        sx={{
          mb: 3,
          color: "var(--nw-text-secondary)",
          background: "var(--nw-border-soft)",
          border: "1px solid var(--nw-border-strong)",
          "&:hover": { background: "var(--nw-primary-10)", color: "var(--nw-primary)" },
        }}
      >
        <ArrowBackIcon fontSize="small" />
      </IconButton>

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: "var(--nw-primary-10)",
            border: "1px solid var(--nw-primary-20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FlightTakeoffIcon sx={{ color: "var(--nw-primary)", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--nw-text-primary)" }}>Add New Flight</Typography>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>Fill in the details to create a new flight</Typography>
        </Box>
      </Box>

      {/* Form Card */}
      <Paper
        sx={{
          background: "var(--nw-card)",
          border: "1px solid var(--nw-border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        <Box sx={{ height: 3, background: "linear-gradient(90deg, var(--nw-primary), var(--nw-secondary))" }} />
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Formik initialValues={initialValues} validationSchema={flightSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, touched, errors }) => (
              <Form>
                {/* Basic Info */}
                <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 4 }}>
                  <DarkField name="flightNumber" label="Flight Number" placeholder="NW-101" touched={touched} errors={errors} inputSx={inputSx} />
                  <DarkField name="airlineName" label="Airline Name" placeholder="NovaWings Air" touched={touched} errors={errors} inputSx={inputSx} />
                </Box>

                {/* Route */}
                <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                  Route
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 4 }}>
                  <DarkField name="source" label="Source" placeholder="Mumbai" touched={touched} errors={errors} inputSx={inputSx} />
                  <DarkField name="destination" label="Destination" placeholder="Delhi" touched={touched} errors={errors} inputSx={inputSx} />
                  <DarkField name="departureTime" label="Departure Time" type="datetime-local" touched={touched} errors={errors} inputSx={inputSx} />
                  <DarkField name="arrivalTime" label="Arrival Time" type="datetime-local" touched={touched} errors={errors} inputSx={inputSx} />
                </Box>

                {/* Pricing */}
                <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                  Capacity & Pricing
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 4 }}>
                  <DarkField name="price" label="Price (₹)" type="number" placeholder="4500" touched={touched} errors={errors} inputSx={inputSx} />
                  <DarkField name="availableSeats" label="Available Seats" type="number" placeholder="120" touched={touched} errors={errors} inputSx={inputSx} />
                </Box>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: "12px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    background: "linear-gradient(135deg, var(--nw-primary), var(--nw-primary-dark))",
                    color: "var(--nw-text-primary)",
                    "&:hover": { background: "linear-gradient(135deg, var(--nw-primary-dark), var(--nw-error))" },
                    "&:disabled": { opacity: 0.5 },
                  }}
                >
                  {isSubmitting ? "Adding Flight..." : "Add Flight"}
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Box>
  );
}

function DarkField({
  name,
  label,
  type = "text",
  placeholder,
  touched,
  errors,
  inputSx,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  touched: Record<string, boolean | undefined>;
  errors: Record<string, string | undefined>;
  inputSx: (hasError: boolean) => object;
}) {
  const hasError = !!(touched[name] && errors[name]);
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={name}
        sx={{ display: "block", color: "var(--nw-text-secondary)", fontSize: "0.8rem", fontWeight: 600, mb: 0.8 }}
      >
        {label}
      </Typography>
      <Field
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 16px",
          background: "var(--nw-glass)",
          border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "var(--nw-border-strong)"}`,
          borderRadius: "10px",
          color: "var(--nw-text-primary)",
          fontSize: "0.9rem",
          outline: "none",
          boxSizing: "border-box" as const,
        }}
      />
      <ErrorMessage name={name} component="p" className="text-red-400 text-xs mt-1" />
    </Box>
  );
}



