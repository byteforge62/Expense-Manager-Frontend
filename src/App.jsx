// =============== CORE IMPORTS ===============
// Standard React and Router hooks
import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

// =============== GLOBAL STYLES ===============
// Our main CSS files that handle the theme and general layout
import "./App.css";
import "./index.css";

// =============== COMMON COMPONENTS ===============
// Shared UI elements like the loader and layouts
import GlobalLoader from "./components/Common/GlobalLoader";
import { Content } from "./components/Common/Content";
import { PublicLayout } from "./components/Layouts/PublicLayout";
import { PrivateRoutes } from "./components/Hooks/PrivateRoutes";

// =============== AUTH PAGES ===============
import { Login } from "./Login";
import { Signup } from "./Signup";

// =============== USER COMPONENTS ===============
// Everything a regular user needs to see and manage
import { UserDashboardLayout } from "./components/User/UserDashboardLayout";
import { UserDashboard } from "./components/User/UserDashboard";
import { UserExpenses } from "./components/User/Expense/UserExpenses";
import { UserBudget } from "./components/User/Budget/UserBudget";
import { UserIncome } from "./components/User/Income/UserIncome";
import { RecurringTransactions } from "./components/User/RecurringTransactions";
import { Reports } from "./components/User/Reports";
import { Transaction } from "./components/User/Transaction";
import { PurchaseIntelligence } from "./features/purchase-intelligence/PurchaseIntelligence";
import { FinancialForecast } from "./features/financial-forecasting/FinancialForecast";
// =============== ADMIN COMPONENTS ===============
// Management tools reserved for administrative accounts
import { AdminDashboardLayout } from "./components/Admin/AdminDashboardLayout";
import { AdminDashboard } from "./components/Admin/AdminDashboard";
import { AccessControl } from "./components/Admin/AccessControl";
import { ManageCategories } from "./components/Admin/ManageCategories";
import { ManageUsers } from "./components/Admin/ManageUsers";
import { ReportAdmins } from "./components/Admin/ReportAdmins";
import { Systemlog } from "./components/Admin/Systemlog";
import { UserDetails } from "./components/Admin/UserDetails";
import { Account } from "./components/Admin/Account";

/**
 * --- MAIN APPLICATION COMPONENT ---
 * This is where we define the global structure and routing of the app.
 */
function App() {
  const location = useLocation();

  // SIDE EFFECT: Dynamically update the body class based on where the user is.
  // This helps us apply specific background styles for different app sections.
  useEffect(() => {
    const path = location.pathname;

    if (path === "/login" || path === "/signup") {
      document.body.className = "auth-page";
    } else if (path.startsWith("/admin")) {
      document.body.className = "admin-layout";
    } else if (path.startsWith("/user")) {
      document.body.className = "user-layout";
    } else {
      document.body.className = "public-layout";
    }
  }, [location]);

  return (
    <>
      {/* 
          This loader is controlled via Redux and shows up 
          automatically during any global API requests. 
      */}
      <GlobalLoader />

      <Routes>
        {/* --- PUBLIC AREA --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Content />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* --- PRIVATE USER AREA --- */}
        {/* Only logged-in users can reach these sub-routes */}
        <Route element={<PrivateRoutes />}>
          <Route path="/private" element={<UserDashboardLayout />}>
            <Route path="expenses" element={<UserExpenses />} />
            <Route path="budget" element={<UserBudget />} />
            <Route path="income" element={<UserIncome />} />
            <Route path="recurring" element={<RecurringTransactions />} />
            <Route path="reports" element={<Reports />} />
            <Route path="transactions" element={<Transaction />} />
            <Route path="purchases" element={<PurchaseIntelligence />} />
            <Route path="forecast" element={<FinancialForecast />} />
            <Route path="userdashboard" element={<UserDashboard />} />
            <Route path="account/:userId" element={<Account />} />
          </Route>
        </Route>

        {/* --- ADMIN PANEL --- */}
        {/* Restricted to users with administrative privileges */}
        <Route element={<PrivateRoutes />}>
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route path="admindashboard" element={<AdminDashboard />} />
            <Route path="accesscontrol" element={<AccessControl />} />
            <Route path="managecategories" element={<ManageCategories />} />
            <Route path="manageusers" element={<ManageUsers />} />
            <Route path="reportadmins" element={<ReportAdmins />} />
            <Route path="systemlogs" element={<Systemlog />} />
            <Route path="user/:userId" element={<UserDetails />} />
            <Route path="account/:userId" element={<Account />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;

