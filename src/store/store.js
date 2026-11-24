import { configureStore } from "@reduxjs/toolkit";

// =============== REDUCER IMPORTS ===============
// Domain specific slices
import authReducer from "./slices/authSlice";
import expensesReducer from "./slices/expensesSlice";
import transactionReducer from "./slices/transactionSlice";
import budgetReducer from "./slices/budgetSlice";
import incomeReducer from "./slices/incomeSlice";
import userReducer from "./slices/userSlice";
import categoryReducer from "./slices/categorySlice";
import logReducer from "./slices/logSlice";
import adminReportReducer from "./slices/adminReportSlice";
import demoReducer from "./slices/demoSlice";

// Global UI state (loading, modals, etc.)
import uiReducer from "./slices/uiSlice";

/**
 * --- CENTRAL REDUX STORE ---
 * This is the "single source of truth" for the entire frontend.
 * Every piece of global state is managed through these reducers.
 *
 * Structure:
 *   store.js        -> configureStore + slice registration
 *   hooks.js        -> useAppDispatch / useAppSelector
 *   slices/         -> one file per feature
 *
 * This project is JavaScript, so the RootState/AppDispatch types are declared
 * as JSDoc typedefs. They give editors the same completion and checking that
 * the TypeScript equivalents would, without adding a build step.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    expenses: expensesReducer,
    transaction: transactionReducer,
    budget: budgetReducer,
    income: incomeReducer,
    user: userReducer,
    category: categoryReducer,
    log: logReducer,
    adminReport: adminReportReducer,
    demo: demoReducer,
    ui: uiReducer,
  },
});

/** @typedef {ReturnType<typeof store.getState>} RootState */
/** @typedef {typeof store.dispatch} AppDispatch */
