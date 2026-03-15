// src/components/BookingProgress.tsx
// MUI Stepper component for booking flow with custom dark theme styling

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AirlineSeatReclineExtraIcon from "@mui/icons-material/AirlineSeatReclineExtra";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface BookingProgressProps {
  activeStep: number;
}

const STEPS = [
  { label: "Passengers", icon: PersonOutlineIcon },
  { label: "Seats", icon: AirlineSeatReclineExtraIcon },
  { label: "Meals", icon: RestaurantMenuIcon },
  { label: "Review", icon: ReceiptLongIcon },
  { label: "Payment", icon: PaymentIcon },
];

function CustomStepIcon({
  active,
  completed,
  icon,
}: {
  active: boolean;
  completed: boolean;
  icon: React.ReactNode;
}) {
  const stepIndex = Number(icon) - 1;
  const StepIcon = STEPS[stepIndex]?.icon;

  if (completed) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F97316, #EA580C)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckCircleIcon sx={{ color: "#fff", fontSize: 22 }} />
      </Box>
    );
  }

  if (active) {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #F97316, #F59E0B)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 0 4px rgba(249,115,22,0.2)",
          animation: "pulse 2s ease-in-out infinite",
          "@keyframes pulse": {
            "0%, 100%": { boxShadow: "0 0 0 4px rgba(249,115,22,0.2)" },
            "50%": { boxShadow: "0 0 0 8px rgba(249,115,22,0.1)" },
          },
        }}
      >
        {StepIcon && <StepIcon sx={{ color: "#fff", fontSize: 20 }} />}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6B7280",
      }}
    >
      <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
        {Number(icon)}
      </Typography>
    </Box>
  );
}

export default function BookingProgress({ activeStep }: BookingProgressProps) {
  // Map external step numbers (1-5) to internal index (0-4)
  const stepIndex = activeStep - 1;

  return (
    <Box
      sx={{
        background: "#111111",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        p: { xs: 2.5, sm: 3.5 },
        mb: 3,
      }}
    >
      <Stepper
        activeStep={stepIndex}
        alternativeLabel
        sx={{
          "& .MuiStepConnector-line": {
            borderTopStyle: "dashed",
            borderTopWidth: 2,
            borderColor: "rgba(255,255,255,0.1)",
          },
          "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": {
            borderColor: "#F97316",
            borderTopStyle: "solid",
          },
          "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
            borderColor: "#F97316",
            borderTopStyle: "solid",
          },
        }}
      >
        {STEPS.map((step, index) => (
          <Step key={step.label} completed={index < stepIndex}>
            <StepLabel
              StepIconComponent={(props) => (
                <CustomStepIcon
                  active={props.active ?? false}
                  completed={props.completed ?? false}
                  icon={props.icon}
                />
              )}
            >
              <Typography
                sx={{
                  fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  fontWeight: index === stepIndex ? 600 : 400,
                  color:
                    index < stepIndex
                      ? "#F97316"
                      : index === stepIndex
                        ? "#FFFFFF"
                        : "#6B7280",
                  mt: 0.5,
                }}
              >
                {step.label}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
