
import axiosInstance from "../../../components/Utils/axiosInstance";

export async function requestFinancialForecast({ openingCash, horizonMonths }) {
  if (!Number.isFinite(openingCash) || openingCash < 0) {
    throw new Error("Opening cash must be a finite, non-negative amount.");
  }

  if (![3, 6, 12].includes(horizonMonths)) {
    throw new Error("Forecast horizon must be 3, 6, or 12 months.");
  }

  const response = await axiosInstance.post(
    "/financial-forecast",
    { openingCash, horizonMonths },
    { skipGlobalLoader: true },
  );

  return response.data?.data ?? response.data;
}
