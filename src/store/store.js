import { configureStore } from "@reduxjs/toolkit";

// =============== REDUCER IMPORTS ===============
// Domain specific slices
import authReducer from "./slices/authSlice";
import expenseReducer from "./slices/expenseSlice";
import transactionReducer from "./slices/transactionSlice";
import budgetReducer from "./slices/budgetSlice";
import incomeReducer from "./slices/incomeSlice";
import userReducer from "./slices/userSlice";
import categoryReducer from "./slices/categorySlice";
import logReducer from "./slices/logSlice";
import adminReportReducer from "./slices/adminReportSlice";

// Global UI state (loading, modals, etc.)
import uiReducer from "./slices/uiSlice";

/**
 * --- CENTRAL REDUX STORE ---
 * This is the "single source of truth" for the entire frontend.
 * Every piece of global state is managed through these reducers.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    expense: expenseReducer,
    transaction: transactionReducer,
    budget: budgetReducer,
    income: incomeReducer,
    user: userReducer,
    category: categoryReducer,
    log: logReducer,
    adminReport: adminReportReducer,
    ui: uiReducer,
  },
});

