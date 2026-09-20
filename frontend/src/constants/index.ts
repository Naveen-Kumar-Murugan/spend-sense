export * from './categories';
export * from './navigation';

export const APP_NAME = 'SpendSense';
export const DEFAULT_CURRENCY = 'INR';
export const PAYEE_VPA = 'spendsense@upi';

/** Questions offered as starters on the Ask SpendSense screen. */
export const SUGGESTED_QUESTIONS: string[] = [
  'Why did I spend more this month?',
  'Where am I spending the most?',
  'What subscriptions do I have?',
  'How has my food spending changed?',
];

export const MAX_NOTE_LENGTH = 280;
export const MAX_MERCHANT_LENGTH = 100;
export const MAX_AMOUNT = 10_000_000;
export const MIN_QUESTION_LENGTH = 3;
export const MAX_QUESTION_LENGTH = 400;
