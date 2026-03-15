// tabs/PaymentsTab.tsx
import { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Pagination from "../../../components/Pagination";
import type { PaymentRecord } from "../../../types";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";

import CloseIcon from "@mui/icons-material/Close";

interface PaymentsTabProps {
  allPayments: PaymentRecord[];
  paymentsQuery: { isLoading: boolean };
  totalRevenueFromPayments: number;
}

export default function PaymentsTab({
  allPayments,
  paymentsQuery,
  totalRevenueFromPayments,
}: PaymentsTabProps) {
  const [payStatusFilter, setPayStatusFilter] = useState<"all" | "SUCCESS" | "FAILED" | "PENDING">("all");
  const [paySearch, setPaySearch] = useState("");
  const [payPage, setPayPage] = useState(1);
  const [payPageSize, setPayPageSize] = useState(20);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const paymentStats = useMemo(() => {
    const success = allPayments.filter((p) => p.status === "SUCCESS").length;
    const failed = allPayments.filter((p) => p.status === "FAILED").length;
    const pending = allPayments.filter((p) => p.status === "PENDING").length;
    return { success, failed, pending };
  }, [allPayments]);

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

  const filteredPayments = useMemo(() => {
    let result = allPayments;
    if (payStatusFilter !== "all") {
      result = result.filter((p) => p.status === payStatusFilter);
    }
    if (paySearch) {
      const q = paySearch.toLowerCase();
      result = result.filter(
        (p) =>
          (p.razorpayPaymentId?.toLowerCase().includes(q) ?? false) ||
          (p.razorpayOrderId?.toLowerCase().includes(q) ?? false) ||
          p.userEmail.toLowerCase().includes(q) ||
          p.flightNumber.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [allPayments, payStatusFilter, paySearch]);

  useEffect(() => { setPayPage(1); }, [payStatusFilter, paySearch, payPageSize]);

  const paginatedPayments = useMemo(() => {
    const start = (payPage - 1) * payPageSize;
    return filteredPayments.slice(start, start + payPageSize);
  }, [filteredPayments, payPage, payPageSize]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 800, color: "#FFFFFF" }}>Payment Management</Typography>
        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", mt: 0.5 }}>Track all Razorpay transactions and revenue</Typography>
      </Box>

      {/* Payment Stat Cards */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, 1fr)" }, gap: 3 }}>
        <Paper elevation={0} sx={{ background: "linear-gradient(135deg, #F97316, #EA580C)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.85rem", fontWeight: 600 }}>Total Revenue</Typography>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1.875rem", fontWeight: 800, mt: 0.5 }}>₹{totalRevenueFromPayments.toLocaleString("en-IN")}</Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem", mt: 1 }}>From {paymentStats.success} successful payments</Typography>
        </Paper>
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", fontWeight: 600 }}>Successful</Typography>
          <Typography sx={{ color: "#22C55E", fontSize: "1.875rem", fontWeight: 800, mt: 0.5 }}>{paymentStats.success}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", fontWeight: 600 }}>Failed</Typography>
          <Typography sx={{ color: "#EF4444", fontSize: "1.875rem", fontWeight: 800, mt: 0.5 }}>{paymentStats.failed}</Typography>
        </Paper>
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "#6B7280", fontSize: "0.85rem", fontWeight: 600 }}>Pending</Typography>
          <Typography sx={{ color: "#F59E0B", fontSize: "1.875rem", fontWeight: 800, mt: 0.5 }}>{paymentStats.pending}</Typography>
        </Paper>
      </Box>

      {/* Revenue Chart */}
      {paymentRevenueData.length > 0 && (
        <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", p: 3 }}>
          <Typography sx={{ color: "#FFFFFF", fontSize: "1rem", fontWeight: 700, mb: 2.5 }}>Payment Revenue (Last 14 days)</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={paymentRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
                contentStyle={{ background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#FFFFFF" }}
                labelStyle={{ color: "#9CA3AF" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#F97316" strokeWidth={3} dot={{ r: 5, fill: "#F97316" }} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={payStatusFilter}
            onChange={(e) => setPayStatusFilter(e.target.value as typeof payStatusFilter)}
            sx={{
              background: "rgba(255,255,255,0.04)",
              borderRadius: "12px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(249,115,22,0.4)" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F97316" },
              "& .MuiSvgIcon-root": { color: "#6B7280" },
            }}
            MenuProps={{ PaperProps: { sx: { background: "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)", "& .MuiMenuItem-root": { color: "#FFFFFF", fontSize: "0.85rem", "&:hover": { background: "rgba(255,255,255,0.06)" }, "&.Mui-selected": { background: "rgba(249,115,22,0.15)", color: "#F97316" } } } } }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="SUCCESS">Success</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
          </Select>
        </FormControl>
        <TextField
          size="small"
          placeholder="Search by payment ID, email, flight..."
          value={paySearch}
          onChange={(e) => setPaySearch(e.target.value)}
          sx={{
            flex: 1,
            minWidth: 250,
            "& .MuiOutlinedInput-root": {
              background: "rgba(255,255,255,0.04)",
              borderRadius: "12px",
              color: "#FFFFFF",
              fontSize: "0.85rem",
              "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
              "&:hover fieldset": { borderColor: "rgba(249,115,22,0.4)" },
              "&.Mui-focused fieldset": { borderColor: "#F97316" },
            },
            "& .MuiOutlinedInput-input::placeholder": { color: "#6B7280", opacity: 1 },
          }}
        />
        <Typography sx={{ color: "#6B7280", fontSize: "0.85rem" }}>
          {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Payments Table */}
      <Paper elevation={0} sx={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Payment ID", "User", "Flight", "Amount", "Status", "Date", "Actions"].map((header) => (
                  <th key={header} style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" as const, background: "rgba(255,255,255,0.04)", padding: "12px 20px", textAlign: "left" as const, borderBottom: "1px solid rgba(255,255,255,0.06)", letterSpacing: "0.05em" }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paymentsQuery.isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center" as const, color: "#6B7280", fontSize: "0.85rem" }}>Loading payments...</td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 24px", textAlign: "center" as const, color: "#6B7280", fontSize: "0.85rem" }}>No payments found</td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} style={{ transition: "background 0.15s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ color: "#9CA3AF", fontSize: "0.75rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "monospace", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                      {payment.razorpayPaymentId || payment.razorpayOrderId}
                    </td>
                    <td style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <Typography sx={{ fontWeight: 500, color: "#FFFFFF", fontSize: "0.85rem" }}>{payment.userName}</Typography>
                      <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>{payment.userEmail}</Typography>
                    </td>
                    <td style={{ color: "#9CA3AF", fontSize: "0.75rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontFamily: "monospace" }}>{payment.flightNumber}</td>
                    <td style={{ color: "#F97316", fontSize: "0.85rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontWeight: 700 }}>
                      ₹{payment.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <Chip
                        label={payment.status}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.7rem",
                          borderRadius: "8px",
                          ...(payment.status === "SUCCESS"
                            ? { background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
                            : payment.status === "FAILED"
                            ? { background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }
                            : { background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }),
                        }}
                      />
                    </td>
                    <td style={{ color: "#6B7280", fontSize: "0.75rem", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <Button
                        size="small"
                        onClick={() => setSelectedPayment(payment)}
                        sx={{ color: "#F97316", fontSize: "0.75rem", fontWeight: 600, textTransform: "none", minWidth: "auto", p: 0, "&:hover": { background: "transparent", color: "#FB923C" } }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>

      {/* Payments Pagination */}
      <Pagination
        currentPage={payPage}
        totalItems={filteredPayments.length}
        itemsPerPage={payPageSize}
        onPageChange={setPayPage}
        onItemsPerPageChange={(size) => setPayPageSize(size)}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      {/* Payment Detail Modal */}
      <Dialog
        open={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        PaperProps={{ sx: { background: "#111111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", maxWidth: 560, width: "100%" } }}
      >
        {selectedPayment && (
          <>
            <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: "1.1rem" }}>Payment Details</Typography>
              <IconButton onClick={() => setSelectedPayment(null)} size="small" sx={{ color: "#6B7280", "&:hover": { color: "#FFFFFF", background: "rgba(255,255,255,0.06)" } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Razorpay Order ID</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all" }}>{selectedPayment.razorpayOrderId}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Razorpay Payment ID</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem", fontFamily: "monospace", wordBreak: "break-all" }}>{selectedPayment.razorpayPaymentId || "\u2014"}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Status</Typography>
                  <Chip
                    label={selectedPayment.status}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      borderRadius: "8px",
                      mt: 0.5,
                      ...(selectedPayment.status === "SUCCESS"
                        ? { background: "rgba(34,197,94,0.12)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.2)" }
                        : selectedPayment.status === "FAILED"
                        ? { background: "rgba(239,68,68,0.12)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }
                        : { background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }),
                    }}
                  />
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Amount</Typography>
                  <Typography sx={{ color: "#F97316", fontSize: "1.25rem", fontWeight: 800, mt: 0.5 }}>₹{selectedPayment.totalAmount.toLocaleString("en-IN")}</Typography>
                </Box>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>User</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem", fontWeight: 500 }}>{selectedPayment.userName}</Typography>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem" }}>{selectedPayment.userEmail}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Flight</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem", fontFamily: "monospace" }}>{selectedPayment.flightNumber}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Route</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem" }}>{selectedPayment.source} → {selectedPayment.destination}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Seats</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem" }}>{selectedPayment.numberOfSeats} seat{selectedPayment.numberOfSeats !== 1 ? "s" : ""}</Typography>
                  {selectedPayment.selectedSeats?.length > 0 && (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                      {selectedPayment.selectedSeats.map((s: string) => (
                        <Chip key={s} label={s} size="small" sx={{ fontFamily: "monospace", fontSize: "0.7rem", background: "rgba(249,115,22,0.12)", color: "#F97316", border: "1px solid rgba(249,115,22,0.2)", height: 22 }} />
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Base Price</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem" }}>₹{selectedPayment.baseFare.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Taxes</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem" }}>₹{selectedPayment.taxes.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Convenience Fee</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.85rem" }}>₹{selectedPayment.convenienceFee.toLocaleString("en-IN")}</Typography>
                </Box>
                <Box>
                  <Typography sx={{ color: "#6B7280", fontSize: "0.75rem", mb: 0.5 }}>Booking ID</Typography>
                  <Typography sx={{ color: "#FFFFFF", fontSize: "0.75rem", fontFamily: "monospace", wordBreak: "break-all" }}>{selectedPayment.bookingId || "\u2014"}</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: "#4B5563", fontSize: "0.75rem", pt: 1 }}>
                Created: {new Date(selectedPayment.createdAt).toLocaleString("en-IN")}
                {selectedPayment.updatedAt && <> · Updated: {new Date(selectedPayment.updatedAt).toLocaleString("en-IN")}</>}
              </Typography>
            </Box>
          </>
        )}
      </Dialog>
    </Box>
  );
}
