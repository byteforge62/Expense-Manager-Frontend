import axiosInstance from "../../Utils/axiosInstance";

/**
 * Investment tracking API.
 *
 * Quotes come from the API's cached public market data (Yahoo Finance for
 * stocks/ETFs, MFAPI for mutual funds). The page never calls a market provider
 * directly, so no key or third-party origin is exposed to the browser.
 */

export const fetchPortfolio = async () => {
  const response = await axiosInstance.get("/investments", {
    skipGlobalLoader: true,
  });
  return response.data.data;
};

export const fetchMarketOverview = async () => {
  const response = await axiosInstance.get("/investments/market/overview", {
    skipGlobalLoader: true,
  });
  return response.data.data;
};

export const searchMarketAssets = async (query) => {
  const response = await axiosInstance.get("/investments/market/search", {
    params: { q: query },
    skipGlobalLoader: true,
  });
  return Array.isArray(response.data.data) ? response.data.data : [];
};

export const createHolding = async (payload) => {
  const response = await axiosInstance.post("/investments", payload);
  return response.data.data;
};

export const updateHolding = async (id, payload) => {
  const response = await axiosInstance.put(`/investments/${id}`, payload);
  return response.data.data;
};

export const deleteHolding = async (id) => {
  await axiosInstance.delete(`/investments/${id}`);
};

export const fetchTransactions = async (id) => {
  const response = await axiosInstance.get(`/investments/${id}/transactions`, {
    skipGlobalLoader: true,
  });
  return response.data.data;
};

export const recordTransaction = async (id, payload) => {
  const response = await axiosInstance.post(
    `/investments/${id}/transactions`,
    payload,
  );
  return response.data.data;
};

export const deleteTransaction = async (id, transactionId) => {
  const response = await axiosInstance.delete(
    `/investments/${id}/transactions/${transactionId}`,
  );
  return response.data.data;
};

export const buildInvestmentPlan = async (payload) => {
  const response = await axiosInstance.post("/investments/plan", payload, {
    skipGlobalLoader: true,
  });
  return response.data.data;
};

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

export const formatPercent = (value) =>
  value == null ? "—" : `${Number(value) > 0 ? "+" : ""}${value}%`;

export const errorText = (error) =>
  error.response?.data?.errors?.[0]?.message ||
  error.response?.data?.message ||
  error.message ||
  "The request could not be completed.";
