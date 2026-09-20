import { Category, CATEGORIES } from '../constants/categories';
import { Transaction } from '../models/Transaction';
import { currentMonthKey, dayKey, lastNMonthKeys, monthKey, shiftMonth } from '../utils/dates';

/**
 * AnalyticsService
 *
 * All financial arithmetic lives here. The LLM is NEVER asked to compute these
 * numbers; it only receives the structured output of this service.
 */

export interface CategorySpend {
    category: Category;
    amount: number;
    percentage: number;
    transactionCount: number;
}

export interface DailySpend {
    date: string; // YYYY-MM-DD
    amount: number;
}

export interface MonthlySpend {
    month: string; // YYYY-MM
    amount: number;
}

export interface MerchantSpend {
    merchant: string;
    amount: number;
    transactionCount: number;
}

export interface CategoryTrend {
    category: Category;
    currentAmount: number;
    previousAverage: number;
    changeAmount: number;
    changePercentage: number;
}

export interface AnalyticsSummary {
    month: string;
    totalSpent: number;
    transactionCount: number;
    averageTransaction: number;
    averageDailySpend: number;
    categories: CategorySpend[];
    categoryTotals: Record<string, number>;
    dailySpend: DailySpend[];
    monthlySpend: MonthlySpend[];
    topMerchants: MerchantSpend[];
    categoryTrends: CategoryTrend[];
    previousMonthTotal: number;
    monthOverMonthChange: number;
    monthOverMonthChangePercentage: number;
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}

export class AnalyticsService {
    /** Only SUCCESS transactions count toward spend. */
    private successful(transactions: Transaction[]): Transaction[] {
        return transactions.filter((t) => t.status === 'SUCCESS');
    }

    calculateTotalSpend(transactions: Transaction[]): number {
        return round2(
            this.successful(transactions).reduce((sum, t) => sum + t.amount, 0)
        );
    }

    calculateCategorySpend(transactions: Transaction[]): Record<string, number> {
        const totals: Record<string, number> = {};
        for (const t of this.successful(transactions)) {
            totals[t.category] = round2((totals[t.category] ?? 0) + t.amount);
        }
        return totals;
    }

    calculateCategoryPercentage(transactions: Transaction[]): CategorySpend[] {
        const total = this.calculateTotalSpend(transactions);
        const totals = this.calculateCategorySpend(transactions);
        const counts: Record<string, number> = {};
        for (const t of this.successful(transactions)) {
            counts[t.category] = (counts[t.category] ?? 0) + 1;
        }

        return CATEGORIES.map((category) => {
            const amount = totals[category] ?? 0;
            return {
                category,
                amount,
                percentage: total > 0 ? round2((amount / total) * 100) : 0,
                transactionCount: counts[category] ?? 0,
            };
        })
            .filter((c) => c.amount > 0)
            .sort((a, b) => b.amount - a.amount);
    }

    calculateDailySpend(transactions: Transaction[]): DailySpend[] {
        const totals: Record<string, number> = {};
        for (const t of this.successful(transactions)) {
            const key = dayKey(t.createdAt);
            totals[key] = round2((totals[key] ?? 0) + t.amount);
        }
        return Object.entries(totals)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    calculateMonthlySpend(transactions: Transaction[], months = 6): MonthlySpend[] {
        const totals: Record<string, number> = {};
        for (const t of this.successful(transactions)) {
            const key = monthKey(t.createdAt);
            totals[key] = round2((totals[key] ?? 0) + t.amount);
        }
        return lastNMonthKeys(months).map((month) => ({
            month,
            amount: totals[month] ?? 0,
        }));
    }

    calculateAverageSpend(transactions: Transaction[]): number {
        const successful = this.successful(transactions);
        if (successful.length === 0) {
            return 0;
        }
        return round2(this.calculateTotalSpend(successful) / successful.length);
    }

    calculateTopMerchants(transactions: Transaction[], limit = 5): MerchantSpend[] {
        const totals: Record<string, { amount: number; count: number }> = {};
        for (const t of this.successful(transactions)) {
            const key = t.merchant;
            const entry = totals[key] ?? { amount: 0, count: 0 };
            entry.amount = round2(entry.amount + t.amount);
            entry.count += 1;
            totals[key] = entry;
        }
        return Object.entries(totals)
            .map(([merchant, { amount, count }]) => ({
                merchant,
                amount,
                transactionCount: count,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit);
    }

    /**
     * Compares the current month's category spend against the average of the
     * preceding months. This is the evidence behind "spending increased" claims.
     */
    calculateCategoryTrends(transactions: Transaction[], lookbackMonths = 3): CategoryTrend[] {
        const current = currentMonthKey();
        const previousMonths = lastNMonthKeys(lookbackMonths + 1).filter((m) => m !== current);

        const currentTotals: Record<string, number> = {};
        const previousTotals: Record<string, number> = {};

        for (const t of this.successful(transactions)) {
            const key = monthKey(t.createdAt);
            if (key === current) {
                currentTotals[t.category] = round2((currentTotals[t.category] ?? 0) + t.amount);
            } else if (previousMonths.includes(key)) {
                previousTotals[t.category] = round2((previousTotals[t.category] ?? 0) + t.amount);
            }
        }

        const divisor = Math.max(previousMonths.length, 1);

        return CATEGORIES.map((category) => {
            const currentAmount = currentTotals[category] ?? 0;
            const previousAverage = round2((previousTotals[category] ?? 0) / divisor);
            const changeAmount = round2(currentAmount - previousAverage);
            const changePercentage =
                previousAverage > 0 ? round2((changeAmount / previousAverage) * 100) : currentAmount > 0 ? 100 : 0;
            return { category, currentAmount, previousAverage, changeAmount, changePercentage };
        })
            .filter((t) => t.currentAmount > 0 || t.previousAverage > 0)
            .sort((a, b) => b.changeAmount - a.changeAmount);
    }

    /** Full analytics summary for a given month (defaults to current month). */
    calculateSummary(transactions: Transaction[], month?: string): AnalyticsSummary {
        const targetMonth = month || currentMonthKey();
        const monthTransactions = this.successful(transactions).filter(
            (t) => monthKey(t.createdAt) === targetMonth
        );

        const previousMonth = shiftMonth(targetMonth, -1);
        const previousTransactions = this.successful(transactions).filter(
            (t) => monthKey(t.createdAt) === previousMonth
        );

        const totalSpent = this.calculateTotalSpend(monthTransactions);
        const previousMonthTotal = this.calculateTotalSpend(previousTransactions);
        const monthOverMonthChange = round2(totalSpent - previousMonthTotal);
        const monthOverMonthChangePercentage =
            previousMonthTotal > 0
                ? round2((monthOverMonthChange / previousMonthTotal) * 100)
                : totalSpent > 0
                    ? 100
                    : 0;

        const daysInMonth = new Set(monthTransactions.map((t) => dayKey(t.createdAt))).size || 1;

        return {
            month: targetMonth,
            totalSpent,
            transactionCount: monthTransactions.length,
            averageTransaction: this.calculateAverageSpend(monthTransactions),
            averageDailySpend: round2(totalSpent / daysInMonth),
            categories: this.calculateCategoryPercentage(monthTransactions),
            categoryTotals: this.calculateCategorySpend(monthTransactions),
            dailySpend: this.calculateDailySpend(monthTransactions),
            monthlySpend: this.calculateMonthlySpend(transactions),
            topMerchants: this.calculateTopMerchants(monthTransactions),
            categoryTrends: this.calculateCategoryTrends(transactions),
            previousMonthTotal,
            monthOverMonthChange,
            monthOverMonthChangePercentage,
        };
    }
}

export const analyticsService = new AnalyticsService();