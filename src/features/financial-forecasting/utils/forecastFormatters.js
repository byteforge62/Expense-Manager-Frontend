export const currency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const isFiniteNumber = (value) =>
  typeof value === "number" && Number.isFinite(value);

function extractPeriods(scenario) {
  if (Array.isArray(scenario)) return scenario;

  if (Array.isArray(scenario?.monthly)) {
    return scenario.monthly;
  }

  if (Array.isArray(scenario?.months)) {
    return scenario.months;
  }

  if (Array.isArray(scenario?.periods)) {
    return scenario.periods;
  }

  if (Array.isArray(scenario?.projections)) {
    return scenario.projections;
  }

  return null;
}

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
      throw new Error(
        `Forecast API response is missing the ${label} scenario.`,
      );
    }

    const periods = extractPeriods(value);

    if (!periods?.length) {
      throw new Error(`Forecast API response is missing ${label} periods.`);
    }

    const entries = periods.map((period, index) => {
      const closingBalance =
        period.closingBalance ??
        period.closingCash ??
        period.endingCash ??
        period.projectedClosingCash;

      if (!isFiniteNumber(closingBalance)) {
        throw new Error(
          `Invalid ${label} closing balance in period ${index + 1}.`,
        );
      }

      const periodLabel =
        period.month ?? period.label ?? period.period ?? period.startDate;

      if (periodLabel == null) {
        throw new Error(`Missing ${label} period label.`);
      }

      return {
        label: String(periodLabel),
        closingCash: closingBalance,
      };
    });

    const finalCash =
      value.closingBalance ??
      value.closingCash ??
      value.endingCash ??
      entries[entries.length - 1].closingCash;

    if (!isFiniteNumber(finalCash)) {
      throw new Error(`Invalid final closing balance for ${label} scenario.`);
    }

    return {
      id,
      label,
      description: value.description ?? "",
      periods: entries,
      finalCash,
    };
  });

  const expectedPeriods = scenarios[0].periods;
  const expectedCount = expectedPeriods.length;

  if (scenarios.some((scenario) => scenario.periods.length !== expectedCount)) {
    throw new Error("Forecast scenarios have inconsistent period counts.");
  }

  const chart = expectedPeriods.map((period, index) => {
    const row = {
      period: period.label,
    };

    scenarios.forEach((scenario) => {
      const scenarioPeriod = scenario.periods[index];

      if (scenarioPeriod.label !== period.label) {
        throw new Error("Forecast scenario periods are not aligned.");
      }

      row[scenario.id] = scenarioPeriod.closingCash;
    });

    return row;
  });

  return {
    scenarios,
    chart,
    warnings: Array.isArray(root.warnings) ? root.warnings : [],
    currency: root.currency ?? "INR",
    dataConfidence: root.dataConfidence ?? null,
    forecastPeriod: root.forecastPeriod ?? null,
    historicalWindow: root.historicalWindow ?? null,
    assumptions: Array.isArray(root.assumptions) ? root.assumptions : [],
  };
}
