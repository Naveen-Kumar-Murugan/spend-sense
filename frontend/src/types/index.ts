/**
 * Domain types. These mirror the SpendSense API specification exactly so the
 * mock service layer can be swapped for the real API without touching the UI.
 */

export type Category =
  | 'FOOD'
  | 'TRAVEL'
  | 'SHOPPING'
  | 'BILLS'
  | 'ENTERTAINMENT'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'OTHER';

export type PaymentMethod = 'UPI' | 'CARD' | 'CASH' | 'OTHER';

export type TransactionStatus = 'SUCCESS' | 'PENDING' | 'FAILED';

export type Frequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'IRREGULAR';

export type PaymentMode = 'DEMO' | 'UPI';

export type InsightType = 'CATEGORY' | 'TREND' | 'RECURRING' | 'SUMMARY';

export type GeneratedBy = 'BEDROCK' | 'FALLBACK';

export interface Transaction {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  merchant: string;
  category: Category;
  subcategory: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySpend {
  category: Category;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailySpend {
  date: string;
  amount: number;
}

export interface MonthlySpend {
  month: string;
  amount: number;
}

export interface MerchantSpend {
  merchant: string;
  amount: number;
  transactionCount: number;
}

export interface RecurringPayment {
  merchant: string;
  amount: number;
  frequency: Frequency;
  confidence: number;
  occurrences: number;
  lastChargedAt: string;
}

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  detail: string;
  evidence: Record<string, unknown>;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  transactionCount: number;
  previousMonthTotal: number;
  monthOverMonthChange: number;
  monthOverMonthChangePercentage: number;
  categoryBreakdown: CategorySpend[];
  dailySpend: DailySpend[];
  monthlySpend: MonthlySpend[];
  topMerchants: MerchantSpend[];
  recentTransactions: Transaction[];
  recurringPayments: RecurringPayment[];
  estimatedMonthlyRecurring: number;
  insights: Insight[];
  insightsGeneratedBy: GeneratedBy;
}

export interface UpiIntent {
  uri: string;
  payeeVpa: string;
  transactionRef: string;
}

export interface PaymentReceipt {
  paymentId: string;
  status: TransactionStatus;
  mode: PaymentMode;
  amount: number;
  currency: string;
  merchant: string;
  category: Category;
  subcategory: string;
  paymentMethod: PaymentMethod;
  /** Present for UPI mode: the receiver's UPI ID. */
  receiverUpiId?: string;
  /** Present for UPI mode: ready-to-open UPI deep link. */
  upiUrl?: string;
  /** Marker that the UPI payment was initiated (never that it succeeded). */
  initiatedStatus?: 'INITIATED';
  message: string;
  upiIntent?: UpiIntent;
  transaction?: Transaction;
}

export interface FinancialAnswer {
  question: string;
  answer: string;
  generatedBy: GeneratedBy;
  evidence: Record<string, unknown>;
}

export interface InsightsResponse {
  insights: Insight[];
  generatedBy: GeneratedBy;
  month: string;
}

export interface CreatePaymentRequest {
  amount: number;
  merchant: string;
  category: Category;
  subcategory?: string;
  paymentMethod: PaymentMethod;
  note?: string;
  mode?: PaymentMode;
  currency?: string;
  /** Receiver's UPI ID (UPI mode only), e.g. rahul@oksbi. */
  receiverUpiId?: string;
}

export interface UpdateTransactionRequest {
  category?: Category;
  subcategory?: string;
  merchant?: string;
  note?: string;
}

export interface ListTransactionsQuery {
  search?: string;
  category?: Category;
  month?: string;
  limit?: number;
}

/** Error envelope returned by the API. */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown[];
}

export interface AuthUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  location?: string;
  avatarUrl?: string;
  /** The user's own UPI VPA (e.g. naveen@oksbi). Never a UPI PIN. */
  upiId?: string;
  plan: 'FREE' | 'PREMIUM';
  emailVerified: boolean;
}
