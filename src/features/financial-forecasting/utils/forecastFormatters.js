export const currency = (amount, currencyCode = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

const extractPeriods = (scenario) => {
  if (Array.isArray(scenario?.monthly)) return scenario.monthly;
  if (Array.isArray(scenario?.months)) return scenario.months;
  if (Array.isArray(scenario?.periods)) return scenario.periods;
  if (Array.isArray(scenario?.projections)) return scenario.projections;
  return null;
};

const getMonthLabel = (value) => {
  if (!value) throw new Error("Forecast period is missing its month.");

  const date = new Date(`${value}-01T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid forecast month: ${value}`);
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
};

export function normalizeForecast(payload) {
  const root = payload?.data ?? payload?.forecast ?? payload;
  const source = root?.scenarios;

  if (!source || typeof source !== "object") {
    throw new Error("Forecast API response is missing scenario data.");
  }

  const variants = [
    ["expected", "Expected", source.expected],
    ["best", "Best case", source.best],
    ["worst", "Worst case", source.worst],
  ];

  const scenarios = variants.map(([id, label, value]) => {
    if (!value || typeof value !== "object") {
      throw new Error(`Forecast API response is missing ${label}.`);
    }

    const periods = extractPeriods(value);

    if (!periods?.length) {
      throw new Error(`Forecast API response is missing ${label} periods.`);
    }

    const monthly = periods.map((period, index) => {
      const month = period.month ?? period.label ?? period.period;

      const requiredFields = [
        "totalIncome",
        "totalExpenses",
        "netCashFlow",
        "closingBalance",
      ];

      for (const field of requiredFields) {
        if (!isFiniteNumber(period[field])) {
          throw new Error(`Invalid ${field} in ${label}, period ${index + 1}.`);
        }
      }

      const optionalFields = [
        "baselineIncome",
        "scheduledIncome",
        "baselineExpenses",
        "scheduledExpenses",
        "pendingBills",
        "daysCovered",
      ];

      const details = {};

      optionalFields.forEach((field) => {
        details[field] = isFiniteNumber(period[field]) ? period[field] : 0;
      });

      return {
        month,
        label: getMonthLabel(month),
        periodStart: period.periodStart ?? null,
        periodEnd: period.periodEnd ?? null,
        ...details,
        totalIncome: period.totalIncome,
        totalExpenses: period.totalExpenses,
        netCashFlow: period.netCashFlow,
        closingBalance: period.closingBalance,
      };
    });

    const finalCash = value.closingBalance;

    if (!isFiniteNumber(finalCash)) {
      throw new Error(`Invalid closing balance for ${label}.`);
    }

    const totals = ["totalIncome", "totalExpenses", "netCashFlow"];

    totals.forEach((field) => {
      if (!isFiniteNumber(value[field])) {
        throw new Error(`Invalid ${field} for ${label}.`);
      }
    });

    return {
      id,
      label,
      description: value.description ?? "",
      openingCash: value.openingCash,
      totalIncome: value.totalIncome,
      totalExpenses: value.totalExpenses,
      netCashFlow: value.netCashFlow,
      finalCash,
      periods: monthly,
    };
  });

  const expectedPeriods = scenarios[0].periods;

  scenarios.forEach((scenario) => {
    if (scenario.periods.length !== expectedPeriods.length) {
      throw new Error("Forecast scenarios have inconsistent period counts.");
    }

    scenario.periods.forEach((period, index) => {
      if (period.month !== expectedPeriods[index].month) {
        throw new Error("Forecast scenario periods are not aligned.");
      }
    });
  });

  const chart = expectedPeriods.map((period, index) => {
    const row = { period: period.label };

    scenarios.forEach((scenario) => {
      row[scenario.id] = scenario.periods[index].closingBalance;
    });

    return row;
  });

  return {
    openingCash: root.openingCash,
    scenarios,
    chart,
    monthlyDetails: scenarios[0].periods,
    warnings: Array.isArray(root.warnings) ? root.warnings : [],
    assumptions: Array.isArray(root.assumptions) ? root.assumptions : [],
    currency: root.currency ?? "INR",
    dataConfidence: root.dataConfidence ?? null,
    forecastPeriod: root.forecastPeriod ?? null,
    historicalWindow: root.historicalWindow ?? null,
    historicalDailyBaseline: root.historicalDailyBaseline ?? null,
    generatedAt: root.generatedAt ?? null,
  };
}
