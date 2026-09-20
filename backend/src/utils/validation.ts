import { z } from 'zod';
import { CATEGORIES, PAYMENT_METHODS } from '../constants/categories';
import { ValidationError } from './errors';

/**
 * Input validation schemas.
 *
 * Controllers use these to validate/parse request bodies before handing data to
 * the service layer. This keeps the service layer free of HTTP concerns while
 * still guaranteeing that only well-formed data reaches DynamoDB.
 */

/** Rejects control characters and trims whitespace from merchant strings. */
export function sanitizeMerchant(raw: string): string {
    return raw
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

export const categoryEnum = z.enum(CATEGORIES);
export const paymentMethodEnum = z.enum(PAYMENT_METHODS);

/**
 * Parses `input` against `schema`, throwing a ValidationError with a friendly
 * message (and structured issues) when validation fails. Shared by controllers.
 */
export function parseOrThrow<T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> {
    const result = schema.safeParse(input);
    if (!result.success) {
        const first = result.error.errors[0];
        throw new ValidationError(first?.message || 'Invalid request.', 'VALIDATION_ERROR', {
            issues: result.error.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
            })),
        });
    }
    return result.data;
}

export const createPaymentSchema = z.object({
    amount: z
        .number({ invalid_type_error: 'Amount must be a number.' })
        .finite()
        .positive('Amount must be greater than zero.')
        .max(10000000, 'Amount exceeds the maximum allowed value.'),
    merchant: z
        .string({ required_error: 'Merchant is required.' })
        .transform(sanitizeMerchant)
        .refine((v) => v.length > 0, 'Merchant is required.')
        .refine((v) => v.length <= 100, 'Merchant must be 100 characters or fewer.'),
    category: categoryEnum,
    subcategory: z.string().trim().min(1).max(40).optional(),
    paymentMethod: paymentMethodEnum,
    note: z.string().trim().max(280).optional(),
    mode: z.enum(['DEMO', 'UPI']).default('DEMO'),
    currency: z.string().trim().length(3).default('INR'),
    /** Present for UPI mode: the payee VPA entered by the payer. */
    receiverUpiId: z.string().trim().max(100).optional(),
});

export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;

/** Loose-but-real VPA shape: local-part @ handle, e.g. rahul@oksbi. */
export const UPI_ID_PATTERN = /^[\w.\-]{2,64}@[a-zA-Z][\w.\-]{1,24}$/;

export function validateUpiId(value: string): boolean {
    return UPI_ID_PATTERN.test(value.trim());
}

export const updateProfileSchema = z
    .object({
        upiId: z
            .string()
            .trim()
            .refine((v) => v.length === 0 || validateUpiId(v), 'Enter a valid UPI ID like naveen@oksbi.'),
        location: z.string().trim().max(80).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, 'At least one field must be provided.');

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

export const updateTransactionSchema = z
    .object({
        category: categoryEnum.optional(),
        subcategory: z.string().trim().min(1).max(40).optional(),
        merchant: z
            .string()
            .transform(sanitizeMerchant)
            .refine((v) => v.length > 0, 'Merchant cannot be empty.')
            .optional(),
        note: z.string().trim().max(280).optional(),
    })
    .refine((v) => Object.keys(v).length > 0, 'At least one field must be provided.');

export type UpdateTransactionRequest = z.infer<typeof updateTransactionSchema>;

export const insightQuerySchema = z.object({
    question: z
        .string({ required_error: 'A question is required.' })
        .trim()
        .min(3, 'Please provide a longer question.')
        .max(400, 'Question is too long.'),
});

export type InsightQueryRequest = z.infer<typeof insightQuerySchema>;

export const listTransactionsQuerySchema = z.object({
    search: z.string().trim().max(100).optional(),
    category: categoryEnum.optional(),
    month: z
        .string()
        .regex(/^\d{4}-\d{2}$/, 'Month must be formatted as YYYY-MM.')
        .optional(),
    limit: z.coerce.number().int().positive().max(200).default(100),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;

export const createUpiIntentSchema = z.object({
    amount: z.number().finite().positive().max(10000000),
    merchant: z
        .string()
        .transform(sanitizeMerchant)
        .refine((v) => v.length > 0, 'Merchant is required.'),
    category: categoryEnum,
    paymentMethod: paymentMethodEnum.default('UPI'),
    /** The receiver's VPA, e.g. rahul@oksbi. Required for a UPI intent. */
    receiverUpiId: z
        .string({ required_error: 'Receiver UPI ID is required.' })
        .trim()
        .min(1, 'Receiver UPI ID is required.')
        .refine(validateUpiId, 'Enter a valid UPI ID like rahul@oksbi.'),
    note: z.string().trim().max(280).optional(),
});

export type CreateUpiIntentRequest = z.infer<typeof createUpiIntentSchema>;