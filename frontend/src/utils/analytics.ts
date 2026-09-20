/**
 * All financial maths lives here — never inside a component.
 * The real backend computes the same shapes; this module lets the frontend
 * behave identically while running on mock data.
 */
import type {
  Category,
  CategorySpend,
  DailySpend,
  DashboardData,
  Frequency,
  Insight,
  MerchantSpend,
  MonthlySpend,
  RecurringPayment,
  Transaction,
} from '@/types';
import { CATEGORY_META } from '@/constants/categories';
import { formatCurrency, monthKey } from './format';

export const round2 = (value: number): number => Math.round(value * 100) / 100;

export const isSpend = (txn: Transaction): boolean => txn.status === 'SUCCESS';

export const sumAmount = (transactions: Transaction[]): number =>
  round2(transactions.reduce((total, txn) => total + txn.amount, 0));

export function transactionsForMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((txn) => txn.createdAt.slice(0, 7) === month && isSpend(txn));
}

export function previousMonthKey(month: string): string {
  const [year, m] = month.split('-').map(Number);
  return monthKey(new Date(year, m - 2, 1));
}

export function percentChange(current: number, previous: number): number {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return round2(((current - previous) / previous) * 100);
}

export function buildCategoryBreakdown(transactions: Transaction[], total: number): CategorySpend[] {
  const buckets = new Map<Category, { amount: number; count: number }>();

  for (const txn of transactions) {
    const bucket = buckets.get(txn.category) ?? { amount: 0, count: 0 };
    bucket.amount += txn.amount;
    bucket.count += 1;
    buckets.set(txn.category, bucket);
  }

  return [...buckets.entries()]
    .filter(([, bucket]) => bucket.amount > 0)
    .map(([category, bucket]) => ({
      category,
      amount: round2(bucket.amount),
      percentage: total > 0 ? round2((bucket.amount / total) * 100) : 0,
      transactionCount: bucket.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildDailySpend(transactions: Transaction[], month: string): DailySpend[] {
  const [year, m] = month.split('-').map(Number);
  const daysInMonth = new Date(year, m, 0).getDate();
  const totals = new Map<string, number>();

  for (const txn of transactions) {
    const key = txn.createdAt.slice(0, 10);
    totals.set(key, (totals.get(key) ?? 0) + txn.amount);
  }

  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = `${month}-${String(index + 1).padStart(2, '0')}`;
    return { date, amount: round2(totals.get(date) ?? 0) };
  });
}

export function buildMonthlySpend(
  transactions: Transaction[],
  month: string,
  months = 6,
): MonthlySpend[] {
  const [year, m] = month.split('-').map(Number);
  return Array.from({ length: months }, (_, index) => {
    const key = monthKey(new Date(year, m - months + index, 1));
    return { month: key, amount: sumAmount(transactionsForMonth(transactions, key)) };
  });
}

export function buildTopMerchants(transactions: Transaction[], limit = 5): MerchantSpend[] {
  const buckets = new Map<string, { amount: number; count: number }>();

  for (const txn of transactions) {
    const bucket = buckets.get(txn.merchant) ?? { amount: 0, count: 0 };
    bucket.amount += txn.amount;
    bucket.count += 1;
    buckets.set(txn.merchant, bucket);
  }

  return [...buckets.entries()]
    .map(([merchant, bucket]) => ({
      merchant,
      amount: round2(bucket.amount),
      transactionCount: bucket.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

const frequencyFromGap = (days: number): Frequency => {
  if (days <= 10) return 'WEEKLY';
  if (days <= 45) return 'MONTHLY';
  if (days <= 120) return 'QUARTERLY';
  if (days <= 400) return 'YEARLY';
  return 'IRREGULAR';
};

/** Detects merchants charged on a steady cadence with a steady amount. */
export function detectRecurringPayments(transactions: Transaction[]): RecurringPayment[] {
  const byMerchant = new Map<string, Transaction[]>();

  for (const txn of transactions.filter(isSpend)) {
    byMerchant.set(txn.merchant, [...(byMerchant.get(txn.merchant) ?? []), txn]);
  }

  const recurring: RecurringPayment[] = [];

  byMerchant.forEach((items, merchant) => {
    if (items.length < 3) return;
    const ordered = [...items].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    const gaps: number[] = [];
    for (let i = 1; i < ordered.length; i += 1) {
      const gap =
        (new Date(ordered[i].createdAt).getTime() - new Date(ordered[i - 1].createdAt).getTime()) /
        86_400_000;
      gaps.push(gap);
    }

    const averageGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    const gapSpread =
      gaps.reduce((total, gap) => total + Math.abs(gap - averageGap), 0) / gaps.length;

    const amounts = ordered.map((txn) => txn.amount);
    const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const amountSpread =
      amounts.reduce((total, amount) => total + Math.abs(amount - averageAmount), 0) /
      amounts.length /
      (averageAmount || 1);

    const cadenceScore = 1 - Math.min(gapSpread / (averageGap || 1), 1);
    const amountScore = 1 - Math.min(amountSpread, 1);
    const confidence = round2(cadenceScore * 0.55 + amountScore * 0.45);

    if (confidence < 0.7) return;

    recurring.push({
      merchant,
      amount: round2(averageAmount),
      frequency: frequencyFromGap(averageGap),
      confidence,
      occurrences: ordered.length,
      lastChargedAt: ordered[ordered.length - 1].createdAt,
    });
  });

  return recurring.sort((a, b) => b.amount - a.amount);
}

const MONTHLY_MULTIPLIER: Record<Frequency, number> = {
  WEEKLY: 4.33,
  MONTHLY: 1,
  QUARTERLY: 1 / 3,
  YEARLY: 1 / 12,
  IRREGULAR: 0,
};

export function estimateMonthlyRecurring(recurring: RecurringPayment[]): number {
  return round2(
    recurring.reduce((total, item) => total + item.amount * MONTHLY_MULTIPLIER[item.frequency], 0),
  );
}

/** Transactions well above the usual amount for their category. */
export function detectUnusualSpends(transactions: Transaction[], month: string): Transaction[] {
  const monthly = transactionsForMonth(transactions, month);
  const averages = new Map<Category, number>();

  for (const category of new Set(transactions.filter(isSpend).map((t) => t.category))) {
    const items = transactions.filter((t) => isSpend(t) && t.category === category);
    averages.set(category, items.reduce((total, t) => total + t.amount, 0) / items.length);
  }

  return monthly
    .filter((txn) => txn.amount > (averages.get(txn.category) ?? 0) * 2.5)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);
}

/**
 * Deterministic insights — the same set the backend falls back to when
 * Bedrock is unavailable.
 */
export function buildFallbackInsights(dashboard: Omit<DashboardData, 'insights' | 'insightsGeneratedBy'>): Insight[] {
  const insights: Insight[] = [];
  const [top] = dashboard.categoryBreakdown;

  if (top) {
    insights.push({
      id: 'category_top',
      type: 'CATEGORY',
      title: `${CATEGORY_META[top.category].label} is your largest spending category`,
      detail: `${CATEGORY_META[top.category].label} accounts for ${formatCurrency(top.amount)} — ${top.percentage}% of everything you spent this month.`,
      evidence: { category: top.category, amount: top.amount, percentage: top.percentage },
    });
  }

  const [secondary] = dashboard.categoryBreakdown.slice(1);
  if (secondary) {
    insights.push({
      id: 'trend_up',
      type: 'TREND',
      title: `${CATEGORY_META[secondary.category].label} is climbing`,
      detail: `You have spent ${formatCurrency(secondary.amount)} on ${CATEGORY_META[secondary.category].label.toLowerCase()} across ${secondary.transactionCount} payments this month.`,
      evidence: {
        category: secondary.category,
        currentAmount: secondary.amount,
        transactionCount: secondary.transactionCount,
      },
    });
  }

  if (dashboard.recurringPayments.length > 0) {
    insights.push({
      id: 'recurring',
      type: 'RECURRING',
      title: `You have ${dashboard.recurringPayments.length} recurring payments`,
      detail: `Subscriptions and bills add up to about ${formatCurrency(dashboard.estimatedMonthlyRecurring)} every month.`,
      evidence: {
        count: dashboard.recurringPayments.length,
        estimatedMonthlyTotal: dashboard.estimatedMonthlyRecurring,
      },
    });
  }

  const direction = dashboard.monthOverMonthChange >= 0 ? 'more' : 'less';
  insights.push({
    id: 'mom',
    type: 'SUMMARY',
    title: `Spending ${dashboard.monthOverMonthChange >= 0 ? 'increased' : 'eased off'} vs last month`,
    detail: `You spent ${formatCurrency(dashboard.totalSpent)} this month, ${formatCurrency(Math.abs(dashboard.monthOverMonthChange))} ${direction} than last month (${Math.abs(dashboard.monthOverMonthChangePercentage)}%).`,
    evidence: {
      totalSpent: dashboard.totalSpent,
      previousMonthTotal: dashboard.previousMonthTotal,
      change: dashboard.monthOverMonthChange,
    },
  });

  const [biggestMerchant] = dashboard.topMerchants;
  if (biggestMerchant) {
    insights.push({
      id: 'merchant_top',
      type: 'CATEGORY',
      title: `${biggestMerchant.merchant} took the biggest share`,
      detail: `${biggestMerchant.transactionCount} payments to ${biggestMerchant.merchant} came to ${formatCurrency(biggestMerchant.amount)}.`,
      evidence: { merchant: biggestMerchant.merchant, amount: biggestMerchant.amount },
    });
  }

  return insights.slice(0, 6);
}

/** Assembles the full dashboard payload from a flat transaction list. */
export function buildDashboard(transactions: Transaction[], month: string): DashboardData {
  const current = transactionsForMonth(transactions, month);
  const previousKey = previousMonthKey(month);
  const totalSpent = sumAmount(current);
  const previousMonthTotal = sumAmount(transactionsForMonth(transactions, previousKey));
  const recurringPayments = detectRecurringPayments(transactions);

  const base = {
    month,
    totalSpent,
    transactionCount: current.length,
    previousMonthTotal,
    monthOverMonthChange: round2(totalSpent - previousMonthTotal),
    monthOverMonthChangePercentage: percentChange(totalSpent, previousMonthTotal),
    categoryBreakdown: buildCategoryBreakdown(current, totalSpent),
    dailySpend: buildDailySpend(current, month),
    monthlySpend: buildMonthlySpend(transactions, month),
    topMerchants: buildTopMerchants(current),
    recentTransactions: sortByDateDesc(
      transactions.filter((txn) => txn.createdAt.slice(0, 7) === month),
    ).slice(0, 8),
    recurringPayments,
    estimatedMonthlyRecurring: estimateMonthlyRecurring(recurringPayments),
  };

  return { ...base, insights: buildFallbackInsights(base), insightsGeneratedBy: 'FALLBACK' };
}

/** Month-over-month movement per category, largest swing first. */
export function buildCategoryChanges(
  currentMonth: Transaction[],
  previousMonth: Transaction[],
): Array<{
  category: Category;
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}> {
  const totals = (items: Transaction[]): Map<Category, number> => {
    const map = new Map<Category, number>();
    for (const txn of items.filter(isSpend)) {
      map.set(txn.category, (map.get(txn.category) ?? 0) + txn.amount);
    }
    return map;
  };

  const currentTotals = totals(currentMonth);
  const previousTotals = totals(previousMonth);
  const categories = new Set<Category>([...currentTotals.keys(), ...previousTotals.keys()]);

  return [...categories]
    .map((category) => {
      const current = round2(currentTotals.get(category) ?? 0);
      const previous = round2(previousTotals.get(category) ?? 0);
      return {
        category,
        current,
        previous,
        change: round2(current - previous),
        changePercentage: percentChange(current, previous),
      };
    })
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
}
