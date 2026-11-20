import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { fetchLogs } from "../../redux/slices/logSlice";

// ================ Material UI Components ================
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";

// ================ Material UI Table Module ================
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// ================ Icons ================
import {
  FiSearch,
  FiClipboard,
  FiClock,
  FiActivity,
  FiShield,
  FiUser,
} from "react-icons/fi";

export const Systemlog = () => {
  const dispatch = useDispatch();
  const { logs, loading, error } = useSelector((state) => state.log);
  // Defensive: a malformed payload must never break the audit table.
  const safeLogs = Array.isArray(logs) ? logs : [];
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchLogs());
  }, [dispatch]);

  const filteredLogs = safeLogs.filter(
    (log) =>
      log.user?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Badge Color Protocol mapped directly to inline stylings
  const getBadgeStyle = (action) => {
    const base = { fontSize: "9px", fontWeight: 600, letterSpacing: 1, px: 1.5, py: 0.5, borderRadius: 1.5, border: 1 };
    if (!action) return { ...base, bgcolor: "rgba(107, 114, 128, 0.1)", borderColor: "rgba(107, 114, 128, 0.2)", color: "#6b7280" };
    
    const act = action.toLowerCase();
    if (act.includes("delete"))
      return { ...base, bgcolor: "rgba(169, 75, 63, 0.1)", borderColor: "rgba(169, 75, 63, 0.2)", color: "#e0564b" };
    if (act.includes("update"))
      return { ...base, bgcolor: "rgba(74, 47, 203, 0.1)", borderColor: "rgba(74, 47, 203, 0.2)", color: "#6735c8" };
    if (act.includes("create"))
      return { ...base, bgcolor: "rgba(46, 122, 89, 0.1)", borderColor: "rgba(46, 122, 89, 0.2)", color: "#1f9d6b" };
      
    return { ...base, bgcolor: "rgba(163, 119, 58, 0.1)", borderColor: "rgba(163, 119, 58, 0.2)", color: "#6735c8" };
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ pb: 5, color: "text.primary", "& > :not(style)": { mb: 4 } }}
    >
      {/* ══ AUDIT HEADER ══ */}
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
              letterSpacing: -1,
              color: "text.primary",
            }}
          >
            Operational Ledger
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
            Immutable Transactional Integrity Audit
          </Typography>
        </Box>

        <Chip
          icon={<FiShield size={12} style={{ animation: "pulse 2s infinite" }} />}
          label={`${safeLogs.length} AUDIT NODES`}
          sx={{
            px: 1.5,
            py: 2,
            borderRadius: 2,
            bgcolor: "rgba(163, 119, 58, 0.1)",
            border: "1px solid rgba(163, 119, 58, 0.2)",
            color: "#6735c8",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: 1,
            "& .MuiChip-icon": { color: "inherit", marginLeft: 0 },
          }}
        />
      </Stack>

      {/* ── COMMAND OVERRIDE (SEARCH INPUT CARD) ── */}
      <Card
        sx={{
          p: { xs: 4, sm: 5 },
          borderRadius: 1.5,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Synthetic background ambient blurs */}
        <Box sx={{ position: "absolute", top: 0, right: 0, w: 256, h: 256, bgcolor: "rgba(163, 119, 58, 0.05)", filter: "blur(100px)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: 0, left: 0, w: 256, h: 256, bgcolor: "rgba(74, 47, 203, 0.05)", filter: "blur(100px)", pointerEvents: "none" }} />

        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems="center"
          spacing={3}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search taxonomy cache by user, action or payload signature..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ pl: 1, color: "text.disabled" }}>
                  <FiSearch size={18} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "action.hover",
                borderRadius: 2,
                color: "text.primary",
                fontWeight: "bold",
                letterSpacing: "-0.01em",
                "& fieldset": { borderColor: "divider" },
                "&:hover fieldset": { borderColor: "action.active" },
                "&.Mui-focused fieldset": { borderColor: "rgba(163, 119, 58, 0.5)", borderWidth: "1px" },
                "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(163, 119, 58, 0.05)" },
              },
              "& .MuiOutlinedInput-input": { py: 2, px: 1, fontSize: "14px" },
            }}
          />

          <Chip
            icon={<FiActivity size={14} />}
            label="Real-time Monitoring Active"
            sx={{
              px: 2,
              py: 2.5,
              borderRadius: 2,
              bgcolor: "rgba(163, 119, 58, 0.1)",
              border: 1,
              borderColor: "rgba(163, 119, 58, 0.2)",
              color: "#6735c8",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              whiteSpace: "nowrap",
              boxShadow: "inset 0px 1px 3px rgba(0,0,0,0.2)",
              alignSelf: { xs: "stretch", lg: "auto" },
              justifyContent: "center",
              "& .MuiChip-icon": { color: "inherit", marginLeft: 0 },
            }}
          />
        </Stack>
      </Card>

      {/* ── CENTRAL DATA LEDGER LAYER ── */}
      <Card
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
          /* SYNC STATE LOAD ENGINE */
          <Stack alignItems="center" justifyContent="center" sx={{ py: 16 }} spacing={3}>
            <CircularProgress thickness={4} sx={{ color: "#6735c8", width: "48px !important", height: "48px !important" }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600, color: "text.primary", letterSpacing: "0.15em", animation: "pulse 2s infinite", mb: 0.5 }}>
                Synchronizing Ledger...
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "10px", fontWeight: "bold", color: "text.disabled", letterSpacing: "0.1em", }}>
                Compiling Historical Telemetry
              </Typography>
            </Box>
          </Stack>
        ) : error ? (
          /* FETCH FAILURE STATE */
          <Stack alignItems="center" justifyContent="center" sx={{ py: 16 }} spacing={2}>
            <Avatar variant="rounded" sx={{ bgcolor: "rgba(169, 75, 63, 0.1)", color: "#e0564b", width: 56, height: 56 }}>
              <FiShield size={24} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
              Audit stream unavailable
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 420, textAlign: "center" }}>
              {error}
            </Typography>
          </Stack>
        ) : filteredLogs.length === 0 ? (
          /* REGISTRY NULL EXCEPTION */
          <Stack alignItems="center" justifyContent="center" sx={{ py: 16 }} spacing={2}>
            <Avatar
              variant="rounded"
              sx={{
                width: 80,
                height: 80,
                borderRadius: 1.5,
                bgcolor: "action.hover",
                border: 1,
                borderColor: "divider",
                boxShadow: "inset 0px 1px 3px rgba(0,0,0,0.2)",
              }}
            >
              <FiClipboard size={40} style={{ opacity: 0.2 }} />
            </Avatar>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="caption" sx={{ display: "block", fontWeight: 600, color: "text.primary", letterSpacing: "0.15em", mb: 0.5 }}>
                No match in registry
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "10px", fontWeight: "bold", color: "text.disabled", letterSpacing: "0.1em", }}>
                Modify taxonomy filters to access data nodes.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <>
            {/* DESKTOP MATRIX RESOLUTION (LARGE DEVICE VIEW) */}
            <TableContainer sx={{ display: { xs: "none", lg: "block" }, overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
                    {["Timestamp Sequence", "Operational Actor", "Interaction Vector", "Transaction Signature"].map((head) => (
                      <TableCell
                        key={head}
                        sx={{
                          px: 4,
                          py: 3,
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "text.disabled",
                          letterSpacing: "0.2em",
                          borderBottom: "none",
                        }}
                      >
                        {head}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredLogs.map((log, index) => (
                      <TableRow
                        key={log._id || index}
                        component={motion.tr}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.01 }}
                        sx={{
                          transition: "all 0.3s",
                          borderBottom: 1,
                          borderColor: "divider",
                          "&:last-child": { borderBottom: "none" },
                          "&:hover": { bgcolor: "rgba(163, 119, 58, 0.05)" },
                          "&:hover .timestamp-cell": { color: "#6735c8" },
                          "&:hover .actor-avatar": { borderColor: "rgba(163, 119, 58, 0.5)" },
                        }}
                      >
                        {/* TIMESTAMP */}
                        <TableCell className="timestamp-cell" sx={{ px: 4, py: 3, fontFamily: "monospace", fontSize: "11px", fontWeight: "bold", color: "text.disabled", transition: "color 0.3s", borderBottom: "none" }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <FiClock size={12} style={{ opacity: 0.5 }} />
                            <span>{new Date(log.timestamp || log.createdAt).toLocaleString()}</span>
                          </Stack>
                        </TableCell>

                        {/* ACTOR SIGNATURE */}
                        <TableCell sx={{ px: 4, py: 3, borderBottom: "none" }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              className="actor-avatar"
                              variant="rounded"
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 2,
                                bgcolor: "action.hover",
                                border: 1,
                                borderColor: "divider",
                                fontSize: "10px",
                                fontWeight: 600,
                                color: "#6735c8",
                                transition: "border-color 0.3s",
                                boxShadow: "inset 0px 1px 2px rgba(0,0,0,0.2)",
                              }}
                            >
                              {log.user?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontSize: "12px", fontWeight: 600, letterSpacing: -0.5 }}>
                              {log.user}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* VECTOR BADGE */}
                        <TableCell sx={{ px: 4, py: 3, borderBottom: "none" }}>
                          <Box component="span" sx={getBadgeStyle(log.action)}>
                            {log.action}
                          </Box>
                        </TableCell>

                        {/* PAYLOAD CONFIG */}
                        <TableCell
                          title={log.description}
                          sx={{
                            px: 4,
                            py: 3,
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "text.disabled",
                            maxWidth: 320,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            borderBottom: "none",
                            ".MuiTableRow-root:hover &": { color: "text.secondary" },
                          }}
                        >
                          {log.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>

            {/* RESPONSIVE VECTOR STACK (MOBILE ONLY VIEWPORTS) */}
            <Box sx={{ display: { xs: "block", lg: "none" }, p: 3, "& > :not(style)": { mb: 3 }, "& > :last-child": { mb: 0 } }}>
              {filteredLogs.map((log, index) => (
                <Card
                  key={log._id || index}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    bgcolor: "rgba(255,255,255,0.01)",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    position: "relative",
                    overflow: "hidden",
                    "&:active": { transform: "scale(0.98)" },
                    transition: "transform 0.2s",
                  }}
                >
                  <Box sx={{ position: "absolute", top: 0, right: 0, p: 2, opacity: 0.05, pointerEvents: "none" }}>
                    <FiShield size={48} />
                  </Box>

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "10px", fontWeight: 600, color: "#6735c8", letterSpacing: 0.5 }}>
                      {new Date(log.timestamp || log.createdAt).toLocaleString()}
                    </Typography>
                    <Box component="span" sx={getBadgeStyle(log.action)}>
                      {log.action}
                    </Box>
                  </Stack>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, letterSpacing: 0.5, mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar variant="rounded" sx={{ width: 24, height: 24, borderRadius: 1.5, bgcolor: "rgba(163, 119, 58, 0.2)", color: "#6735c8", "& .MuiSvgIcon-root": { fontSize: 12 } }}>
                      <FiUser size={12} />
                    </Avatar>
                    {log.user}
                  </Typography>

                  <Typography variant="body2" sx={{ fontSize: "11px", fontWeight: "bold", color: "text.disabled", leadingRelaxed: true, letterSpacing: 0.5 }}>
                    {log.description}
                  </Typography>
                </Card>
              ))}
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
};