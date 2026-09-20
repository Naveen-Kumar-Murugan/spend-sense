import { MAX_AMOUNT, MAX_MERCHANT_LENGTH, MAX_NOTE_LENGTH } from '@/constants';
import { CATEGORY_META } from '@/constants/categories';
import type { Category, PaymentMethod } from '@/types';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface Validator<T> {
  (values: T): FieldErrors<T>;
}

export interface PaymentFormValues {
  amount: string;
  merchant: string;
  category: Category | '';
  subcategory: string;
  paymentMethod: PaymentMethod;
  note: string;
}

export const validatePaymentForm: Validator<PaymentFormValues> = (values) => {
  const errors: FieldErrors<PaymentFormValues> = {};
  const amount = Number(values.amount);

  if (!values.amount.trim()) {
    errors.amount = 'Enter an amount to continue.';
  } else if (Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Amount must be greater than ₹0.';
  } else if (amount > MAX_AMOUNT) {
    errors.amount = 'Amount cannot exceed ₹1,00,00,000.';
  }

  if (!values.merchant.trim()) {
    errors.merchant = 'Who are you paying?';
  } else if (values.merchant.trim().length > MAX_MERCHANT_LENGTH) {
    errors.merchant = `Keep the merchant name under ${MAX_MERCHANT_LENGTH} characters.`;
  }

  if (!values.category) {
    errors.category = 'Pick a category so this spend is tracked correctly.';
  } else if (
    values.subcategory &&
    !CATEGORY_META[values.category].subcategories.includes(values.subcategory)
  ) {
    errors.subcategory = 'That sub-category does not belong to this category.';
  }

  if (values.note.length > MAX_NOTE_LENGTH) {
    errors.note = `Notes are limited to ${MAX_NOTE_LENGTH} characters.`;
  }

  return errors;
};

export interface CredentialValues {
  email: string;
  password: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'That email address does not look right.';
  return undefined;
}

export function validatePassword(password: string, mode: 'login' | 'signup' = 'login'): string | undefined {
  if (!password) return 'Enter your password.';
  if (mode === 'signup') {
    // Mirrors the Cognito user pool policy: 8+, lowercase, digit.
    if (password.length < 8) return 'Use at least 8 characters.';
    if (!/[a-z]/.test(password)) return 'Include at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Include at least one number.';
  }
  return undefined;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
