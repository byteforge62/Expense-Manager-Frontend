import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { LazyMotion, m } from "framer-motion";
import { domAnimation } from "framer-motion";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid"; // Using MUI's optimized Grid v2
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Pagination from "@mui/material/Pagination";

import { FaSearch } from "react-icons/fa";
import { FiShield } from "react-icons/fi";

import { fetchUsers, deleteUser } from "../../redux/user/userSlice";

export const AccessControl = () => {
  const dispatch = useDispatch();

  const { users, loading } = useSelector((state) => state.user);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole =
      filterRole === "All" || user.roleId?.name === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleDelete = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await dispatch(deleteUser(userId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: 400, 
          gap: 2 
        }}
      >
        <CircularProgress color="cyan" size={48} />
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold', 
            color: 'cyan.main', 
            letterSpacing: '.2em', 
            textTransform: 'uppercase',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        >
          Syncing Permissions...
        </Typography>
      </Box>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <Box sx={{ pb: 5 }}>
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        justifyContent="between" 
        alignItems={{ xs: 'flex-start', md: 'flex-end' }} 
        spacing={3} 
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', trackingTight: -1, mb: 1 }}>
            Access <Box component="span" sx={{ color: 'cyan.main' }}>Governance</Box>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
            Manage system-wide permissions and security roles. Audit user clearance levels and active status.
          </Typography>
        </Box>

        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1.5} 
          sx={{ 
            bgcolor: 'background.paper', 
            border: 1, 
            borderColor: 'divider', 
            px: 2, 
            py: 1, 
            borderRadius: 3 
          }}
        >
          <Box 
            component="span" 
            className="animate-pulse"
            sx={{ w: 10, h: 10, borderRadius: '50%', bgcolor: 'cyan.main' }} 
          />
          <Typography variant="caption" sx={{ fontWeight: 'bold', letterSpacing: '.1em', color: 'text.secondary' }}>
            SECURITY OVERRIDE ACTIVE
          </Typography>
        </Stack>
      </Stack>

      <Box
        component={m.div}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          p: 2,
          mb: 4,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 4,
          boxShadow: 3
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search input */}
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              placeholder="Search by identity or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaSearch />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              value={filterRole}
              onChange={(e) => {
                setFilterRole(e.target.value);
                setCurrentPage(1);
              }}
            >
              <MenuItem value="All">All Clearance Levels</MenuItem>
              <MenuItem value="Admin">Tier 1: Admin</MenuItem>
              <MenuItem value="Manager">Tier 2: Manager</MenuItem>
              <MenuItem value="User">Tier 3: Standard User</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {paginatedUsers.length > 0 ? (
          paginatedUsers.map((user, index) => (
            <Grid size={{ xs: 12, md: 6, xl: 4 }} key={user._id}>
              <Card
                component={m.div}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                elevation={1}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  border: 1,
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'text.secondary'
                  },
                  transition: 'all 0.3s'
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', h: '100%', p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar 
                      variant="rounded" 
                      sx={{ bgcolor: 'background.default', border: 1, borderColor: 'divider', color: 'text.primary', fontWeight: 'bold' }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', noWrap: true }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ noWrap: true, display: 'block' }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1}>
                      <Chip 
                        size="small" 
                        label={user.roleId?.name || "UNASSIGNED"} 
                        color={user.roleId?.name === "Admin" ? "info" : user.roleId?.name === "Manager" ? "secondary" : "default"}
                        variant="outlined"
                      />
                      <Chip 
                        size="small" 
                        label={user.is_active ? "VERIFIED" : "RESTRICTED"} 
                        color={user.is_active ? "success" : "error"}
                      />
                    </Stack>

                    <Grid container spacing={2} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 3, border: 1, borderColor: 'divider' }}>
                      <Grid size={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 'bold' }}>METRIC/AGE</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{user.age || "N/A"}</Typography>
                      </Grid>
                      <Grid size={6} sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 'bold' }}>ENROLLED</Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Stack>

                  <Stack direction="row" spacing={2} sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Button fullWidth variant="outlined" size="small" color="inherit">
                      CONFIG
                    </Button>
                    <Button fullWidth variant="contained" size="small" color="error" onClick={() => handleDelete(user._id)}>
                      TERMINATE
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={12}>
            <Box sx={{ py: 12, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 4 }}>
              <FiShield size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <Typography color="text.secondary">
                No subjects detected in current cache scope.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 5 }}>
          <Pagination 
            count={totalPages} 
            page={currentPage} 
            onChange={(_, value) => setCurrentPage(value)} 
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
      </Box>
    </LazyMotion>
  );
};