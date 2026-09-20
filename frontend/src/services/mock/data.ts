/**
 * Deterministic mock transaction history. Seeded so every reload produces the
 * same numbers — screenshots, demos and tests stay stable.
 */
import type { Category, PaymentMethod, Transaction, TransactionStatus } from '@/types';
import { monthKey } from '@/utils/format';

const DEMO_USER_ID = 'demo-user-spendsense';

/** Mulberry32 — tiny deterministic PRNG. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MerchantSeed {
  merchant: string;
  category: Category;
  subcategory: string;
  paymentMethod: PaymentMethod;
  min: number;
  max: number;
  /** Rough number of times this merchant appears in a month. */
  perMonth: number;
}

const MERCHANTS: MerchantSeed[] = [
  { merchant: 'Swiggy', category: 'FOOD', subcategory: 'FOOD_DELIVERY', paymentMethod: 'UPI', min: 180, max: 720, perMonth: 7 },
  { merchant: 'Zomato', category: 'FOOD', subcategory: 'FOOD_DELIVERY', paymentMethod: 'UPI', min: 220, max: 860, perMonth: 4 },
  { merchant: 'Third Wave Coffee', category: 'FOOD', subcategory: 'CAFE', paymentMethod: 'CARD', min: 180, max: 460, perMonth: 4 },
  { merchant: 'BigBasket', category: 'FOOD', subcategory: 'GROCERY', paymentMethod: 'UPI', min: 900, max: 3200, perMonth: 3 },
  { merchant: 'Uber', category: 'TRAVEL', subcategory: 'CAB', paymentMethod: 'UPI', min: 120, max: 640, perMonth: 6 },
  { merchant: 'Indian Oil', category: 'TRAVEL', subcategory: 'FUEL', paymentMethod: 'CARD', min: 1200, max: 2600, perMonth: 2 },
  { merchant: 'IndiGo', category: 'TRAVEL', subcategory: 'FLIGHT', paymentMethod: 'CARD', min: 4200, max: 9800, perMonth: 0.4 },
  { merchant: 'Amazon', category: 'SHOPPING', subcategory: 'ONLINE', paymentMethod: 'CARD', min: 450, max: 5200, perMonth: 4 },
  { merchant: 'Myntra', category: 'SHOPPING', subcategory: 'CLOTHING', paymentMethod: 'CARD', min: 800, max: 3600, perMonth: 1.5 },
  { merchant: 'Croma', category: 'SHOPPING', subcategory: 'ELECTRONICS', paymentMethod: 'CARD', min: 2200, max: 14000, perMonth: 0.4 },
  { merchant: 'Airtel', category: 'BILLS', subcategory: 'MOBILE', paymentMethod: 'UPI', min: 799, max: 799, perMonth: 1 },
  { merchant: 'ACT Fibernet', category: 'BILLS', subcategory: 'INTERNET', paymentMethod: 'UPI', min: 1180, max: 1180, perMonth: 1 },
  { merchant: 'BESCOM', category: 'BILLS', subcategory: 'UTILITY', paymentMethod: 'UPI', min: 1400, max: 2900, perMonth: 1 },
  { merchant: 'Netflix', category: 'ENTERTAINMENT', subcategory: 'STREAMING', paymentMethod: 'CARD', min: 649, max: 649, perMonth: 1 },
  { merchant: 'Spotify', category: 'ENTERTAINMENT', subcategory: 'STREAMING', paymentMethod: 'CARD', min: 149, max: 149, perMonth: 1 },
  { merchant: 'PVR Cinemas', category: 'ENTERTAINMENT', subcategory: 'MOVIES', paymentMethod: 'UPI', min: 400, max: 1400, perMonth: 1 },
  { merchant: 'Apollo Pharmacy', category: 'HEALTHCARE', subcategory: 'PHARMACY', paymentMethod: 'UPI', min: 240, max: 1600, perMonth: 1.5 },
  { merchant: 'Cult.fit', category: 'HEALTHCARE', subcategory: 'FITNESS', paymentMethod: 'CARD', min: 1499, max: 1499, perMonth: 1 },
  { merchant: 'Coursera', category: 'EDUCATION', subcategory: 'COURSE', paymentMethod: 'CARD', min: 1800, max: 4200, perMonth: 0.5 },
  { merchant: 'Blinkit', category: 'FOOD', subcategory: 'GROCERY', paymentMethod: 'UPI', min: 180, max: 900, perMonth: 5 },
];

const NOTES: Record<string, string[]> = {
  FOOD: ['Dinner with friends', 'Weekly groceries', 'Team lunch', ''],
  TRAVEL: ['Airport drop', 'Weekend trip', 'Office commute', ''],
  SHOPPING: ['Running shoes', 'Birthday gift', 'Home supplies', ''],
  BILLS: ['Monthly bill', 'Auto-debit', ''],
  ENTERTAINMENT: ['Subscription renewal', 'Weekend movie', ''],
  HEALTHCARE: ['Monthly medication', 'Gym membership', ''],
  EDUCATION: ['Course enrolment', ''],
  OTHER: [''],
};

function transactionId(random: () => number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 18; i += 1) id += chars[Math.floor(random() * chars.length)];
  return `txn_${id}`;
}

/** Builds ~6 months of history ending today. */
export function generateTransactions(now = new Date(), months = 6): Transaction[] {
  const random = createRandom(20260919);
  const transactions: Transaction[] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const isCurrentMonth = offset === 0;
    const daysInMonth = isCurrentMonth ? now.getDate() : new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    // Gentle upward drift so month-over-month comparisons are meaningful.
    const intensity = 0.82 + (months - offset) * 0.045;

    for (const seed of MERCHANTS) {
      const occurrences = Math.round(seed.perMonth * intensity * (0.75 + random() * 0.5));

      for (let i = 0; i < occurrences; i += 1) {
        const day = Math.max(1, Math.min(daysInMonth, Math.ceil(random() * daysInMonth)));
        const fixedAmount = seed.min === seed.max;
        const date = new Date(
          cursor.getFullYear(),
          cursor.getMonth(),
          fixedAmount ? Math.min(daysInMonth, 3) : day,
          9 + Math.floor(random() * 12),
          Math.floor(random() * 60),
        );
        if (date > now) continue;

        const amount = fixedAmount
          ? seed.min
          : Math.round((seed.min + random() * (seed.max - seed.min)) * 100) / 100;

        const noteOptions = NOTES[seed.category] ?? [''];
        const note = noteOptions[Math.floor(random() * noteOptions.length)];
        const roll = random();
        const status: TransactionStatus = roll > 0.975 ? 'PENDING' : roll > 0.965 ? 'FAILED' : 'SUCCESS';

        transactions.push({
          transactionId: transactionId(random),
          userId: DEMO_USER_ID,
          amount,
          currency: 'INR',
          merchant: seed.merchant,
          category: seed.category,
          subcategory: seed.subcategory,
          paymentMethod: seed.paymentMethod,
          status,
          note: note || undefined,
          createdAt: date.toISOString(),
          updatedAt: date.toISOString(),
        });
      }
    }
  }

  return transactions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const CURRENT_MONTH = monthKey(new Date());
export { DEMO_USER_ID };
