import {
  AnalyticsService,
  analyticsService,
  AnalyticsSummary,
} from "./AnalyticsService";
import {
  RecurringPaymentService,
  recurringPaymentService,
} from "./RecurringPaymentService";
import { TransactionService, transactionService } from "./TransactionService";
import { BedrockClient, bedrockClient } from "../clients/BedrockClient";
import { CATEGORY_META } from "../constants/categories";
import { Transaction } from "../models/Transaction";
import { logger } from "../utils/logger";
import { monthLabel } from "../utils/dates";

/**
 * InsightService
 *
 * The bridge between deterministic analytics and the LLM. It:
 *   1. Retrieves the user's transactions.
 *   2. Computes structured financial facts via AnalyticsService.
 *   3. Asks Bedrock to explain those facts in natural language.
 *   4. Preserves the underlying facts so the UI can show the evidence.
 *
 * If Bedrock is unavailable (no model access, offline dev), it falls back to a
 * deterministic, fact-grounded narrative so the product never breaks.
 */

export interface Insight {
  id: string;
  type: "CATEGORY" | "TREND" | "RECURRING" | "SUMMARY";
  title: string;
  detail: string;
  /** The numbers that justify this insight. */
  evidence: Record<string, unknown>;
}

export interface InsightsResponse {
  insights: Insight[];
  generatedBy: "BEDROCK" | "FALLBACK";
  month: string;
}

export interface FinancialAnswer {
  question: string;
  answer: string;
  generatedBy: "BEDROCK" | "FALLBACK";
  evidence: Record<string, unknown>;
}

const SYSTEM_PROMPT = [
  "You are SpendSense, a financial insights assistant.",
  "You explain spending patterns using ONLY the numerical facts provided.",
  "Never invent numbers. Never perform arithmetic — all values are already computed.",
  "Do not make personal judgements (e.g. never say the user is wasting money).",
  "Be concise, specific, and cite the provided figures.",
].join(" ");

export class InsightService {
  constructor(
    private readonly analytics: AnalyticsService = analyticsService,
    private readonly transactions: TransactionService = transactionService,
    private readonly recurring: RecurringPaymentService = recurringPaymentService,
    private readonly bedrock: BedrockClient = bedrockClient,
  ) {}

  /** Generates a set of insights for the authenticated user. */
  async generateInsights(userId: string): Promise<InsightsResponse> {
    const txns = await this.transactions.getAllForUser(userId);
    const summary = this.analytics.calculateSummary(txns);
    const recurringPayments = this.recurring.detect(txns);

    // Baseline deterministic insights always exist.
    const deterministic = this.buildDeterministicInsights(
      summary,
      recurringPayments,
    );

    if (txns.length === 0) {
      return {
        insights: deterministic,
        generatedBy: "FALLBACK",
        month: summary.month,
      };
    }

    const facts = this.buildFacts(summary, recurringPayments);
    const prompt = this.buildInsightsPrompt(facts);

    try {
      const text = await this.bedrock.invokeText({
        system: SYSTEM_PROMPT,
        prompt,
      });
      const aiInsights = this.parseInsights(text, summary);
      // Merge: AI narrative first, then any deterministic insights it missed.
      const merged = [...aiInsights, ...deterministic].slice(0, 6);
      return { insights: merged, generatedBy: "BEDROCK", month: summary.month };
    } catch (err) {
      logger.warn("Falling back to deterministic insights", {
        error: (err as Error).message,
      });
      return {
        insights: deterministic,
        generatedBy: "FALLBACK",
        month: summary.month,
      };
    }
  }

  /**
   * Answers a natural-language financial question grounded in the user's data.
   */
  async answerFinancialQuestion(
    userId: string,
    question: string,
  ): Promise<FinancialAnswer> {
    const txns = await this.transactions.getAllForUser(userId);
    const summary = this.analytics.calculateSummary(txns);

    const evidence = this.buildQuestionFacts(summary, txns);

    if (txns.length === 0) {
      return {
        question,
        answer:
          "You have no recorded transactions yet. Log a payment and I will be able to explain your spending.",
        generatedBy: "FALLBACK",
        evidence,
      };
    }

    const prompt = this.buildQuestionPrompt(question, evidence);

    try {
      const text = await this.bedrock.invokeText({
        system: SYSTEM_PROMPT,
        prompt,
        maxTokens: 700,
      });
      return { question, answer: text, generatedBy: "BEDROCK", evidence };
    } catch (err) {
      logger.warn("Falling back to deterministic answer", {
        error: (err as Error).message,
      });
      return {
        question,
        answer: this.buildDeterministicAnswer(summary),
        generatedBy: "FALLBACK",
        evidence,
      };
    }
  }

  // ----- Fact construction (what the LLM receives) -----

  private buildFacts(
    summary: AnalyticsSummary,
    recurring: ReturnType<RecurringPaymentService["detect"]>,
  ) {
    const topCategory = summary.categories[0];
    const biggestIncrease = summary.categoryTrends.find(
      (t) => t.changeAmount > 0,
    );
    return {
      month: monthLabel(summary.month),
      totalSpent: summary.totalSpent,
      previousMonthTotal: summary.previousMonthTotal,
      monthOverMonthChange: summary.monthOverMonthChange,
      monthOverMonthChangePercentage: summary.monthOverMonthChangePercentage,
      topCategory: topCategory
        ? {
            category: CATEGORY_META[topCategory.category].label,
            amount: topCategory.amount,
            percentage: topCategory.percentage,
          }
        : null,
      categories: summary.categories.map((c) => ({
        category: CATEGORY_META[c.category].label,
        amount: c.amount,
        percentage: c.percentage,
      })),
      biggestIncrease: biggestIncrease
        ? {
            category: CATEGORY_META[biggestIncrease.category].label,
            currentAmount: biggestIncrease.currentAmount,
            recentAverage: biggestIncrease.previousAverage,
            changePercentage: biggestIncrease.changePercentage,
          }
        : null,
      topMerchants: summary.topMerchants,
      recurringPayments: recurring.map((r) => ({
        merchant: r.merchant,
        amount: r.amount,
        frequency: r.frequency,
      })),
    };
  }

  private buildQuestionFacts(summary: AnalyticsSummary, txns: Transaction[]) {
    const increases = summary.categoryTrends
      .filter((t) => t.changeAmount > 0)
      .slice(0, 3)
      .map((t) => ({
        category: CATEGORY_META[t.category].label,
        increase: t.changeAmount,
        currentAmount: t.currentAmount,
        recentAverage: t.previousAverage,
        changePercentage: t.changePercentage,
      }));

    // Large transactions contributing to the biggest increasing category.
    const biggest = summary.categoryTrends.find((t) => t.changeAmount > 0);
    const largeTransactions = biggest
      ? txns
          .filter(
            (t) => t.category === biggest.category && t.status === "SUCCESS",
          )
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 3)
          .map((t) => ({
            merchant: t.merchant,
            amount: t.amount,
            date: t.createdAt.slice(0, 10),
          }))
      : [];

    return {
      month: monthLabel(summary.month),
      totalSpent: summary.totalSpent,
      previousMonthTotal: summary.previousMonthTotal,
      monthOverMonthChange: summary.monthOverMonthChange,
      monthOverMonthChangePercentage: summary.monthOverMonthChangePercentage,
      categoryIncreases: increases,
      topContributingTransactions: largeTransactions,
      categories: summary.categories.map((c) => ({
        category: CATEGORY_META[c.category].label,
        amount: c.amount,
      })),
    };
  }

  private buildInsightsPrompt(facts: unknown): string {
    return [
      "Based ONLY on the following pre-computed facts, write 3 short, specific insights.",
      'Return each insight on its own line, prefixed with "INSIGHT: ".',
      "Each insight must mention at least one exact figure from the facts.",
      "Do not give financial advice or moral judgements.",
      "",
      "FACTS:",
      JSON.stringify(facts, null, 2),
    ].join("\n");
  }

  private buildQuestionPrompt(question: string, facts: unknown): string {
    return [
      "Answer the user question using ONLY these pre-computed facts.",
      "Be specific, cite exact figures, and explain which categories/merchants contributed.",
      "Use Indian Rupee formatting (e.g. ₹7,240). Keep the answer under 130 words.",
      "",
      `QUESTION: ${question}`,
      "",
      "FACTS:",
      JSON.stringify(facts, null, 2),
    ].join("\n");
  }

  private parseInsights(text: string, summary: AnalyticsSummary): Insight[] {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.toUpperCase().startsWith("INSIGHT:"))
      .map((l) => l.replace(/^INSIGHT:\s*/i, "").trim())
      .filter((l) => l.length > 0);

    return lines.map((line, index) => ({
      id: `ai_${index}`,
      type: "SUMMARY" as const,
      title: "AI Insight",
      detail: line,
      evidence: {
        totalSpent: summary.totalSpent,
        topCategory: summary.categories[0]?.category ?? null,
      },
    }));
  }

  private buildDeterministicInsights(
    summary: AnalyticsSummary,
    recurring: ReturnType<RecurringPaymentService["detect"]>,
  ): Insight[] {
    const insights: Insight[] = [];

    if (summary.categories.length > 0) {
      const top = summary.categories[0];
      insights.push({
        id: "top_category",
        type: "CATEGORY",
        title: `${CATEGORY_META[top.category].label} is your largest spending category`,
        detail: `${CATEGORY_META[top.category].label} accounts for ₹${top.amount.toLocaleString("en-IN")} (${top.percentage}% of your spending) this month.`,
        evidence: {
          category: top.category,
          amount: top.amount,
          percentage: top.percentage,
        },
      });
    }

    const increase = summary.categoryTrends.find(
      (t) => t.changeAmount > 0 && t.previousAverage > 0,
    );
    if (increase) {
      insights.push({
        id: "trend_up",
        type: "TREND",
        title: `${CATEGORY_META[increase.category].label} spending increased`,
        detail: `${CATEGORY_META[increase.category].label} spending is ₹${increase.currentAmount.toLocaleString("en-IN")} this month, up ${Math.abs(increase.changePercentage)}% from your recent average of ₹${increase.previousAverage.toLocaleString("en-IN")}.`,
        evidence: {
          category: increase.category,
          currentAmount: increase.currentAmount,
          recentAverage: increase.previousAverage,
          changePercentage: increase.changePercentage,
        },
      });
    }

    if (recurring.length > 0) {
      const monthly = this.recurring.estimateMonthlyRecurringTotal(recurring);
      insights.push({
        id: "recurring",
        type: "RECURRING",
        title: `🔄 You have ${recurring.length} recurring payment${recurring.length > 1 ? "s" : ""}`,
        detail: `Recurring payments total about ₹${monthly.toLocaleString("en-IN")}/month across ${recurring.length} merchant${recurring.length > 1 ? "s" : ""}.`,
        evidence: { count: recurring.length, estimatedMonthlyTotal: monthly },
      });
    }

    if (summary.monthOverMonthChange > 0) {
      insights.push({
        id: "mom",
        type: "SUMMARY",
        title: " Spending increased vs last month",
        detail: `You spent ₹${summary.totalSpent.toLocaleString("en-IN")} this month, ₹${summary.monthOverMonthChange.toLocaleString("en-IN")} more than last month (${summary.monthOverMonthChangePercentage}%).`,
        evidence: {
          totalSpent: summary.totalSpent,
          previousMonthTotal: summary.previousMonthTotal,
          change: summary.monthOverMonthChange,
        },
      });
    }

    return insights;
  }

  private buildDeterministicAnswer(summary: AnalyticsSummary): string {
    if (summary.monthOverMonthChange <= 0) {
      return `Your spending this month (₹${summary.totalSpent.toLocaleString("en-IN")}) is not higher than last month (₹${summary.previousMonthTotal.toLocaleString("en-IN")}).`;
    }

    const increases = summary.categoryTrends
      .filter((t) => t.changeAmount > 0)
      .slice(0, 3)
      .map(
        (t) =>
          `${CATEGORY_META[t.category].label.padEnd(14)} +₹${t.changeAmount.toLocaleString("en-IN")}`,
      )
      .join("\n");

    return [
      `You spent ₹${summary.monthOverMonthChange.toLocaleString("en-IN")} more than your recent average.`,
      "",
      "The biggest contributors were:",
      "",
      increases,
    ].join("\n");
  }
}

export const insightService = new InsightService();
