import type { LucideIcon } from 'lucide-react';
import {
  BrainCircuit,
  Compass,
  EyeOff,
  Fingerprint,
  KeyRound,
  Lightbulb,
  Link2,
  Lock,
  ReceiptText,
  Rocket,
  Sparkles,
} from 'lucide-react';
import type { Category } from '@/types';

/** Landing demo data. Every number here is illustrative and visually tuned;
 * sections never hardcode their own datasets so the story stays consistent. */

/** Dark-tuned hexes that echo the app's category colours. */
export const CATEGORY_HEX: Record<Category, string> = {
  FOOD: '#F59E0B',
  TRAVEL: '#0EA5E9',
  SHOPPING: '#FB7185',
  BILLS: '#818CF8',
  ENTERTAINMENT: '#A78BFA',
  HEALTHCARE: '#34D399',
  EDUCATION: '#2DD4BF',
  OTHER: '#94A3B8',
};

/* ---------------------------------- Trust --------------------------------- */

export interface TrustStat {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  hint: string;
}

export const TRUST_STATS: TrustStat[] = [
  { value: 2.4, decimals: 1, suffix: 'M+', label: 'Transactions analyzed', hint: 'and counting' },
  { value: 180, suffix: 'K+', label: 'Spending insights generated', hint: 'by SpendSense AI' },
  { value: 8, suffix: '', label: 'Smart categories tracked', hint: 'with subcategories' },
  { value: 2100, prefix: '₹', suffix: '', label: 'Average monthly savings surfaced', hint: 'per active user' },
];

/* --------------------------------- Problem -------------------------------- */

export interface ProblemChip {
  merchant: string;
  amount: number;
  category: Category;
}

export const PROBLEM_CHIPS: ProblemChip[] = [
  { merchant: 'Swiggy', amount: 428, category: 'FOOD' },
  { merchant: 'Uber', amount: 213, category: 'TRAVEL' },
  { merchant: 'Netflix', amount: 649, category: 'ENTERTAINMENT' },
  { merchant: 'Amazon', amount: 1849, category: 'SHOPPING' },
  { merchant: 'Airtel', amount: 399, category: 'BILLS' },
  { merchant: 'BigBasket', amount: 1120, category: 'FOOD' },
  { merchant: 'Zomato', amount: 356, category: 'FOOD' },
  { merchant: 'Myntra', amount: 2240, category: 'SHOPPING' },
  { merchant: 'Spotify', amount: 119, category: 'ENTERTAINMENT' },
  { merchant: 'Zepto', amount: 487, category: 'FOOD' },
  { merchant: 'MakeMyTrip', amount: 5600, category: 'TRAVEL' },
  { merchant: 'PharmEasy', amount: 640, category: 'HEALTHCARE' },
  { merchant: 'BookMyShow', amount: 760, category: 'ENTERTAINMENT' },
  { merchant: 'JioMart', amount: 934, category: 'SHOPPING' },
];

export const PROBLEM_QUESTIONS: string[] = [
  'Where did my money go?',
  'Am I overspending?',
  'What subscriptions am I paying for?',
  'How much can I safely spend?',
  'What are my spending patterns?',
];

/* --------------------------------- Solution ------------------------------- */

export interface FlowStep {
  icon: LucideIcon;
  title: string;
  copy: string;
}

export const FLOW_STEPS: FlowStep[] = [
  { icon: ReceiptText, title: 'Transactions', copy: 'Every payment, in one stream.' },
  { icon: BrainCircuit, title: 'AI analysis', copy: 'Patterns, merchants and intent.' },
  { icon: Lightbulb, title: 'Insights', copy: 'Plain-language explanations.' },
  { icon: Compass, title: 'Decisions', copy: 'Budgets you can actually keep.' },
];

/* ---------------------------- Product showcase ---------------------------- */

export type ShowcasePeriod = '30D' | '90D' | '12M';

export interface ShowcasePoint {
  label: string;
  expense: number;
  income: number;
}

export interface ShowcaseCategory {
  name: string;
  category: Category;
  amount: number;
}

export interface ShowcaseTransaction {
  merchant: string;
  category: Category;
  amount: number;
  when: string;
  pending?: boolean;
}

export interface ShowcasePayment {
  name: string;
  amount: number;
  due: string;
  category: Category;
}

export interface ShowcaseData {
  balance: number;
  deltaPct: number;
  insight: string;
  insightDetail: string[];
  points: ShowcasePoint[];
  categories: ShowcaseCategory[];
  transactions: ShowcaseTransaction[];
  payments: ShowcasePayment[];
}

export const SHOWCASE: Record<ShowcasePeriod, ShowcaseData> = {
  '30D': {
    balance: 84320,
    deltaPct: 12.4,
    insight: 'Dining is trending 34% above your 3-month average — mostly weekend food delivery.',
    insightDetail: [
      'Swiggy + Zomato together added ₹3,840 this month.',
      'Two recurring payments land next week — ₹1,048 total.',
      'Moving ₹2,000 to savings still keeps you ₹6,120 positive.',
    ],
    points: [
      { label: 'W1', expense: 6120, income: 8400 },
      { label: 'W2', expense: 7480, income: 9100 },
      { label: 'W3', expense: 5940, income: 6800 },
      { label: 'W4', expense: 8930, income: 10250 },
      { label: 'W5', expense: 4680, income: 7600 },
      { label: 'W6', expense: 9210, income: 11400 },
      { label: 'W7', expense: 6840, income: 8900 },
      { label: 'W8', expense: 5120, income: 9300 },
      { label: 'W9', expense: 7690, income: 10500 },
      { label: 'W10', expense: 8850, income: 9800 },
      { label: 'W11', expense: 5460, income: 8100 },
      { label: 'W12', expense: 6980, income: 9600 },
    ],
    categories: [
      { name: 'Food', category: 'FOOD', amount: 9380 },
      { name: 'Shopping', category: 'SHOPPING', amount: 6120 },
      { name: 'Bills', category: 'BILLS', amount: 4260 },
      { name: 'Travel', category: 'TRAVEL', amount: 2840 },
      { name: 'Entertainment', category: 'ENTERTAINMENT', amount: 1760 },
    ],
    transactions: [
      { merchant: 'Swiggy', category: 'FOOD', amount: 428, when: 'Today · 1:12 pm' },
      { merchant: 'Uber', category: 'TRAVEL', amount: 213, when: 'Today · 9:41 am' },
      { merchant: 'Amazon', category: 'SHOPPING', amount: 1849, when: 'Yesterday · 8:04 pm' },
      { merchant: 'Airtel', category: 'BILLS', amount: 399, when: 'Yesterday · 10:00 am', pending: true },
      { merchant: 'BigBasket', category: 'FOOD', amount: 1120, when: '12 Sep · 6:30 pm' },
    ],
    payments: [
      { name: 'Netflix', amount: 649, due: 'in 3 days', category: 'ENTERTAINMENT' },
      { name: 'Airtel postpaid', amount: 399, due: 'in 6 days', category: 'BILLS' },
      { name: 'House rent', amount: 18000, due: 'in 11 days', category: 'BILLS' },
    ],
  },
  '90D': {
    balance: 84320,
    deltaPct: 6.1,
    insight: 'Your spending is steady week to week — but travel spikes every third month.',
    insightDetail: [
      'Travel averages ₹4,210/month but peaks to ₹11,800 in trip months.',
      'Bills are 98% predictable — the steadiest part of your budget.',
      'You saved ₹9,740 more than the previous quarter.',
    ],
    points: [
      { label: 'Jun', expense: 28600, income: 68000 },
      { label: '', expense: 31200, income: 71000 },
      { label: 'Jul', expense: 26900, income: 66500 },
      { label: '', expense: 33800, income: 74000 },
      { label: 'Aug', expense: 29400, income: 70500 },
      { label: '', expense: 24100, income: 69000 },
      { label: 'Sep', expense: 27600, income: 72000 },
      { label: '', expense: 30900, income: 75500 },
      { label: 'Oct', expense: 28800, income: 73000 },
      { label: '', expense: 25400, income: 70000 },
      { label: 'Nov', expense: 31600, income: 78000 },
      { label: '', expense: 27200, income: 74500 },
    ],
    categories: [
      { name: 'Food', category: 'FOOD', amount: 26410 },
      { name: 'Bills', category: 'BILLS', amount: 12780 },
      { name: 'Travel', category: 'TRAVEL', amount: 12630 },
      { name: 'Shopping', category: 'SHOPPING', amount: 18360 },
      { name: 'Entertainment', category: 'ENTERTAINMENT', amount: 3570 },
    ],
    transactions: [
      { merchant: 'MakeMyTrip', category: 'TRAVEL', amount: 5600, when: 'Today · 11:05 am' },
      { merchant: 'Swiggy', category: 'FOOD', amount: 428, when: 'Today · 1:12 pm' },
      { merchant: 'Netflix', category: 'ENTERTAINMENT', amount: 649, when: '13 Sep · 6:00 am' },
      { merchant: 'Zomato', category: 'FOOD', amount: 356, when: '12 Sep · 9:12 pm' },
      { merchant: 'PharmEasy', category: 'HEALTHCARE', amount: 640, when: '11 Sep · 4:48 pm' },
    ],
    payments: [
      { name: 'Netflix', amount: 649, due: 'in 3 days', category: 'ENTERTAINMENT' },
      { name: 'Airtel postpaid', amount: 399, due: 'in 6 days', category: 'BILLS' },
      { name: 'Spotify', amount: 119, due: 'in 9 days', category: 'ENTERTAINMENT' },
    ],
  },
  '12M': {
    balance: 84320,
    deltaPct: 21.8,
    insight: 'Your savings rate doubled since October — mostly from fewer impulse purchases.',
    insightDetail: [
      'Impulse shopping fell 41% after your April budget change.',
      'Income grew 14% year over year; expenses grew only 6%.',
      'Your best saving month was February — ₹21,400 set aside.',
    ],
    points: [
      { label: 'Oct', expense: 96000, income: 268000 },
      { label: 'Nov', expense: 88000, income: 262000 },
      { label: 'Dec', expense: 121000, income: 284000 },
      { label: 'Jan', expense: 79000, income: 276000 },
      { label: 'Feb', expense: 71000, income: 280000 },
      { label: 'Mar', expense: 86000, income: 272000 },
      { label: 'Apr', expense: 92000, income: 290000 },
      { label: 'May', expense: 84000, income: 286000 },
      { label: 'Jun', expense: 98000, income: 294000 },
      { label: 'Jul', expense: 89000, income: 300000 },
      { label: 'Aug', expense: 94000, income: 308000 },
      { label: 'Sep', expense: 87000, income: 312000 },
    ],
    categories: [
      { name: 'Food', category: 'FOOD', amount: 98600 },
      { name: 'Shopping', category: 'SHOPPING', amount: 74120 },
      { name: 'Bills', category: 'BILLS', amount: 51240 },
      { name: 'Travel', category: 'TRAVEL', amount: 42800 },
      { name: 'Entertainment', category: 'ENTERTAINMENT', amount: 11680 },
    ],
    transactions: [
      { merchant: 'House rent', category: 'BILLS', amount: 18000, when: '01 Sep · 8:00 am' },
      { merchant: 'Amazon', category: 'SHOPPING', amount: 1849, when: 'Yesterday · 8:04 pm' },
      { merchant: 'Uber', category: 'TRAVEL', amount: 213, when: 'Today · 9:41 am' },
      { merchant: 'Spotify', category: 'ENTERTAINMENT', amount: 119, when: '14 Sep · 6:00 am' },
      { merchant: 'Swiggy', category: 'FOOD', amount: 428, when: 'Today · 1:12 pm' },
    ],
    payments: [
      { name: 'House rent', amount: 18000, due: 'in 11 days', category: 'BILLS' },
      { name: 'Netflix', amount: 649, due: 'in 3 days', category: 'ENTERTAINMENT' },
      { name: 'Airtel postpaid', amount: 399, due: 'in 6 days', category: 'BILLS' },
    ],
  },
};

/* ------------------------------- Analytics -------------------------------- */

export interface AnalyticsMonth {
  month: string;
  income: number;
  expense: number;
  top: string;
  deltaPct: number;
}

export const ANALYTICS_MONTHS: AnalyticsMonth[] = [
  { month: 'Apr', income: 92000, expense: 63400, top: 'Bills', deltaPct: 2.1 },
  { month: 'May', income: 93500, expense: 60100, top: 'Food', deltaPct: -5.2 },
  { month: 'Jun', income: 96000, expense: 68900, top: 'Travel', deltaPct: 14.6 },
  { month: 'Jul', income: 96500, expense: 61200, top: 'Food', deltaPct: -11.2 },
  { month: 'Aug', income: 98000, expense: 66800, top: 'Shopping', deltaPct: 9.2 },
  { month: 'Sep', income: 101200, expense: 58400, top: 'Food', deltaPct: -12.6 },
];

/* ---------------------------------- AI ------------------------------------ */

export interface AIBar {
  label: string;
  pct: number;
  delta: string;
}

export interface AIExchange {
  question: string;
  answer: string;
  bars: AIBar[];
  footnote: string;
}

export const AI_EXCHANGES: AIExchange[] = [
  {
    question: 'Why did I spend more this month?',
    answer:
      'You spent 18% more than last month, primarily due to dining and entertainment. Weekend food delivery nearly doubled — Swiggy and Zomato added ₹3,840 together, and two movie nights pushed entertainment up by ₹1,120.',
    bars: [
      { label: 'Dining', pct: 84, delta: '+34%' },
      { label: 'Entertainment', pct: 62, delta: '+21%' },
      { label: 'Everything else', pct: 38, delta: '-4%' },
    ],
    footnote: 'Based on 47 transactions between 20 Aug and 19 Sep.',
  },
  {
    question: 'What subscriptions am I paying for?',
    answer:
      'You have 4 active subscriptions totalling ₹1,146 a month. Two of them — a gym add-on and a news app — haven\'t been used in over six weeks. Cancelling both would save you ₹7,776 a year.',
    bars: [
      { label: 'Netflix', pct: 57, delta: '₹649' },
      { label: 'Spotify', pct: 10, delta: '₹119' },
      { label: 'Unused × 2', pct: 33, delta: '₹378' },
    ],
    footnote: 'Recurring charges detected across the last 6 months.',
  },
  {
    question: 'How much can I safely spend today?',
    answer:
      'After upcoming bills and your savings goal, ₹740 is a safe daily budget for the rest of the month. You\'re at ₹412 today — staying under ₹740 keeps your September plan fully on track.',
    bars: [
      { label: 'Spent today', pct: 56, delta: '₹412' },
      { label: 'Safe to spend', pct: 100, delta: '₹740' },
      { label: 'Month progress', pct: 63, delta: '19 of 30 days' },
    ],
    footnote: 'Accounts for rent, bills and your ₹5,000 savings goal.',
  },
];

/* -------------------------------- Security -------------------------------- */

export interface SecurityPoint {
  icon: LucideIcon;
  title: string;
  copy: string;
}

export const SECURITY_POINTS: SecurityPoint[] = [
  {
    icon: Fingerprint,
    title: 'Secure authentication',
    copy: 'Your account is protected by verified sign-in flows, with multi-factor support ready from day one.',
  },
  {
    icon: Lock,
    title: 'Encrypted, always',
    copy: 'Financial data is encrypted in transit and at rest, and access is limited to what the product strictly needs.',
  },
  {
    icon: EyeOff,
    title: 'Privacy-first architecture',
    copy: 'Your data is never sold or shared for advertising. Insights are generated for you — and only you.',
  },
  {
    icon: KeyRound,
    title: 'Least-privilege access',
    copy: 'Every part of the system is scoped to the minimum access required, and every request is authenticated.',
  },
  {
    icon: EyeOff,
    title: 'Transparent by design',
    copy: 'No dark patterns with your data. Export everything or delete your account whenever you want.',
  },
];

export const SECURITY_CHIPS: string[] = [
  'TLS 1.2+ in transit',
  'Encrypted at rest',
  'No data selling. Ever.',
  'Scoped API access',
  'Export & delete anytime',
];

/* ------------------------------- How it works ----------------------------- */

export interface HowStep {
  icon: LucideIcon;
  title: string;
  copy: string;
}

export const HOW_STEPS: HowStep[] = [
  {
    icon: Link2,
    title: 'Connect',
    copy: 'Bring your financial activity together — payments, imports and everyday spends in one place.',
  },
  {
    icon: Sparkles,
    title: 'Understand',
    copy: 'SpendSense organizes, categorizes and analyzes every transaction automatically.',
  },
  {
    icon: Lightbulb,
    title: 'Discover',
    copy: 'See patterns, recurring payments and unusual spends surface as plain-language insights.',
  },
  {
    icon: Rocket,
    title: 'Act',
    copy: 'Set budgets, plan upcoming payments and make smarter decisions with confidence.',
  },
];

