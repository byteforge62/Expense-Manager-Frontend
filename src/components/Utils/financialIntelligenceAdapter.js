const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);

const isValidCalendarDate = (value) => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
};

const normalizeNumber = (value, path, warnings) => {
  if (value === null || value === undefined) return null;
  if (isFiniteNumber(value)) return value;
  warnings.push(`${path} must be a finite number or null.`);
  return null;
};

const normalizeText = (value, path, warnings) => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "string") return value;
  warnings.push(`${path} must be a string.`);
  return null;
};

const normalizeDate = (value, path, warnings) => {
  const text = normalizeText(value, path, warnings);
  if (text === null) return null;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(text);
  const isoDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(text);
  if (
    (isoDate || isoDateTime) &&
    isValidCalendarDate(text) &&
    !Number.isNaN(Date.parse(text))
  ) {
    return text;
  }
  warnings.push(`${path} must be a valid date-time.`);
  return null;
};

const normalizeDateTime = (value, path, warnings) => {
  const text = normalizeText(value, path, warnings);
  if (text === null) return null;
  const isoDateTime =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(text);
  if (
    isoDateTime &&
    isValidCalendarDate(text) &&
    !Number.isNaN(Date.parse(text))
  ) {
    return text;
  }
  warnings.push(`${path} must be a valid ISO date-time.`);
  return null;
};

const normalizeTextArray = (value, path, warnings) => {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) {
    warnings.push(`${path} must be an array of strings.`);
    return null;
  }
  return value.flatMap((item, index) => {
    if (typeof item !== "string") {
      warnings.push(`${path}[${index}] must be a string.`);
      return [];
    }
    return [item];
  });
};

const normalizeBehaviorWindow = (value, warnings) => {
  const source = normalizeObject(value, "behavior.window", warnings);
  if (!source) return null;
  return {
    currentStart: normalizeDate(source.currentStart, "behavior.window.currentStart", warnings),
    currentEnd: normalizeDate(source.currentEnd, "behavior.window.currentEnd", warnings),
    comparisonStart: normalizeDate(
      source.comparisonStart,
      "behavior.window.comparisonStart",
      warnings,
    ),
    comparisonEnd: normalizeDate(
      source.comparisonEnd,
      "behavior.window.comparisonEnd",
      warnings,
    ),
    comparisonDays: normalizeNumber(
      source.comparisonDays,
      "behavior.window.comparisonDays",
      warnings,
    ),
  };
};

const normalizeComparisonWindow = (value, path, warnings) => {
  const source = normalizeObject(value, path, warnings);
  if (!source) return null;
  return {
    start: normalizeDate(source.start, `${path}.start`, warnings),
    end: normalizeDate(source.end, `${path}.end`, warnings),
  };
};

const normalizeConsistency = (value, path, warnings, extraNumericFields = []) => {
  const source = normalizeObject(value, path, warnings);
  if (!source) return null;
  return {
    ...numericFields(
      source,
      ["coefficientOfVariation", "coefficient", "observedDays", "receiptDays", ...extraNumericFields],
      path,
      warnings,
    ),
    level: normalizeText(source.level, `${path}.level`, warnings),
    explanation: normalizeText(source.explanation, `${path}.explanation`, warnings),
  };
};

const normalizeWeekdayPatterns = (value, warnings) => {
  const source = normalizeObject(value, "behavior.weekdayPatterns", warnings);
  if (!source) return null;
  const normalizePeriod = (periodName) => {
    const period = normalizeObject(source[periodName], `behavior.weekdayPatterns.${periodName}`, warnings);
    if (!period) return null;
    return Object.fromEntries(
      Object.entries(period).map(([day, pattern]) => {
        const path = `behavior.weekdayPatterns.${periodName}.${day}`;
        if (!isRecord(pattern)) {
          warnings.push(`${path} must be an object.`);
          return [day, null];
        }
        return [
          day,
          numericFields(
            pattern,
            ["amount", "transactionCount", "averageTransaction", "daysObserved", "averagePerDay"],
            path,
            warnings,
          ),
        ];
      }),
    );
  };
  return { current: normalizePeriod("current"), previous: normalizePeriod("previous") };
};

const normalizeObject = (value, path, warnings) => {
  if (value === null || value === undefined) return null;
  if (isRecord(value)) return value;
  warnings.push(`${path} must be an object.`);
  return null;
};

const normalizeArray = (value, path, warnings, mapper) => {
  if (value === null || value === undefined) return null;
  if (!Array.isArray(value)) {
    warnings.push(`${path} must be an array.`);
    return null;
  }
  const normalized = value.flatMap((item, index) => {
    if (!isRecord(item)) {
      warnings.push(`${path}[${index}] must be an object.`);
      return [];
    }
    return [mapper(item, `${path}[${index}]`, warnings)];
  });
  return value.length > 0 && normalized.length === 0 ? null : normalized;
};

const numericFields = (source, fields, path, warnings) =>
  Object.fromEntries(
    fields.map((field) => [
      field,
      normalizeNumber(source[field], `${path}.${field}`, warnings),
    ]),
  );

const normalizeMetricSeries = (value, path, warnings, fields) =>
  normalizeArray(value, path, warnings, (entry, entryPath, entryWarnings) => {
    if (entry.complete !== undefined && typeof entry.complete !== "boolean") {
      entryWarnings.push(`${entryPath}.complete must be a boolean.`);
    }
    return {
      ...numericFields(entry, fields, entryPath, entryWarnings),
      ...(entry.date !== undefined
        ? { date: normalizeDate(entry.date, `${entryPath}.date`, entryWarnings) }
        : {}),
      ...(entry.month !== undefined
        ? { month: normalizeText(entry.month, `${entryPath}.month`, entryWarnings) }
        : {}),
      ...(entry.complete !== undefined
        ? {
            complete:
              typeof entry.complete === "boolean" ? entry.complete : null,
          }
        : {}),
    };
  });

const normalizeMetrics = (value, warnings) => {
  const source = normalizeObject(value, "metrics", warnings);
  if (!source) return null;

  const period = normalizeObject(source.period, "metrics.period", warnings);
  const counts = normalizeObject(source.counts, "metrics.counts", warnings);
  const totals = normalizeObject(source.totals, "metrics.totals", warnings);
  const spending = normalizeObject(source.spending, "metrics.spending", warnings);
  const income = normalizeObject(source.income, "metrics.income", warnings);
  const cashFlow = normalizeObject(source.cashFlow, "metrics.cashFlow", warnings);
  const obligations = normalizeObject(source.obligations, "metrics.obligations", warnings);
  const comparison = normalizeObject(source.comparison, "metrics.comparison", warnings);

  const categoryTotalsSource = normalizeObject(
    spending?.categoryTotals,
    "metrics.spending.categoryTotals",
    warnings,
  );
  const categoryTotals = categoryTotalsSource
    ? Object.fromEntries(
        Object.entries(categoryTotalsSource).map(([category, amount]) => [
          category,
          normalizeNumber(
            amount,
            `metrics.spending.categoryTotals.${category}`,
            warnings,
          ),
        ]),
      )
    : null;

  return {
    period: period
      ? {
          startDate: normalizeDate(period.startDate, "metrics.period.startDate", warnings),
          endDate: normalizeDate(period.endDate, "metrics.period.endDate", warnings),
          days: normalizeNumber(period.days, "metrics.period.days", warnings),
        }
      : null,
    counts: counts
      ? numericFields(
          counts,
          [
            "incomeTransactions",
            "expenseTransactions",
            "incomeReceiptDays",
            "budgetRecords",
            "pendingBills",
            "recurringSchedules",
          ],
          "metrics.counts",
          warnings,
        )
      : null,
    totals: totals
      ? numericFields(
          totals,
          [
            "income",
            "expenses",
            "netCashFlow",
            "savingsRate",
            "expenseToIncomeRatio",
          ],
          "metrics.totals",
          warnings,
        )
      : null,
    spending: spending
      ? {
          ...numericFields(
            spending,
            [
              "averageDailySpending",
              "medianDailySpending",
              "spendingFrequency",
              "spendingVolatility",
              "spendingCoefficientOfVariation",
            ],
            "metrics.spending",
            warnings,
          ),
          categoryTotals,
          dailyTotals: normalizeMetricSeries(
            spending.dailyTotals,
            "metrics.spending.dailyTotals",
            warnings,
            ["amount"],
          ),
        }
      : null,
    income: income
      ? {
          ...numericFields(
            income,
            ["averageDailyIncome", "incomeStability"],
            "metrics.income",
            warnings,
          ),
          stabilityMethod: normalizeText(
            income.stabilityMethod,
            "metrics.income.stabilityMethod",
            warnings,
          ),
          dailyTotals: normalizeMetricSeries(
            income.dailyTotals,
            "metrics.income.dailyTotals",
            warnings,
            ["amount"],
          ),
        }
      : null,
    cashFlow: cashFlow
      ? {
          ...numericFields(
            cashFlow,
            ["positiveMonths", "observedMonths"],
            "metrics.cashFlow",
            warnings,
          ),
          monthly: normalizeMetricSeries(
            cashFlow.monthly,
            "metrics.cashFlow.monthly",
            warnings,
            ["income", "expenses", "netCashFlow", "daysCovered", "daysInMonth"],
          ),
        }
      : null,
    obligations: obligations
      ? {
          ...numericFields(
            obligations,
            [
              "totalBudget",
              "budgetMatchedSpending",
              "budgetUtilization",
              "pendingBills",
              "recurringMonthlyExpenses",
              "monthlyEquivalentIncome",
              "recurringCommitmentRatio",
              "unclassifiedRecurringSchedules",
            ],
            "metrics.obligations",
            warnings,
          ),
          budgetBreakdown: normalizeArray(
            obligations.budgetBreakdown,
            "metrics.obligations.budgetBreakdown",
            warnings,
            (item, path, itemWarnings) => ({
              category: normalizeText(item.category, `${path}.category`, itemWarnings),
              budget: normalizeNumber(item.budget, `${path}.budget`, itemWarnings),
              spending: normalizeNumber(item.spending, `${path}.spending`, itemWarnings),
              transactionCount: normalizeNumber(
                item.transactionCount,
                `${path}.transactionCount`,
                itemWarnings,
              ),
              utilization: normalizeNumber(
                item.utilization,
                `${path}.utilization`,
                itemWarnings,
              ),
              scope: normalizeText(item.scope, `${path}.scope`, itemWarnings),
            }),
          ),
        }
      : null,
    categoryBreakdown: normalizeArray(
      source.categoryBreakdown,
      "metrics.categoryBreakdown",
      warnings,
      (item, path, itemWarnings) => ({
        category: normalizeText(item.category, `${path}.category`, itemWarnings),
        transactionCount: normalizeNumber(
          item.transactionCount,
          `${path}.transactionCount`,
          itemWarnings,
        ),
        amount: normalizeNumber(item.amount, `${path}.amount`, itemWarnings),
        shareOfSpending: normalizeNumber(
          item.shareOfSpending,
          `${path}.shareOfSpending`,
          itemWarnings,
        ),
      }),
    ),
    comparison: comparison
      ? {
          ...numericFields(
            comparison,
            [
              "baselineIncome",
              "baselineExpenses",
              "totalIncomeChange",
              "totalExpensesChange",
              "savingsRateChange",
              "averageDailySpendingChange",
            ],
            "metrics.comparison",
            warnings,
          ),
          period: (() => {
            const period = normalizeObject(
              comparison.period,
              "metrics.comparison.period",
              warnings,
            );
            return period
              ? {
                  startDate: normalizeDate(
                    period.startDate,
                    "metrics.comparison.period.startDate",
                    warnings,
                  ),
                  endDate: normalizeDate(
                    period.endDate,
                    "metrics.comparison.period.endDate",
                    warnings,
                  ),
                  days: normalizeNumber(
                    period.days,
                    "metrics.comparison.period.days",
                    warnings,
                  ),
                }
              : null;
          })(),
        }
      : null,
  };
};

const normalizeHealth = (value, warnings) => {
  const source = normalizeObject(value, "financialHealth", warnings);
  if (!source) return null;
  const weightsSource = normalizeObject(
    source.scoringWeights,
    "financialHealth.scoringWeights",
    warnings,
  );
  const riskSource = normalizeObject(
    source.observedRisk,
    "financialHealth.observedRisk",
    warnings,
  );
  const inferredRiskSource = normalizeObject(
    source.inferredRisk,
    "financialHealth.inferredRisk",
    warnings,
  );
  const componentSource = normalizeObject(
    source.components,
    "financialHealth.components",
    warnings,
  );
  const components = componentSource
    ? Object.fromEntries(
        Object.entries(componentSource).map(([key, component]) => {
          const path = `financialHealth.components.${key}`;
          if (!isRecord(component)) {
            warnings.push(`${path} must be an object.`);
            return [key, null];
          }
          return [
            key,
            {
              weight: normalizeNumber(component.weight, `${path}.weight`, warnings),
              score: normalizeNumber(component.score, `${path}.score`, warnings),
              value: normalizeNumber(component.value, `${path}.value`, warnings),
              observed: normalizeText(component.observed, `${path}.observed`, warnings),
              explanation: normalizeText(
                component.explanation,
                `${path}.explanation`,
                warnings,
              ),
            },
          ];
        }),
      )
    : null;

  return {
    score: normalizeNumber(source.score, "financialHealth.score", warnings),
    label: normalizeText(source.label, "financialHealth.label", warnings),
    scoreRange: normalizeText(source.scoreRange, "financialHealth.scoreRange", warnings),
    scoringWeights: weightsSource
      ? Object.fromEntries(
          Object.entries(weightsSource).map(([key, weight]) => [
            key,
            normalizeNumber(weight, `financialHealth.scoringWeights.${key}`, warnings),
          ]),
        )
      : null,
    availableWeight: normalizeNumber(
      source.availableWeight,
      "financialHealth.availableWeight",
      warnings,
    ),
    method: normalizeText(source.method, "financialHealth.method", warnings),
    components,
    missingData: normalizeTextArray(
      source.missingData,
      "financialHealth.missingData",
      warnings,
    ),
    observedRisk: riskSource
      ? Object.fromEntries(
          Object.entries(riskSource).map(([key, risk]) => {
            const path = `financialHealth.observedRisk.${key}`;
            if (!isRecord(risk)) {
              warnings.push(`${path} must be an object.`);
              return [key, null];
            }
            return [
              key,
              {
                level: normalizeText(risk.level, `${path}.level`, warnings),
                explanation: normalizeText(risk.explanation, `${path}.explanation`, warnings),
                amount: normalizeNumber(risk.amount, `${path}.amount`, warnings),
                count: normalizeNumber(risk.count, `${path}.count`, warnings),
                shareOfMonthlyIncome: normalizeNumber(
                  risk.shareOfMonthlyIncome,
                  `${path}.shareOfMonthlyIncome`,
                  warnings,
                ),
              },
            ];
          }),
        )
      : null,
    inferredRisk: inferredRiskSource
      ? Object.fromEntries(
          Object.entries(inferredRiskSource).map(([key, risk]) => {
            const path = `financialHealth.inferredRisk.${key}`;
            if (!isRecord(risk)) {
              warnings.push(`${path} must be an object.`);
              return [key, null];
            }
            return [
              key,
              {
                level: normalizeText(risk.level, `${path}.level`, warnings),
                explanation: normalizeText(risk.explanation, `${path}.explanation`, warnings),
                shareOfMonthlyIncome: normalizeNumber(
                  risk.shareOfMonthlyIncome,
                  `${path}.shareOfMonthlyIncome`,
                  warnings,
                ),
              },
            ];
          }),
        )
      : null,
  };
};

const normalizeBehavior = (value, warnings) => {
  const source = normalizeObject(value, "behavior", warnings);
  if (!source) return null;
  const categoryChanges = normalizeObject(
    source.categoryChanges,
    "behavior.categoryChanges",
    warnings,
  );
  return {
    window: normalizeBehaviorWindow(source.window, warnings),
    observations: normalizeArray(
      source.observations,
      "behavior.observations",
      warnings,
      (item, path, itemWarnings) => ({
        type: normalizeText(item.type, `${path}.type`, itemWarnings),
        category: normalizeText(item.category, `${path}.category`, itemWarnings),
        currentDay: normalizeText(item.currentDay, `${path}.currentDay`, itemWarnings),
        observed: normalizeNumber(item.observed, `${path}.observed`, itemWarnings),
        baseline: normalizeNumber(item.baseline, `${path}.baseline`, itemWarnings),
        delta: normalizeNumber(item.delta, `${path}.delta`, itemWarnings),
        periodTotal: normalizeNumber(item.periodTotal, `${path}.periodTotal`, itemWarnings),
        daysObserved: normalizeNumber(item.daysObserved, `${path}.daysObserved`, itemWarnings),
        transactionCount: normalizeNumber(
          item.transactionCount,
          `${path}.transactionCount`,
          itemWarnings,
        ),
        changePercent: normalizeNumber(
          item.changePercent,
          `${path}.changePercent`,
          itemWarnings,
        ),
        comparison: (() => {
          const comparison = normalizeObject(item.comparison, `${path}.comparison`, itemWarnings);
          return comparison
            ? {
                currentPeriod: normalizeComparisonWindow(
                  comparison.currentPeriod,
                  `${path}.comparison.currentPeriod`,
                  itemWarnings,
                ),
                baselinePeriod: normalizeComparisonWindow(
                  comparison.baselinePeriod,
                  `${path}.comparison.baselinePeriod`,
                  itemWarnings,
                ),
              }
            : null;
        })(),
        summary: normalizeText(item.summary, `${path}.summary`, itemWarnings),
      }),
    ),
    categoryChanges: categoryChanges
      ? Object.fromEntries(
          Object.entries(categoryChanges).map(([category, change]) => {
            const path = `behavior.categoryChanges.${category}`;
            if (!isRecord(change)) {
              warnings.push(`${path} must be an object.`);
              return [category, null];
            }
            return [
              category,
              numericFields(
                change,
                ["current", "baseline", "delta", "changePercent"],
                path,
                warnings,
              ),
            ];
          }),
        )
      : null,
    spendingConsistency: normalizeConsistency(
      source.spendingConsistency,
      "behavior.spendingConsistency",
      warnings,
    ),
    incomeConsistency: normalizeConsistency(
      source.incomeConsistency,
      "behavior.incomeConsistency",
      warnings,
    ),
    weekdayPatterns: normalizeWeekdayPatterns(source.weekdayPatterns, warnings),
  };
};

const normalizeConfidence = (value, warnings) => {
  const source = normalizeObject(value, "dataConfidence", warnings);
  if (!source) return null;
  const samples = normalizeObject(source.samples, "dataConfidence.samples", warnings);
  if (source.level !== undefined && !["low", "medium", "high"].includes(source.level)) {
    warnings.push("dataConfidence.level must be low, medium, or high.");
  }
  return {
    level: ["low", "medium", "high"].includes(source.level) ? source.level : null,
    method: normalizeText(source.method, "dataConfidence.method", warnings),
    samples: samples
      ? Object.fromEntries(
          Object.entries(samples).map(([key, count]) => [
            key,
            normalizeNumber(count, `dataConfidence.samples.${key}`, warnings),
          ]),
        )
      : null,
    limitations: normalizeTextArray(
      source.limitations,
      "dataConfidence.limitations",
      warnings,
    ),
  };
};

const normalizeAnomalies = (value, warnings) =>
  normalizeArray(value, "anomalies", warnings, (item, path, itemWarnings) => {
    if (item.severity !== undefined && !["medium", "high"].includes(item.severity)) {
      itemWarnings.push(`${path}.severity must be medium or high.`);
    }
    return ({
    type: normalizeText(item.type, `${path}.type`, itemWarnings),
    title: normalizeText(item.title, `${path}.title`, itemWarnings),
    category: normalizeText(item.category, `${path}.category`, itemWarnings),
    transactionId: normalizeText(item.transactionId, `${path}.transactionId`, itemWarnings),
    transactionCount: normalizeNumber(
      item.transactionCount,
      `${path}.transactionCount`,
      itemWarnings,
    ),
    transactionIds: normalizeTextArray(
      item.transactionIds,
      `${path}.transactionIds`,
      itemWarnings,
    ),
    date: normalizeDate(item.date, `${path}.date`, itemWarnings),
    amount: normalizeNumber(item.amount, `${path}.amount`, itemWarnings),
    baseline: normalizeNumber(item.baseline, `${path}.baseline`, itemWarnings),
    deviation: normalizeNumber(item.deviation, `${path}.deviation`, itemWarnings),
    deviationPercent: normalizeNumber(
      item.deviationPercent,
      `${path}.deviationPercent`,
      itemWarnings,
    ),
    method: normalizeText(item.method, `${path}.method`, itemWarnings),
    severity: ["medium", "high"].includes(item.severity) ? item.severity : null,
    reason: normalizeText(item.reason, `${path}.reason`, itemWarnings),
    });
  });

const normalizeRecommendations = (value, warnings) =>
  normalizeArray(value, "recommendations", warnings, (item, path, itemWarnings) => {
    if (
      item.priority !== undefined &&
      !["critical", "high", "medium", "low"].includes(item.priority)
    ) {
      itemWarnings.push(`${path}.priority must be critical, high, medium, or low.`);
    }
    if (
      item.confidenceLevel !== undefined &&
      !["low", "medium", "high"].includes(item.confidenceLevel)
    ) {
      itemWarnings.push(`${path}.confidenceLevel must be low, medium, or high.`);
    }
    return ({
    id: normalizeText(item.id, `${path}.id`, itemWarnings),
    type: normalizeText(item.type, `${path}.type`, itemWarnings),
    title: normalizeText(item.title, `${path}.title`, itemWarnings),
    description: normalizeText(item.description, `${path}.description`, itemWarnings),
    priority: ["critical", "high", "medium", "low"].includes(item.priority)
      ? item.priority
      : null,
    priorityRank: normalizeNumber(item.priorityRank, `${path}.priorityRank`, itemWarnings),
    severity: normalizeText(item.severity, `${path}.severity`, itemWarnings),
    evidence: normalizeObject(item.evidence, `${path}.evidence`, itemWarnings),
    method: normalizeText(item.method, `${path}.method`, itemWarnings),
    estimatedFinancialImpact: (() => {
      const impact = normalizeObject(
        item.estimatedFinancialImpact,
        `${path}.estimatedFinancialImpact`,
        itemWarnings,
      );
      if (!impact) return null;
      return {
        amount: normalizeNumber(impact.amount, `${path}.estimatedFinancialImpact.amount`, itemWarnings),
        period: normalizeText(impact.period, `${path}.estimatedFinancialImpact.period`, itemWarnings),
        currency: normalizeText(impact.currency, `${path}.estimatedFinancialImpact.currency`, itemWarnings),
        basis: normalizeText(impact.basis, `${path}.estimatedFinancialImpact.basis`, itemWarnings),
        guaranteed: (() => {
          if (impact.guaranteed !== null && impact.guaranteed !== undefined && typeof impact.guaranteed !== "boolean") {
            itemWarnings.push(`${path}.estimatedFinancialImpact.guaranteed must be a boolean.`);
          }
          return typeof impact.guaranteed === "boolean" ? impact.guaranteed : null;
        })(),
      };
    })(),
    confidenceLevel: ["low", "medium", "high"].includes(item.confidenceLevel)
      ? item.confidenceLevel
      : null,
    nextStep: normalizeText(item.nextStep, `${path}.nextStep`, itemWarnings),
    });
  });

const normalizeRules = (value, warnings) =>
  normalizeArray(value, "rules", warnings, (item, path, itemWarnings) => {
    if (
      item.status !== undefined &&
      !["triggered", "clear", "not-evaluated"].includes(item.status)
    ) {
      itemWarnings.push(`${path}.status is not a supported rule status.`);
    }
    if (item.triggered !== undefined && typeof item.triggered !== "boolean") {
      itemWarnings.push(`${path}.triggered must be a boolean.`);
    }
    if (
      item.evidence !== undefined &&
      item.evidence !== null &&
      !isRecord(item.evidence) &&
      !Array.isArray(item.evidence)
    ) {
      itemWarnings.push(`${path}.evidence must be an object, array, or null.`);
    }
    return ({
    ruleId: normalizeText(item.ruleId, `${path}.ruleId`, itemWarnings),
    type: normalizeText(item.type, `${path}.type`, itemWarnings),
    condition: normalizeText(item.condition, `${path}.condition`, itemWarnings),
    threshold: normalizeObject(item.threshold, `${path}.threshold`, itemWarnings),
    severity: normalizeText(item.severity, `${path}.severity`, itemWarnings),
    priority: normalizeNumber(item.priority, `${path}.priority`, itemWarnings),
    status: ["triggered", "clear", "not-evaluated"].includes(item.status)
      ? item.status
      : null,
    triggered: typeof item.triggered === "boolean" ? item.triggered : null,
    explanation: normalizeText(item.explanation, `${path}.explanation`, itemWarnings),
    evidence: item.evidence === null || isRecord(item.evidence) || Array.isArray(item.evidence)
      ? item.evidence
      : null,
    });
  });

const normalizeRuleSummary = (value, warnings) => {
  const source = normalizeObject(value, "ruleSummary", warnings);
  if (!source) return null;
  const bySeverity = normalizeObject(source.bySeverity, "ruleSummary.bySeverity", warnings);
  return {
    ...numericFields(
      source,
      ["total", "evaluated", "triggered", "notEvaluated"],
      "ruleSummary",
      warnings,
    ),
    bySeverity: bySeverity
      ? numericFields(bySeverity, ["critical", "high", "medium", "low"], "ruleSummary.bySeverity", warnings)
      : null,
  };
};

export const normalizeFinancialIntelligenceResponse = (payload) => {
  let source = payload;
  if (isRecord(payload) && isRecord(payload.data)) source = payload.data;
  if (!isRecord(source)) {
    throw new TypeError("Financial Intelligence response must be an object.");
  }
  if (!isRecord(source.metrics)) {
    throw new TypeError("Financial Intelligence response is missing critical metrics.");
  }

  const warnings = [];
  return {
    generatedAt: normalizeDateTime(source.generatedAt, "generatedAt", warnings),
    dataConfidence: normalizeConfidence(source.dataConfidence, warnings),
    metrics: normalizeMetrics(source.metrics, warnings),
    behavior: normalizeBehavior(source.behavior, warnings),
    anomalies: normalizeAnomalies(source.anomalies, warnings),
    anomalySummary: (() => {
      const summary = normalizeObject(source.anomalySummary, "anomalySummary", warnings);
      return summary
        ? {
            count: normalizeNumber(summary.count, "anomalySummary.count", warnings),
            minimumTransactionBaseline: normalizeNumber(
              summary.minimumTransactionBaseline,
              "anomalySummary.minimumTransactionBaseline",
              warnings,
            ),
            minimumDailyBaseline: normalizeNumber(
              summary.minimumDailyBaseline,
              "anomalySummary.minimumDailyBaseline",
              warnings,
            ),
            insufficientBaseline:
              typeof summary.insufficientBaseline === "boolean"
                ? summary.insufficientBaseline
                : null,
            eligibleTransactionCategories: normalizeNumber(
              summary.eligibleTransactionCategories,
              "anomalySummary.eligibleTransactionCategories",
              warnings,
            ),
            baselinePeriod: (() => {
              const period = normalizeObject(
                summary.baselinePeriod,
                "anomalySummary.baselinePeriod",
                warnings,
              );
              return period
                ? {
                    startDate: normalizeDate(
                      period.startDate,
                      "anomalySummary.baselinePeriod.startDate",
                      warnings,
                    ),
                    endDate: normalizeDate(
                      period.endDate,
                      "anomalySummary.baselinePeriod.endDate",
                      warnings,
                    ),
                    days: normalizeNumber(
                      period.days,
                      "anomalySummary.baselinePeriod.days",
                      warnings,
                    ),
                  }
                : null;
            })(),
          }
        : null;
    })(),
    financialHealth: normalizeHealth(source.financialHealth, warnings),
    recommendations: normalizeRecommendations(source.recommendations, warnings),
    rules: normalizeRules(source.rules, warnings),
    ruleSummary: normalizeRuleSummary(source.ruleSummary, warnings),
    validationWarnings: warnings,
  };
};
