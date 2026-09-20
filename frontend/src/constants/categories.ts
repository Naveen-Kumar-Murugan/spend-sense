import {
  Utensils,
  Plane,
  ShoppingBag,
  ReceiptText,
  Clapperboard,
  HeartPulse,
  GraduationCap,
  Layers,
  Smartphone,
  CreditCard,
  Banknote,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { Category, PaymentMethod } from '@/types';

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the small square icon tile used across the app. */
  tile: string;
  /** Tailwind classes for the pill used in tables and lists. */
  pill: string;
  /** Hex used by Recharts, kept in sync with the tile colours. */
  hex: string;
  subcategories: string[];
}

export const CATEGORY_ORDER: Category[] = [
  'FOOD',
  'TRAVEL',
  'SHOPPING',
  'BILLS',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'EDUCATION',
  'OTHER',
];

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  FOOD: {
    label: 'Food',
    icon: Utensils,
    tile: 'bg-amber-50 text-amber-500',
    pill: 'bg-amber-50 text-amber-700',
    hex: '#F59E0B',
    subcategories: ['RESTAURANT', 'GROCERY', 'FOOD_DELIVERY', 'CAFE', 'OTHER'],
  },
  TRAVEL: {
    label: 'Travel',
    icon: Plane,
    tile: 'bg-sky-50 text-sky-500',
    pill: 'bg-sky-50 text-sky-700',
    hex: '#0EA5E9',
    subcategories: ['CAB', 'FLIGHT', 'TRAIN', 'FUEL', 'HOTEL', 'OTHER'],
  },
  SHOPPING: {
    label: 'Shopping',
    icon: ShoppingBag,
    tile: 'bg-rose-50 text-rose-500',
    pill: 'bg-rose-50 text-rose-700',
    hex: '#F43F5E',
    subcategories: ['CLOTHING', 'ELECTRONICS', 'ONLINE', 'HOME', 'OTHER'],
  },
  BILLS: {
    label: 'Bills',
    icon: ReceiptText,
    tile: 'bg-primary-50 text-primary',
    pill: 'bg-primary-50 text-primary-700',
    hex: '#4F46E5',
    subcategories: ['UTILITY', 'RENT', 'INTERNET', 'MOBILE', 'INSURANCE', 'SUBSCRIPTION', 'OTHER'],
  },
  ENTERTAINMENT: {
    label: 'Entertainment',
    icon: Clapperboard,
    tile: 'bg-violet-50 text-violet-500',
    pill: 'bg-violet-50 text-violet-700',
    hex: '#8B5CF6',
    subcategories: ['STREAMING', 'MOVIES', 'GAMES', 'EVENTS', 'OTHER'],
  },
  HEALTHCARE: {
    label: 'Healthcare',
    icon: HeartPulse,
    tile: 'bg-mint-soft text-mint-dark',
    pill: 'bg-mint-soft text-mint-dark',
    hex: '#10B981',
    subcategories: ['PHARMACY', 'DOCTOR', 'HOSPITAL', 'FITNESS', 'OTHER'],
  },
  EDUCATION: {
    label: 'Education',
    icon: GraduationCap,
    tile: 'bg-teal-50 text-teal-600',
    pill: 'bg-teal-50 text-teal-700',
    hex: '#14B8A6',
    subcategories: ['COURSE', 'BOOKS', 'TUITION', 'OTHER'],
  },
  OTHER: {
    label: 'Other',
    icon: Layers,
    tile: 'bg-slate-100 text-slate-500',
    pill: 'bg-slate-100 text-slate-600',
    hex: '#94A3B8',
    subcategories: ['OTHER'],
  },
};

export interface PaymentMethodMeta {
  label: string;
  hint: string;
  icon: LucideIcon;
}

export const PAYMENT_METHODS: Record<PaymentMethod, PaymentMethodMeta> = {
  UPI: { label: 'UPI', hint: 'Pay with any UPI app', icon: Smartphone },
  CARD: { label: 'Card', hint: 'Debit or credit card', icon: CreditCard },
  CASH: { label: 'Cash', hint: 'Record a cash spend', icon: Banknote },
  OTHER: { label: 'Other', hint: 'Wallet, netbanking, etc.', icon: Wallet },
};

export const PAYMENT_METHOD_ORDER: PaymentMethod[] = ['UPI', 'CARD', 'CASH', 'OTHER'];

/** Merchants offered as quick-pick chips on the payment screen. */
export const QUICK_MERCHANTS: Array<{ merchant: string; category: Category; subcategory: string }> = [
  { merchant: 'Swiggy', category: 'FOOD', subcategory: 'FOOD_DELIVERY' },
  { merchant: 'Zomato', category: 'FOOD', subcategory: 'FOOD_DELIVERY' },
  { merchant: 'Uber', category: 'TRAVEL', subcategory: 'CAB' },
  { merchant: 'Amazon', category: 'SHOPPING', subcategory: 'ONLINE' },
  { merchant: 'Netflix', category: 'ENTERTAINMENT', subcategory: 'STREAMING' },
  { merchant: 'Spotify', category: 'ENTERTAINMENT', subcategory: 'STREAMING' },
  { merchant: 'Airtel', category: 'BILLS', subcategory: 'MOBILE' },
  { merchant: 'BigBasket', category: 'FOOD', subcategory: 'GROCERY' },
];

export const CATEGORY_LABEL = (category: Category): string => CATEGORY_META[category].label;
