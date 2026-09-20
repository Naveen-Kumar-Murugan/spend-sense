import { Transaction } from '../models/Transaction';
import { daysBetween } from '../utils/dates';

/**
 * RecurringPaymentService
 *
 * A deliberately simple, deterministic pattern detector. No ML / no LLM: it
 * groups transactions by merchant + amount and looks for evenly spaced charges.
 */

export type Frequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'IRREGULAR';

export interface RecurringPayment {
    merchant: string;
    amount: number;
    frequency: Frequency;
    confidence: number;
    occurrences: number;
    lastChargedAt: string;
}

interface IntervalProfile {
    frequency: Frequency;
    expectedDays: number;
    toleranceDays: number;
}

const INTERVAL_PROFILES: IntervalProfile[] = [
    { frequency: 'WEEKLY', expectedDays: 7, toleranceDays: 2 },
    { frequency: 'MONTHLY', expectedDays: 30, toleranceDays: 5 },
    { frequency: 'QUARTERLY', expectedDays: 91, toleranceDays: 10 },
    { frequency: 'YEARLY', expectedDays: 365, toleranceDays: 20 },
];

const AMOUNT_TOLERANCE = 0.05; // 5%

function classifyInterval(avgGapDays: number): IntervalProfile | null {
    let best: IntervalProfile | null = null;
    let bestDelta = Number.POSITIVE_INFINITY;
    for (const profile of INTERVAL_PROFILES) {
        const delta = Math.abs(avgGapDays - profile.expectedDays);
        if (delta <= profile.toleranceDays && delta < bestDelta) {
            best = profile;
            bestDelta = delta;
        }
    }
    return best;
}

export class RecurringPaymentService {
    /**
     * Detects recurring payments across a user's transaction history.
     *
     * Algorithm:
     *  1. Keep only SUCCESS transactions.
     *  2. Group by merchant.
     *  3. Within a merchant, cluster by similar amount (±5%).
     *  4. For clusters with >= 3 charges, compute the average gap between
     *     consecutive charges and check it against known intervals.
     *  5. Confidence = interval regularity × amount consistency.
     */
    detect(transactions: Transaction[]): RecurringPayment[] {
        const successful = transactions.filter((t) => t.status === 'SUCCESS');
        const byMerchant = new Map<string, Transaction[]>();

        for (const txn of successful) {
            const key = txn.merchant.toLowerCase();
            const list = byMerchant.get(key) ?? [];
            list.push(txn);
            byMerchant.set(key, list);
        }

        const results: RecurringPayment[] = [];

        for (const list of byMerchant.values()) {
            if (list.length < 3) {
                continue;
            }

            const sorted = [...list].sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            // Cluster by similar amount, starting from each unclaimed transaction.
            const claimed = new Set<number>();
            for (let i = 0; i < sorted.length; i += 1) {
                if (claimed.has(i)) {
                    continue;
                }
                const base = sorted[i];
                const cluster = [base];
                claimed.add(i);

                for (let j = i + 1; j < sorted.length; j += 1) {
                    if (claimed.has(j)) {
                        continue;
                    }
                    const candidate = sorted[j];
                    const diff = Math.abs(candidate.amount - base.amount);
                    if (diff / base.amount <= AMOUNT_TOLERANCE) {
                        cluster.push(candidate);
                        claimed.add(j);
                    }
                }

                if (cluster.length < 3) {
                    continue;
                }

                const detected = this.analyseCluster(cluster);
                if (detected) {
                    results.push(detected);
                }
            }
        }

        return results.sort((a, b) => b.confidence - a.confidence);
    }

    estimateMonthlyRecurringTotal(recurring: RecurringPayment[]): number {
        const monthly = recurring.reduce((sum, item) => {
            switch (item.frequency) {
                case 'WEEKLY':
                    return sum + item.amount * 4.33;
                case 'MONTHLY':
                    return sum + item.amount;
                case 'QUARTERLY':
                    return sum + item.amount / 3;
                case 'YEARLY':
                    return sum + item.amount / 12;
                default:
                    return sum;
            }
        }, 0);
        return Math.round(monthly * 100) / 100;
    }

    private analyseCluster(cluster: Transaction[]): RecurringPayment | null {
        let totalGap = 0;
        for (let i = 1; i < cluster.length; i += 1) {
            totalGap += daysBetween(cluster[i - 1].createdAt, cluster[i].createdAt);
        }
        const avgGap = totalGap / (cluster.length - 1);

        const profile = classifyInterval(avgGap);
        if (!profile) {
            return null;
        }

        // Confidence: regularity of gaps + amount consistency.
        const gaps: number[] = [];
        for (let i = 1; i < cluster.length; i += 1) {
            gaps.push(daysBetween(cluster[i - 1].createdAt, cluster[i].createdAt));
        }
        const gapVariance =
            gaps.reduce((sum, g) => sum + Math.abs(g - avgGap), 0) / gaps.length;
        const regularity = Math.max(0, 1 - gapVariance / profile.toleranceDays);

        const amounts = cluster.map((t) => t.amount);
        const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const amountVariance =
            amounts.reduce((sum, a) => sum + Math.abs(a - avgAmount), 0) / amounts.length;
        const consistency = Math.max(0, 1 - amountVariance / avgAmount);

        const occurrences = cluster.length;
        const occurrenceBoost = Math.min(1, occurrences / 6);
        const confidence = Math.round(
            Math.min(1, regularity * 0.55 + consistency * 0.3 + occurrenceBoost * 0.15) * 100
        ) / 100;

        const last = cluster[cluster.length - 1];

        return {
            merchant: last.merchant,
            amount: Math.round(avgAmount * 100) / 100,
            frequency: profile.frequency,
            confidence,
            occurrences,
            lastChargedAt: last.createdAt,
        };
    }
}

export const recurringPaymentService = new RecurringPaymentService();