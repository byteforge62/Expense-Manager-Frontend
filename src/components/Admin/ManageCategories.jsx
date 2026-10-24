import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from "../../redux/category/categorySlice";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";

// ================ Icons ================
import { FiGrid, FiActivity, FiFileText, FiSearch, FiX, FiCheck, FiEdit2, FiTrash2 } from "react-icons/fi";

export const ManageCategories = () => {
  const { categories = [], loading } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", type: "" }
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editedCategory, setEditedCategory] = useState({ name: "", type: "" });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const submitHandler = async (data) => {
    try {
      const resultAction = await dispatch(addCategory(data));
      if (addCategory.fulfilled.match(resultAction)) {
        toast.success("Category added!");
        reset();
      }
    } catch {
      toast.error("Error adding category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      const resultAction = await dispatch(deleteCategory(id));

      if (deleteCategory.fulfilled.match(resultAction)) {
        toast.success("Category deleted");
        dispatch(fetchCategories());
      } else {
        toast.error(resultAction.payload || "Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const startEditing = (cat) => {
    setEditingId(cat._id);
    setEditedCategory({ name: cat.name, type: cat.type });
  };

  const saveEdit = async (id) => {
    try {
      await dispatch(updateCategory({ id, data: editedCategory }));
      toast.success("Category updated");
      setEditingId(null);
      dispatch(fetchCategories());
    } catch {
      toast.error("Failed to update category");
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? cat.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const totalCount = categories.length;
  const incomeCount = categories.filter((c) => c.type === "income").length;
  const expenseCount = categories.filter((c) => c.type === "expense").length;

  return (
    <Box sx={{ pb: 5 }}>
      <Toaster position="top-right" reverseOrder={false} />

      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        {/* HEADER SECTION */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "end" }}
          spacing={3}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", tracking: -0.5, mb: 1, color: "text.primary" }}>
              Category{" "}
              <Box component="span" sx={{ color: "cyan.main" }}>
                Architecture
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 450 }}>
              Define the structural taxonomy for global financial tracking. Manage labels and classifications for all accounts.
            </Typography>
          </Box>
          <Chip
            label={`${totalCount} DEFINED SCHEMAS`}
            variant="outlined"
            sx={{
              fontWeight: "bold",
              fontSize: "11px",
              borderColor: "divider",
              bgcolor: "background.paper",
              color: "text.secondary",
              p: 0.5,
              borderRadius: 3,
            }}
          />
        </Stack>

        {/* SUMMARY CARDS (KPI Style) */}
        <Grid container spacing={3}>
          {[
            {
              label: "Total Managed",
              value: totalCount,
              icon: <FiGrid size={20} />,
              bg: "linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(99, 102, 241, 0.05))",
              accent: "#60a5fa",
            },
            {
              label: "Income Nodes",
              value: incomeCount,
              icon: <FiActivity size={20} />,
              bg: "linear-gradient(135deg, rgba(5, 150, 105, 0.15), rgba(20, 184, 166, 0.05))",
              accent: "#34d399",
            },
            {
              label: "Expense Nodes",
              value: expenseCount,
              icon: <FiFileText size={20} />,
              bg: "linear-gradient(135deg, rgba(225, 29, 72, 0.15), rgba(249, 115, 22, 0.05))",
              accent: "#f43f5e",
            },
          ].map((card, idx) => (
            <Grid item xs={12} sm={4} key={`${card.label}-${idx}`}>
              <Card
                component={motion.div}
                whileHover={{ y: -4 }}
                sx={{
                  p: 3,
                  borderRadius: 6,
                  background: card.bg,
                  border: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontSize: "10px", fontWeight: "bold", color: "text.secondary", tracking: 1.5, textTransform: "uppercase" }}>
                    {card.label}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: "bold", color: "text.primary", mt: 0.5 }}>
                    {card.value}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 4,
                    bgcolor: "rgba(0,0,0,0.15)",
                    color: card.accent,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {card.icon}
                </Avatar>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* WORKSPACE HUB */}
        <Grid container spacing={3} alignItems="start">
          
          {/* Add Category Form Panel */}
          <Grid item xs={12} xl={3}>
            <Card
              component={motion.form}
              onSubmit={handleSubmit(submitHandler)}
              sx={{
                p: 3,
                borderRadius: 6,
                bgcolor: "background.paper",
                border: 1,
                borderColor: "divider",
                display: "flex",
                flexDirection: "column",
                gap: 3,
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "text.secondary", tracking: 1.5, textTransform: "uppercase", pb: 1, borderBottom: 1, borderColor: "divider" }}>
                New Category Protocol
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", tracking: 0.5 }}>
                    System Label
                  </Typography>
                  <TextField
                    {...register("name", { required: "Category name is required" })}
                    fullWidth
                    size="small"
                    placeholder="e.g. Infrastructure"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    FormHelperTextProps={{ sx: { fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", m: 0, mt: 0.75 } }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ display: "block", mb: 1, fontWeight: 600, color: "text.secondary", textTransform: "uppercase", tracking: 0.5 }}>
                    Classification Type
                  </Typography>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Please select a type" }}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        select
                        fullWidth
                        size="small"
                        error={!!error}
                        helperText={error?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                      >
                        <MenuItem value="">Select Protocol</MenuItem>
                        <MenuItem value="income">Income Flow</MenuItem>
                        <MenuItem value="expense">Expense Flow</MenuItem>
                      </TextField>
                    )}
                  />
                </Box>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: "bold",
                  fontSize: "11px",
                  letterSpacing: 1.5,
                  background: "linear-gradient(to right, #0891b2, #2563eb)",
                  boxShadow: "0 4px 12px rgba(34, 211, 238, 0.2)",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    background: "linear-gradient(to right, #0891b2, #2563eb)",
                  },
                }}
              >
                Initialize Category
              </Button>
            </Card>
          </Grid>

          {/* Table / Registry View */}
          <Grid item xs={12} xl={9} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* Search and Filters Strip */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: 2, borderRadius: 6, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
              <TextField
                placeholder="Search taxonomy cache..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ color: "text.disabled" }}>
                      <FiSearch />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "background.paper", "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              />

              <TextField
                select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                size="small"
                sx={{ minWidth: { sm: 180 }, bgcolor: "background.paper", "& .MuiOutlinedInput-root": { borderRadius: 4 } }}
              >
                <MenuItem value="">Full Taxonomy</MenuItem>
                <MenuItem value="income">Income Only</MenuItem>
                <MenuItem value="expense">Expense Only</MenuItem>
              </TextField>
            </Stack>

            {/* Main Data Table */}
            <TableContainer sx={{ borderRadius: 6, border: 1, borderColor: "divider", bgcolor: "background.paper", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)" }}>
              {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 10, gap: 2 }}>
                  <CircularProgress size={32} thickness={4} sx={{ color: "cyan.main" }} />
                  <Typography variant="caption" sx={{ fontWeight: "bold", tracking: 1.5, color: "text.secondary", textTransform: "uppercase" }}>
                    Fetching Taxonomy...
                  </Typography>
                </Stack>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "action.hover" }}>
                      <TableCell sx={{ fontSize: "10px", fontWeight: "bold", color: "text.secondary", tracking: 1.5, textTransform: "uppercase", py: 2 }}>Structure Label</TableCell>
                      <TableCell sx={{ fontSize: "10px", fontWeight: "bold", color: "text.secondary", tracking: 1.5, textTransform: "uppercase", py: 2 }}>Flow Classification</TableCell>
                      <TableCell align="center" sx={{ fontSize: "10px", fontWeight: "bold", color: "text.secondary", tracking: 1.5, textTransform: "uppercase", py: 2 }}>Maintenance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCategories.map((cat, index) => (
                      <TableRow
                        key={cat._id}
                        component={motion.tr}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        hover
                        sx={{ "&:last-child child, &:last-child th": { border: 0 } }}
                      >
                        {/* Label Cell */}
                        <TableCell sx={{ py: 1.5 }}>
                          {editingId === cat._id ? (
                            <TextField
                              size="small"
                              value={editedCategory.name}
                              onChange={(e) => setEditedCategory({ ...editedCategory, name: e.target.value })}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                            />
                          ) : (
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar variant="rounded" sx={{ width: 32, height: 32, borderRadius: 2, fontSize: "12px", fontWeight: "bold", bgcolor: "action.selected", color: "text.secondary", border: 1, borderColor: "divider" }}>
                                {cat.name?.charAt(0)}
                              </Avatar>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary", "&:hover": { color: "cyan.main" }, transition: "color 0.2s" }}>
                                {cat.name}
                              </Typography>
                            </Stack>
                          )}
                        </TableCell>

                        {/* Flow Classification Cell */}
                        <TableCell sx={{ py: 1.5 }}>
                          {editingId === cat._id ? (
                            <TextField
                              select
                              size="small"
                              value={editedCategory.type}
                              onChange={(e) => setEditedCategory({ ...editedCategory, type: e.target.value })}
                              sx={{ minWidth: 120, "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                            >
                              <MenuItem value="income">Income</MenuItem>
                              <MenuItem value="expense">Expense</MenuItem>
                            </TextField>
                          ) : (
                            <Chip
                              label={cat.type?.toUpperCase()}
                              size="small"
                              variant="outlined"
                              sx={{
                                fontSize: "9px",
                                fontWeight: "bold",
                                borderRadius: 2,
                                color: cat.type === "income" ? "emerald.main" : "rose.main",
                                bgcolor: cat.type === "income" ? "rgba(16, 185, 129, 0.08)" : "rgba(244, 63, 94, 0.08)",
                                borderColor: cat.type === "income" ? "rgba(16, 185, 129, 0.2)" : "rgba(244, 63, 94, 0.2)",
                              }}
                            />
                          )}
                        </TableCell>

                        {/* Maintenance Actions Cell */}
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <Stack direction="row" spacing={1} justifyContent="center">
                            {editingId === cat._id ? (
                              <>
                                <IconButton size="small" onClick={() => saveEdit(cat._id)} sx={{ color: "emerald.main", bgcolor: "rgba(16, 185, 129, 0.1)", "&:hover": { bgcolor: "emerald.main", color: "#fff" } }}>
                                  <FiCheck size={14} />
                                </IconButton>
                                <IconButton size="small" onClick={() => setEditingId(null)} sx={{ color: "text.disabled", bgcolor: "action.hover" }}>
                                  <FiX size={14} />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton size="small" onClick={() => startEditing(cat)} sx={{ color: "cyan.main", border: 1, borderColor: "divider", bgcolor: "background.paper", "&:hover": { bgcolor: "cyan.main", color: "#fff" } }}>
                                  <FiEdit2 size={14} />
                                </IconButton>
                                <IconButton size="small" onClick={() => handleDelete(cat._id)} sx={{ color: "rose.main", border: 1, borderColor: "divider", bgcolor: "background.paper", "&:hover": { bgcolor: "rose.main", color: "#fff" } }}>
                                  <FiTrash2 size={14} />
                                </IconButton>
                              </>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};