import axiosInstance from "./axiosInstance";
import { normalizeFinancialIntelligenceResponse } from "./financialIntelligenceAdapter";

export const getFinancialIntelligenceOverview = async (params = {}, { signal } = {}) => {
  const response = await axiosInstance.get("/financial-intelligence/overview", {
    params,
    signal,
    skipGlobalLoader: true,
  });
  return normalizeFinancialIntelligenceResponse(response?.data);
};
