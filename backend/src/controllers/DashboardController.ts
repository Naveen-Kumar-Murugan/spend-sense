import {
  transactionService,
  TransactionService,
} from "../services/TransactionService";
import {
  analyticsService,
  AnalyticsService,
  AnalyticsSummary,
} from "../services/AnalyticsService";
import {
  recurringPaymentService,
  RecurringPaymentService,
  RecurringPayment,
} from "../services/RecurringPaymentService";
import {
  insightService,
  InsightService,
  Insight,
} from "../services/InsightService";
import { Transaction } from "../models/Transaction";

export interface DashboardResponse {
  month: string;
  totalSpent: number;
  previousMonthTotal: number;
  monthOverMonthChange: number;
  monthOverMonthChangePercentage: number;
  categoryBreakdown: AnalyticsSummary["categories"];
  dailySpend: AnalyticsSummary["dailySpend"];
  monthlySpend: AnalyticsSummary["monthlySpend"];
  topMerchants: AnalyticsSummary["topMerchants"];
  recentTransactions: Transaction[];
  recurringPayments: RecurringPayment[];
  estimatedMonthlyRecurring: number;
  insights: Insight[];
  insightsGeneratedBy: "BEDROCK" | "FALLBACK";
}

export class DashboardController {
  constructor(
    private readonly transactions: TransactionService = transactionService,
    private readonly analytics: AnalyticsService = analyticsService,
    private readonly recurring: RecurringPaymentService = recurringPaymentService,
    private readonly insights: InsightService = insightService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponse> {
    const txns = await this.transactions.getAllForUser(userId);
    const summary = this.analytics.calculateSummary(txns);
    const recurringPayments = this.recurring.detect(txns);
    const estimatedMonthlyRecurring =
      this.recurring.estimateMonthlyRecurringTotal(recurringPayments);
    let insights: Insight[] = [];
    let insightsGeneratedBy: "BEDROCK" | "FALLBACK" = "FALLBACK";
    try {
      const result = await this.insights.generateInsights(userId);
      insights = result.insights;
      insightsGeneratedBy = result.generatedBy;
    } catch {
      insights = [];
    }

    return {
      month: summary.month,
      totalSpent: summary.totalSpent,
      previousMonthTotal: summary.previousMonthTotal,
      monthOverMonthChange: summary.monthOverMonthChange,
      monthOverMonthChangePercentage: summary.monthOverMonthChangePercentage,
      categoryBreakdown: summary.categories,
      dailySpend: summary.dailySpend,
      monthlySpend: summary.monthlySpend,
      topMerchants: summary.topMerchants,
      recentTransactions: txns.slice(0, 8),
      recurringPayments,
      estimatedMonthlyRecurring,
      insights,
      insightsGeneratedBy,
    };
  }
}

export const dashboardController = new DashboardController();
