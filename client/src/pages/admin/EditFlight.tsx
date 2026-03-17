// src/pages/admin/EditFlight.tsx
// Admin form to edit an existing flight — dark MUI theme

import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage as FormikError } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFlightById, updateFlight } from "../../services/flightService";
import type { FlightFormValues } from "../../types";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMsg from "../../components/ErrorMessage";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/Save";

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
    <Box sx={{ maxWidth: 720, mx: "auto", px: { xs: 2, md: 3 }, py: { xs: 4, md: 6 } }}>
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
          <EditOutlinedIcon sx={{ color: "var(--nw-primary)", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--nw-text-primary)" }}>Edit Flight</Typography>
          <Typography sx={{ color: "var(--nw-text-muted)", fontSize: "0.85rem" }}>
            {flight.flightNumber} — {flight.airlineName}
          </Typography>
        </Box>
      </Box>

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
          <Formik initialValues={initialValues} validationSchema={flightSchema} onSubmit={handleSubmit} enableReinitialize>
            {({ isSubmitting, touched, errors }) => (
              <Form>
                <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                  Basic Information
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 4 }}>
                  <EditField name="flightNumber" label="Flight Number" touched={touched} errors={errors} />
                  <EditField name="airlineName" label="Airline Name" touched={touched} errors={errors} />
                </Box>

                <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                  Route
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 4 }}>
                  <EditField name="source" label="Source" touched={touched} errors={errors} />
                  <EditField name="destination" label="Destination" touched={touched} errors={errors} />
                  <EditField name="departureTime" label="Departure Time" type="datetime-local" touched={touched} errors={errors} />
                  <EditField name="arrivalTime" label="Arrival Time" type="datetime-local" touched={touched} errors={errors} />
                </Box>

                <Typography sx={{ color: "var(--nw-primary)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", mb: 2 }}>
                  Capacity & Pricing
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5, mb: 4 }}>
                  <EditField name="price" label="Price (₹)" type="number" touched={touched} errors={errors} />
                  <EditField name="availableSeats" label="Available Seats" type="number" touched={touched} errors={errors} />
                </Box>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  fullWidth
                  startIcon={<SaveIcon />}
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
                  {isSubmitting ? "Updating Flight..." : "Update Flight"}
                </Button>
              </Form>
            )}
          </Formik>
        </Box>
      </Paper>
    </Box>
  );
}

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
      <FormikError name={name} component="p" className="text-red-400 text-xs mt-1" />
    </Box>
  );
}



