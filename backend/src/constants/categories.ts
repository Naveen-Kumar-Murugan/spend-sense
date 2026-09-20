/**
 * Canonical category + subcategory + payment method definitions.
 *
 * These constants are the single source of truth used throughout the backend.
 * The frontend mirrors them in `frontend/src/types/transaction.ts`, but the
 * backend always validates against these values and never trusts client input.
 */

export const CATEGORIES = [
  "FOOD",
  "TRAVEL",
  "SHOPPING",
  "BILLS",
  "ENTERTAINMENT",
  "HEALTHCARE",
  "EDUCATION",
  "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const SUBCATEGORIES = {
  FOOD: ["RESTAURANT", "GROCERY", "FOOD_DELIVERY", "CAFE", "OTHER"],
  TRAVEL: ["CAB", "FLIGHT", "TRAIN", "FUEL", "HOTEL", "OTHER"],
  SHOPPING: ["CLOTHING", "ELECTRONICS", "ONLINE", "HOME", "OTHER"],
  BILLS: [
    "UTILITY",
    "RENT",
    "INTERNET",
    "MOBILE",
    "INSURANCE",
    "SUBSCRIPTION",
    "OTHER",
  ],
  ENTERTAINMENT: ["STREAMING", "MOVIES", "GAMES", "EVENTS", "OTHER"],
  HEALTHCARE: ["PHARMACY", "DOCTOR", "HOSPITAL", "FITNESS", "OTHER"],
  EDUCATION: ["COURSE", "BOOKS", "TUITION", "OTHER"],
  OTHER: ["OTHER"],
} as const satisfies Record<Category, readonly string[]>;

export type Subcategory = (typeof SUBCATEGORIES)[Category][number];

export const PAYMENT_METHODS = ["UPI", "CARD", "CASH", "OTHER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const TRANSACTION_STATUSES = ["SUCCESS", "PENDING", "FAILED"] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const CATEGORY_META: Record<Category, { label: string }> = {
  FOOD: { label: "Food" },
  TRAVEL: { label: "Travel" },
  SHOPPING: { label: "Shopping" },
  BILLS: { label: "Bills" },
  ENTERTAINMENT: { label: "Entertainment" },
  HEALTHCARE: { label: "Healthcare" },
  EDUCATION: { label: "Education" },
  OTHER: { label: "Other" },
};

export function isCategory(value: unknown): value is Category {
  return (
    typeof value === "string" &&
    (CATEGORIES as readonly string[]).includes(value)
  );
}

export function isValidSubcategory(
  category: Category,
  subcategory: string,
): boolean {
  const allowed = SUBCATEGORIES[category] as readonly string[] | undefined;
  return !!allowed && allowed.includes(subcategory);
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    typeof value === "string" &&
    (PAYMENT_METHODS as readonly string[]).includes(value)
  );
}

/**
 * Best-effort mapping from a free-text merchant name to a sensible default
 * subcategory. Used only as a convenience default; the user always picks the
 * category explicitly at payment time.
 */
export function inferSubcategory(
  category: Category,
  merchant: string,
): Subcategory {
  const m = merchant.toLowerCase();
  const rules: Partial<Record<Category, Array<[RegExp, string]>>> = {
    FOOD: [
      [
        /swiggy|zomato|dominos|pizza|restaurant|cafe|coffee|starbucks/,
        "RESTAURANT",
      ],
      [/blinkit|zepto|bigbasket|grocery|dmart|more/, "GROCERY"],
    ],
    TRAVEL: [
      [/uber|ola|rapido/, "CAB"],
      [/indigo|air india|flight|airlines/, "FLIGHT"],
      [/irctc|train/, "TRAIN"],
      [/petrol|fuel|hp |indianoil|shell/, "FUEL"],
    ],
    BILLS: [
      [/airtel|jio|vodafone|vi |mobile|recharge/, "MOBILE"],
      [/netflix|spotify|prime|hotstar|subscription/, "SUBSCRIPTION"],
      [/act |internet|broadband|wifi/, "INTERNET"],
      [/electric|water|gas|utility|bescom/, "UTILITY"],
    ],
    ENTERTAINMENT: [
      [/netflix|prime|hotstar|spotify|youtube|streaming/, "STREAMING"],
      [/pvr|inox|cinema|movie|bookmyshow/, "MOVIES"],
      [/steam|playstation|xbox|game/, "GAMES"],
    ],
    SHOPPING: [
      [/amazon|flipkart|myntra|ajio|meesho|online/, "ONLINE"],
      [/croma|reliance digital|electronics/, "ELECTRONICS"],
    ],
    HEALTHCARE: [
      [/pharmacy|pharma|apollo|medplus|netmeds/, "PHARMACY"],
      [/gym|fitness|cult/, "FITNESS"],
    ],
  };

  const candidates = rules[category];
  if (candidates) {
    for (const [pattern, sub] of candidates) {
      if (pattern.test(m)) {
        return sub as Subcategory;
      }
    }
  }
  const allowed = SUBCATEGORIES[category] as readonly string[];
  return (allowed[0] ?? "OTHER") as Subcategory;
}
