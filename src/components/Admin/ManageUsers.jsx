import { useEffect, useState } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fetchUsers, deleteUser } from "../../redux/slices/userSlice";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";

// ================ Icons ================
import { FaTrash, FaEye } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { FiUsers, FiFilter, FiActivity } from "react-icons/fi";

export const ManageUsers = () => {
  const dispatch = useDispatch();
  const { users = [], loading } = useSelector((state) => state.user);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    setDisplayedUsers(users);
  }, [users]);

  // Command Filter Logic
  useEffect(() => {
    let filtered = [...users];

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    setDisplayedUsers(filtered);
    setCurrentPage(1);
  }, [search, roleFilter, users]);

  // Navigation Logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = displayedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(displayedUsers.length / usersPerPage);

  // Archive Sequence
  const handleDelete = async (userId) => {
    if (!window.confirm("Commence permanent data deletion for this entity?"))
      return;

    try {
      await dispatch(deleteUser(userId));
      toast.success("ENTRY ARCHIVED", {
        autoClose: 1800,
        style: {
          backgroundColor: "#1f9d6b",
          color: "white",
          fontWeight: "900",
          borderRadius: "1rem",
        },
      });
    } catch {
      toast.error("PROTOCOL FAILURE", {
        autoClose: 1800,
        style: {
          backgroundColor: "#e0564b",
          color: "white",
          fontWeight: "900",
          borderRadius: "1rem",
        },
      });
    }
  };

  const getRoleColorStyles = (role) => {
    if (role === "Admin") return { color: "#a78bfa", bgcolor: "rgba(163, 119, 58, 0.1)", borderColor: "rgba(163, 119, 58, 0.2)" };
    if (role === "Manager") return { color: "#3E6BB5", bgcolor: "rgba(163, 119, 58, 0.1)", borderColor: "rgba(163, 119, 58, 0.2)" };
    return { color: "#1f9d6b", bgcolor: "rgba(46, 122, 89, 0.1)", borderColor: "rgba(46, 122, 89, 0.2)" };
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ display: "flex", flexDirection: "column", gap: 5, pb: 5 }}
    >
      <ToastContainer theme="dark" transition={Bounce} />

      {/* ══ REGISTRY HEADER ══ */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "end" }}
        spacing={3}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              letterSpacing: -0.5,
              color: "text.primary",
            }}
          >
            User Registry
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: "bold",
              color: "text.disabled",
              mt: 0.5,
              letterSpacing: "0.2em",
            }}
          >
            Central Entity Access & Vector Management
          </Typography>
        </Box>

        <Chip
          icon={<FiActivity size={12} className="animate-pulse" style={{ color: "inherit" }} />}
          label={`${displayedUsers.length} DATA NODES ACTIVE`}
          sx={{
            fontWeight: 600,
            fontSize: "10px",
            letterSpacing: 1,
            bgcolor: "rgba(74, 47, 203, 0.1)",
            border: "1px solid rgba(74, 47, 203, 0.2)",
            color: "#6735c8",
            borderRadius: 2,
            px: 1,
          }}
        />
      </Stack>

      {/* ── COMMAND HUB (SEARCH & FILTER) ── */}
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 4, sm: 5 },
          borderRadius: 1.5,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Glow ambient nodes */}
        <Box sx={{ position: "absolute", top: 0, right: 0, width: 256, height: 256, bgcolor: "rgba(74, 47, 203, 0.03)", filter: "blur(100px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, width: 256, height: 256, bgcolor: "rgba(74, 95, 85, 0.03)", filter: "blur(100px)", pointerEvents: "none" }} />

        <Grid container spacing={3} sx={{ position: "relative" }}>
          <Grid item xs={12} lg={9}>
            <TextField
              fullWidth
              placeholder="Query registry by entity name or comm signature..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <IoSearch size={18} style={{ marginRight: 12, color: "var(--text-muted)" }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  fontSize: "14px",
                  fontWeight: "bold",
                },
              }}
            />
          </Grid>

          <Grid item xs={12} lg={3}>
            <TextField
              select
              fullWidth
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <FiFilter size={14} style={{ marginRight: 12, color: "var(--text-muted)" }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: 1,
                },
              }}
            >
              <MenuItem value="all" sx={{ fontSize: "11px", fontWeight: 600 }}>GLOBAL PERSPECTIVE</MenuItem>
              <MenuItem value="Admin" sx={{ fontSize: "11px", fontWeight: 600 }}>ADMIN OVERRIDE</MenuItem>
              <MenuItem value="Manager" sx={{ fontSize: "11px", fontWeight: 600 }}>EXECUTIVE ACCESS</MenuItem>
              <MenuItem value="Standard" sx={{ fontSize: "11px", fontWeight: 600 }}>STANDARD NODE</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Card>

      {/* ── ENTITY MATRIX ── */}
      <Box
        component={motion.div}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        sx={{
          borderRadius: 1.5,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 16, gap: 3 }}>
            <CircularProgress size={48} thickness={4} sx={{ color: "#6735c8" }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600, color: "text.primary", tracking: 1.5, }} className="animate-pulse">
                Synchronizing Nodes...
              </Typography>
              <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", tracking: 1.5, fontSize: "10px", mt: 0.5 }}>
                Querying Distributed Registry
              </Typography>
            </Box>
          </Stack>
        ) : displayedUsers.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 16, gap: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
              }}
            >
              <FiUsers size={40} style={{ opacity: 0.2, color: "var(--text-muted)" }} />
            </Avatar>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600, color: "text.primary", tracking: 1.5, }}>
                No entities detected
              </Typography>
              <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", tracking: 1.5, fontSize: "10px", mt: 0.5 }}>
                Broaden your search parameters.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <>
            {/* DESKTOP MATRIX VIEW */}
            <Box sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
                    <TableCell sx={{ fontSize: "10px", fontWeight: 600, color: "text.disabled", letterSpacing: "0.2em", px: 4, py: 3 }}>Identity Vector</TableCell>
                    <TableCell sx={{ fontSize: "10px", fontWeight: 600, color: "text.disabled", letterSpacing: "0.2em", px: 4, py: 3 }}>Metric (Age)</TableCell>
                    <TableCell sx={{ fontSize: "10px", fontWeight: 600, color: "text.disabled", letterSpacing: "0.2em", px: 4, py: 3 }}>Comm Signature</TableCell>
                    <TableCell sx={{ fontSize: "10px", fontWeight: 600, color: "text.disabled", letterSpacing: "0.2em", px: 4, py: 3 }}>Privilege Level</TableCell>
                    <TableCell align="center" sx={{ fontSize: "10px", fontWeight: 600, color: "text.disabled", letterSpacing: "0.2em", px: 4, py: 3 }}>Operational Controls</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {currentUsers.map((user, index) => (
                      <TableRow
                        key={user._id}
                        component={motion.tr}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.02 }}
                        sx={{
                          "&:hover": { bgcolor: "rgba(74, 47, 203, 0.02)" },
                          transition: "background-color 0.3s",
                          "& td": { borderBottom: 1, borderColor: "divider" },
                        }}
                      >
                        <TableCell sx={{ px: 4, py: 3 }}>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              variant="rounded"
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                bgcolor: "action.hover",
                                border: 1,
                                borderColor: "divider",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#6735c8",
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                                transition: "border-color 0.3s",
                                ".MuiTableRow-root:hover &": { borderColor: "rgba(74, 47, 203, 0.5)" },
                              }}
                            >
                              {user.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: -0.5, transition: "color 0.3s", ".MuiTableRow-root:hover &": { color: "#6735c8" } }}>
                              {user.name}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell sx={{ px: 4, py: 3, fontFamily: "monospace", fontSize: "12px", fontWeight: "bold", color: "text.secondary" }}>
                          {user.age || "--"} YRS
                        </TableCell>

                        <TableCell sx={{ px: 4, py: 3, fontSize: "11px", fontWeight: "bold", color: "text.secondary", letterSpacing: 0.5, transition: "color 0.3s", ".MuiTableRow-root:hover &": { color: "text.primary" } }}>
                          {user.email}
                        </TableCell>

                        <TableCell sx={{ px: 4, py: 3 }}>
                          <Chip
                            label={user.role}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: "9px",
                              fontWeight: 600,
                              letterSpacing: 1,
                              borderRadius: 1.5,
                              px: 1,
                              ...getRoleColorStyles(user.role),
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ px: 4, py: 3 }}>
                          <Stack direction="row" spacing={1.5} justifyContent="center">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/admin/user/${user._id}`)}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor: "action.hover",
                                border: 1,
                                borderColor: "divider",
                                color: "#6735c8",
                                transition: "all 0.2s",
                                "&:hover": { bgcolor: "#6735c8", color: "#fff" },
                                "&:active": { transform: "scale(0.9)" },
                              }}
                              title="INSPECT VECTOR"
                            >
                              <FaEye size={16} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(user._id)}
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor: "action.hover",
                                border: 1,
                                borderColor: "divider",
                                color: "#e0564b",
                                transition: "all 0.2s",
                                "&:hover": { bgcolor: "#e0564b", color: "#fff" },
                                "&:active": { transform: "scale(0.9)" },
                              }}
                              title="ARCHIVE ENTITY"
                            >
                              <FaTrash size={14} />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </Box>

            {/* MOBILE GRID VIEW */}
            <Box sx={{ display: { xs: "block", lg: "none" }, p: 3 }}>
              <Grid container spacing={3}>
                {currentUsers.map((user) => (
                  <Grid item xs={12} md={6} key={user._id}>
                    <Card
                      component={motion.div}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        p: 4,
                        borderRadius: 1.5,
                        bgcolor: "rgba(255,255,255,0.02)",
                        border: 1,
                        borderColor: "divider",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                        "&:hover .ambient-glow": { transform: "scale(1.5)" },
                      }}
                    >
                      <Box className="ambient-glow" sx={{ position: "absolute", top: -48, right: -48, width: 128, height: 128, bgcolor: "rgba(74, 47, 203, 0.03)", filter: "blur(50px)", pointerEvents: "none", transition: "transform 0.7s" }} />

                      <Stack direction="row" alignItems="center" spacing={2.5}>
                        <Avatar variant="rounded" sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: "background.paper", border: 1, borderColor: "divider", color: "#6735c8", fontWeight: 600, fontSize: "20px" }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: -0.5, noWrap: true }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", fontWeight: "bold", color: "text.disabled", letterSpacing: 1, noWrap: true }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 3, borderTop: 1, borderColor: "divider" }}>
                        <Chip
                          label={`${user.role} ACCESS`}
                          variant="outlined"
                          size="small"
                          sx={{
                            fontSize: "8px",
                            fontWeight: 600,
                            letterSpacing: 1,
                            borderRadius: 2,
                            ...getRoleColorStyles(user.role),
                          }}
                        />
                        <Stack direction="row" spacing={1}>
                          <IconButton onClick={() => navigate(`/admin/user/${user._id}`)} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "#6735c8", color: "#fff", boxShadow: "0 10px 15px -3px rgba(74,47,203,0.2)", "&:hover": { bgcolor: "#6735c8" }, "&:active": { transform: "scale(0.9)" } }}>
                            <FaEye size={14} />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(user._id)} sx={{ p: 1.5, borderRadius: 1.5, bgcolor: "#e0564b", color: "#fff", boxShadow: "0 10px 15px -3px rgba(244,63,94,0.2)", "&:hover": { bgcolor: "#e0564b" }, "&:active": { transform: "scale(0.9)" } }}>
                            <FaTrash size={14} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}
      </Box>

      {/* ── NAVIGATION ENGINE ── */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
          <Box sx={{ p: 1, bgcolor: "background.paper", borderRadius: 2, border: 1, borderColor: "divider", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              renderItem={(item) => (
                <PaginationItem
                  {...item}
                  page={item.page ? String(item.page).padStart(2, "0") : undefined}
                  sx={{
                    minWidth: 44,
                    height: 44,
                    borderRadius: 2,
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "text.disabled",
                    transition: "all 0.3s",
                    "&.Mui-selected": {
                      background: "linear-gradient(to top right, #6735c8, #4922a8)",
                      color: "#fff",
                      boxShadow: "0 10px 15px -3px rgba(74,47,203,0.3)",
                      "&:hover": {
                        background: "linear-gradient(to top right, #6735c8, #4922a8)",
                      },
                    },
                    "&:not(.Mui-selected):hover": {
                      color: "text.primary",
                      bgcolor: "action.hover",
                    },
                  }}
                />
              )}
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
};