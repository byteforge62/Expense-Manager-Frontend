// =============== CORE IMPORTS ===============
// Standard React and Router hooks
import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";

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
const lazyNamed = (loader, exportName) =>
  lazy(() => loader().then((module) => ({ default: module[exportName] })));

const UserDashboard = lazyNamed(
  () => import("./components/User/UserDashboard"),
  "UserDashboard",
);
const FinancialIntelligencePage = lazy(
  () => import("./components/User/FinancialIntelligencePage"),
);
const FinancialForecast = lazyNamed(
  () => import("./components/User/FinancialForecast"),
  "FinancialForecast",
);
const PurchaseIntelligence = lazyNamed(
  () => import("./components/User/PurchaseIntelligence"),
  "PurchaseIntelligence",
);
const Bills = lazyNamed(
  () => import("./components/User/Bills"),
  "Bills",
);
const UserExpenses = lazyNamed(
  () => import("./components/User/Expense/UserExpenses"),
  "UserExpenses",
);
const UserBudget = lazyNamed(
  () => import("./components/User/Budget/UserBudget"),
  "UserBudget",
);
const UserIncome = lazyNamed(
  () => import("./components/User/Income/UserIncome"),
  "UserIncome",
);
const RecurringTransactions = lazyNamed(
  () => import("./components/User/RecurringTransactions"),
  "RecurringTransactions",
);
const Reports = lazyNamed(
  () => import("./components/User/Reports"),
  "Reports",
);
const Transaction = lazyNamed(
  () => import("./components/User/Transaction"),
  "Transaction",
);
const Account = lazyNamed(
  () => import("./components/Admin/Account"),
  "Account",
);

const AdminDashboard = lazyNamed(
  () => import("./components/Admin/AdminDashboard"),
  "AdminDashboard",
);
const AccessControl = lazyNamed(
  () => import("./components/Admin/AccessControl"),
  "AccessControl",
);
const ManageCategories = lazyNamed(
  () => import("./components/Admin/ManageCategories"),
  "ManageCategories",
);
const ManageUsers = lazyNamed(
  () => import("./components/Admin/ManageUsers"),
  "ManageUsers",
);
const ReportAdmins = lazyNamed(
  () => import("./components/Admin/ReportAdmins"),
  "ReportAdmins",
);
const Systemlog = lazyNamed(
  () => import("./components/Admin/Systemlog"),
  "Systemlog",
);
const UserDetails = lazyNamed(
  () => import("./components/Admin/UserDetails"),
  "UserDetails",
);

// =============== ADMIN COMPONENTS ===============
// Management tools reserved for administrative accounts
import { AdminDashboardLayout } from "./components/Admin/AdminDashboardLayout";

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
    } else if (path.startsWith("/private")) {
      document.body.className = "user-layout";
    } else {
      document.body.className = "public-layout";
    }
  }, [location.pathname]);

  return (
    <>
      {/* 
          This loader is controlled via Redux and shows up 
          automatically during any global API requests. 
      */}
      <GlobalLoader />

      <Suspense fallback={<div role="status" className="p-6 text-sm text-[var(--text-muted)]">Loading page…</div>}>
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
            <Route
              path="forecast"
              element={<Suspense fallback={<div role="status">Loading forecast…</div>}><FinancialForecast /></Suspense>}
            />
            <Route
              path="purchases"
              element={<Suspense fallback={<div role="status">Loading purchase intelligence…</div>}><PurchaseIntelligence /></Suspense>}
            />
            <Route
              path="bills"
              element={<Suspense fallback={<div role="status">Loading bills…</div>}><Bills /></Suspense>}
            />
            <Route path="userdashboard" element={<UserDashboard />} />
            <Route
              path="financial-intelligence"
              element={
                <Suspense fallback={<div role="status">Loading financial intelligence…</div>}>
                  <FinancialIntelligencePage />
                </Suspense>
              }
            />
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
      </Suspense>
    </>
  );
}

export default App;
