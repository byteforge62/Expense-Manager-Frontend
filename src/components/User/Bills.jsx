
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiLink,
} from "react-icons/fi";
import axiosInstance from "../Utils/axiosInstance";

const getResponseData = (response) => {
  const data = response?.data?.data ?? response?.data;
  return Array.isArray(data) ? data : [];
};

const getId = (item) => item?._id || item?.id || "";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const isOverdue = (bill) =>
  bill?.status === "pending" &&
  bill?.dueDate &&
  new Date(bill.dueDate).setHours(0, 0, 0, 0) <
    new Date().setHours(0, 0, 0, 0);

const getExpenseLabel = (expense) => {
  const description =
    expense?.description ||
    expense?.title ||
    expense?.name ||
    expense?.category ||
    "Expense transaction";

  return `${description} · ${formatCurrency(expense?.amount)} · ${formatDate(
    expense?.date || expense?.createdAt,
  )}`;
};

const panelSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 3,
  bgcolor: "background.paper",
  boxShadow: "none",
};

export const Bills = () => {
  const [bills, setBills] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeFilter, setActiveFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [settleOpen, setSettleOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    dueDate: "",
  });

  const [selectedExpenseId, setSelectedExpenseId] = useState("");

  const loadBills = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Backend route: GET /api/bills/me
      const response = await axiosInstance.get("/bills/me");
      setBills(getResponseData(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load bills. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const totals = useMemo(() => {
    const pending = bills.filter((bill) => bill.status === "pending");
    const paid = bills.filter((bill) => bill.status === "paid");
    const overdue = pending.filter(isOverdue);

    return {
      total: bills.length,
      pending: pending.length,
      paid: paid.length,
      overdue: overdue.length,
      pendingAmount: pending.reduce(
        (sum, bill) => sum + Number(bill.amount || 0),
        0,
      ),
    };
  }, [bills]);

  const filteredBills = useMemo(() => {
    if (activeFilter === "pending") {
      return bills.filter((bill) => bill.status === "pending" && !isOverdue(bill));
    }

    if (activeFilter === "overdue") {
      return bills.filter(isOverdue);
    }

    if (activeFilter === "paid") {
      return bills.filter((bill) => bill.status === "paid");
    }

    return bills;
  }, [activeFilter, bills]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const amount = Number(form.amount);

    if (!form.name.trim()) {
      setError("Enter a bill name.");
      return;
    }

    if (!form.dueDate) {
      setError("Select a due date.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    // Use midday local time to avoid date shifting during timezone conversion.
    const dueDate = new Date(`${form.dueDate}T12:00:00`).toISOString();

    setSaving(true);

    try {
      // Backend route: POST /api/bill
      await axiosInstance.post("/bill", {
        name: form.name.trim(),
        amount,
        dueDate,
      });

      setForm({ name: "", amount: "", dueDate: "" });
      setCreateOpen(false);
      setSuccess("Bill created successfully.");
      await loadBills();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to create bill.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (bill) => {
    const billId = getId(bill);
    if (!billId) return;

    const confirmed = window.confirm(
      `Delete "${bill.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      // Backend route: DELETE /api/bill/:id
      await axiosInstance.delete(`/bill/${billId}`);
      setSuccess("Bill deleted successfully.");
      await loadBills();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete this bill.",
      );
    }
  };

  const openSettleDialog = async (bill) => {
    setSelectedBill(bill);
    setSelectedExpenseId("");
    setError("");
    setSuccess("");
    setSettleOpen(true);
    setLoadingExpenses(true);

    try {
      // Backend route: GET /api/expenses/me
      const response = await axiosInstance.get("/expenses/me");
      setExpenses(getResponseData(response));
    } catch (err) {
      setExpenses([]);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load expenses for settlement.",
      );
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleSettle = async () => {
    const billId = getId(selectedBill);

    if (!billId || !selectedExpenseId) {
      setError("Select an expense transaction to continue.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Backend route: PATCH /api/bill/:id/settle
      await axiosInstance.patch(`/bill/${billId}/settle`, {
        expenseId: selectedExpenseId,
      });

      setSettleOpen(false);
      setSelectedBill(null);
      setSelectedExpenseId("");
      setSuccess("Bill settled and linked to the selected expense.");
      await loadBills();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to settle this bill. Check the selected expense and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const statusFor = (bill) => {
    if (bill.status === "paid") {
      return { label: "Paid", color: "success" };
    }

    if (isOverdue(bill)) {
      return { label: "Overdue", color: "error" };
    }

    return { label: "Pending", color: "warning" };
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FiFileText size={22} />
            <Typography variant="h5" fontWeight={800}>
              Bills
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track upcoming payments and link settled bills to expense transactions.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<FiRefreshCw />}
            onClick={loadBills}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<FiPlus />}
            onClick={() => {
              setError("");
              setCreateOpen(true);
            }}
          >
            Add bill
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {[
          { label: "Total bills", value: totals.total, icon: <FiFileText /> },
          { label: "Pending amount", value: formatCurrency(totals.pendingAmount), icon: <FiClock /> },
          { label: "Overdue", value: totals.overdue, icon: <FiCalendar /> },
          { label: "Paid", value: totals.paid, icon: <FiCheckCircle /> },
        ].map((item) => (
          <Paper key={item.label} sx={{ ...panelSx, p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
              {item.icon}
              <Typography variant="caption" fontWeight={700}>
                {item.label}
              </Typography>
            </Stack>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ mt: 1, overflowWrap: "anywhere" }}
            >
              {item.value}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ ...panelSx, p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Your bills
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredBills.length} record(s)
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {["all", "pending", "overdue", "paid"].map((filter) => (
              <Button
                key={filter}
                size="small"
                variant={activeFilter === filter ? "contained" : "outlined"}
                onClick={() => setActiveFilter(filter)}
                sx={{ textTransform: "capitalize" }}
              >
                {filter}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 7 }}>
            <CircularProgress />
          </Box>
        ) : filteredBills.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 7 }}>
            <FiFileText size={34} />
            <Typography fontWeight={700} sx={{ mt: 1 }}>
              No bills found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a bill or choose another filter.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {filteredBills
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.dueDate).getTime() -
                  new Date(b.dueDate).getTime(),
              )
              .map((bill) => {
                const status = statusFor(bill);

                return (
                  <Box
                    key={getId(bill)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                      p: 2,
                      display: "flex",
                      flexDirection: { xs: "column", md: "row" },
                      alignItems: { xs: "stretch", md: "center" },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        <Typography fontWeight={800}>{bill.name}</Typography>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                          variant="outlined"
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.75}
                        sx={{ mt: 0.75 }}
                      >
                        <FiCalendar size={14} />
                        <Typography variant="body2" color="text.secondary">
                          Due {formatDate(bill.dueDate)}
                        </Typography>
                      </Stack>

                      {bill.settledExpenseId && (
                        <Typography
                          variant="caption"
                          color="success.main"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          Linked to an expense transaction
                        </Typography>
                      )}
                    </Box>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "stretch", sm: "center" }}
                      spacing={1.5}
                    >
                      <Typography variant="h6" fontWeight={800}>
                        {formatCurrency(bill.amount)}
                      </Typography>

                      {bill.status === "pending" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<FiLink />}
                          onClick={() => openSettleDialog(bill)}
                        >
                          Settle
                        </Button>
                      )}

                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<FiTrash2 />}
                        onClick={() => handleDelete(bill)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Box>
                );
              })}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle fontWeight={800}>Add a bill</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Bill name"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                fullWidth
                inputProps={{ maxLength: 100 }}
              />
              <TextField
                label="Amount (₹)"
                type="number"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
                required
                fullWidth
                inputProps={{ min: 0.01, step: "0.01" }}
              />
              <TextField
                label="Due date"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dueDate: event.target.value }))
                }
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving..." : "Create bill"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={settleOpen}
        onClose={() => !saving && setSettleOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={800}>Settle bill</DialogTitle>
        <DialogContent>
          {selectedBill && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Linking <strong>{selectedBill.name}</strong> (
              {formatCurrency(selectedBill.amount)}) to an existing expense will
              mark this bill as paid. It will not create another expense.
            </Alert>
          )}

          {loadingExpenses ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : expenses.length === 0 ? (
            <Alert severity="warning">
              No expense transactions were returned. Create the expense first,
              then reopen this dialog.
            </Alert>
          ) : (
            <FormControl fullWidth>
              <InputLabel id="settlement-expense-label">
                Expense transaction
              </InputLabel>
              <Select
                labelId="settlement-expense-label"
                value={selectedExpenseId}
                label="Expense transaction"
                onChange={(event) => setSelectedExpenseId(event.target.value)}
              >
                {expenses.map((expense) => (
                  <MenuItem key={getId(expense)} value={getId(expense)}>
                    {getExpenseLabel(expense)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
            Select the expense that already represents this bill payment. The
            backend validates ownership and prevents an expense from being linked
            to multiple bills.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSettleOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSettle}
            disabled={saving || loadingExpenses || !selectedExpenseId}
          >
            {saving ? "Settling..." : "Confirm settlement"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Bills;
