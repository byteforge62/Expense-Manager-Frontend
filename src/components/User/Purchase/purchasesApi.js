import axiosInstance from "../../Utils/axiosInstance";

/**
 * Purchase records API + presentation helpers.
 *
 * Every number rendered by the purchase screens comes from the server
 * (`/purchases/summary`), so page totals, the dashboard card and reports use
 * one calculation.
 */

export const PURCHASE_STATUSES = [
  "ORDERED",
  "SHIPPED",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
];

export const PURCHASE_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home",
  "Groceries",
  "Health",
  "Books",
  "Sports",
  "Gifts",
  "Other",
];

export const STATUS_LABELS = {
  ORDERED: "Ordered",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
};

export const emptyPurchaseForm = () => ({
  name: "",
  description: "",
  category: "Other",
  merchant: "",
  sourceWebsite: "",
  productUrl: "",
  imageUrl: "",
  unitPrice: "",
  quantity: "1",
  purchaseDate: new Date().toISOString().slice(0, 10),
  orderId: "",
  paymentMethod: "",
  warrantyUntil: "",
  notes: "",
  status: "DELIVERED",
  syncExpense: false,
  expenseCategoryID: "",
});

export const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

export const formatCompactMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

export const formatPurchaseDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

export const formatMonth = (value) => {
  if (!value) return "";

  const [year, month] = value.split("-");

  if (!year || !month) return value;

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
};

export const dateRangeForPreset = (preset) => {
  const now = new Date();
  const iso = (date) => date.toISOString().slice(0, 10);

  if (preset === "thisMonth") {
    return {
      startDate: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
      endDate: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }

  if (preset === "last3Months") {
    return {
      startDate: iso(new Date(now.getFullYear(), now.getMonth() - 2, 1)),
      endDate: iso(now),
    };
  }

  if (preset === "thisYear") {
    return {
      startDate: iso(new Date(now.getFullYear(), 0, 1)),
      endDate: iso(new Date(now.getFullYear(), 11, 31)),
    };
  }

  return { startDate: "", endDate: "" };
};

export const listPurchases = async (params) => {
  const response = await axiosInstance.get("/purchases/me", { params });

  return {
    items: Array.isArray(response.data.data) ? response.data.data : [],
    meta: response.data.meta || null,
  };
};

export const fetchPurchaseSummary = async (params) => {
  const response = await axiosInstance.get("/purchases/summary", { params });
  return response.data.data;
};

export const createPurchase = async (payload) => {
  const response = await axiosInstance.post("/purchases", payload);
  return response.data.data;
};

export const updatePurchase = async (id, payload) => {
  const response = await axiosInstance.put(`/purchases/${id}`, payload);
  return response.data.data;
};

export const deletePurchase = async (id) => {
  await axiosInstance.delete(`/purchases/${id}`);
};

export const uploadPurchaseImage = async (file) => {
  const body = new FormData();
  body.append("image", file);
  const response = await axiosInstance.post("/purchases/upload-image", body, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data?.url;
};

/**
 * Store connections: the shops a user has linked and their order imports.
 * The server owns the catalog, so a store added there appears here too.
 */
export const fetchStoreConnections = async () => {
  const response = await axiosInstance.get("/store-connections");
  const payload = response.data?.data;

  if (Array.isArray(payload)) return { stores: [], connections: [] };

  return {
    stores: Array.isArray(payload?.stores) ? payload.stores : [],
    connections: Array.isArray(payload?.connections) ? payload.connections : [],
  };
};

export const linkStoreAccount = async ({ provider, accountLabel }) => {
  const response = await axiosInstance.post("/store-connections", {
    provider,
    accountLabel,
  });
  return response.data.data;
};

export const unlinkStoreAccount = async (id) => {
  await axiosInstance.delete(`/store-connections/${id}`);
};

export const importStoreOrders = async (id, orders) => {
  const response = await axiosInstance.post(`/store-connections/${id}/import`, {
    orders,
  });
  return response.data.data;
};

export const fetchExpenseCategories = async () => {
  const response = await axiosInstance.get("/categories");
  const categories = response.data.data || response.data || [];
  return (Array.isArray(categories) ? categories : []).filter(
    (category) => category.type === "expense",
  );
};

/** Builds the create/update payload, omitting blank optional fields. */
export const purchasePayload = (form) => {
  const payload = {
    name: form.name.trim(),
    unitPrice: Number(form.unitPrice),
    quantity: Number(form.quantity) || 1,
    category: form.category || "Other",
    status: form.status,
  };

  if (form.description.trim()) payload.description = form.description.trim();
  if (form.merchant.trim()) payload.merchant = form.merchant.trim();
  if (form.sourceWebsite.trim()) payload.sourceWebsite = form.sourceWebsite.trim();
  if (form.productUrl.trim()) payload.productUrl = form.productUrl.trim();
  if (form.imageUrl) payload.imageUrl = form.imageUrl;
  if (form.purchaseDate) payload.purchaseDate = form.purchaseDate;
  if (form.orderId.trim()) payload.orderId = form.orderId.trim();
  if (form.paymentMethod.trim()) payload.paymentMethod = form.paymentMethod.trim();
  if (form.warrantyUntil) payload.warrantyUntil = form.warrantyUntil;
  if (form.notes.trim()) payload.notes = form.notes.trim();

  if (form.syncExpense && form.expenseCategoryID) {
    payload.syncExpense = true;
    payload.expenseCategoryID = form.expenseCategoryID;
  }

  return payload;
};

export const errorText = (error) => {
  const firstFieldError = error.response?.data?.errors?.[0]?.message;
  return (
    firstFieldError ||
    error.response?.data?.message ||
    error.message ||
    "The request could not be completed."
  );
};
