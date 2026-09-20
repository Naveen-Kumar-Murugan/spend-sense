import { createHandler } from '../utils/handler.ts';
import { ValidationError } from '../utils/errors.ts';
import { paymentService } from '../services/PaymentService.ts';

/**
 * POST /payments/{transactionId}/confirm
 *
 * Marks a PENDING UPI payment as SUCCESS once the payer confirms. SpendSense
 * cannot read the external UPI app's result, so this manual confirmation is
 * the reconciliation path for the intent flow. The transaction id comes from
 * the path and the user id from the Cognito JWT, so a payer can only ever
 * confirm their own payment.
 */
export const handler = createHandler(async ({ event, userId }) => {
    const transactionId = event.pathParameters?.transactionId;
    if (!transactionId) {
        throw new ValidationError('Transaction id is required.');
    }
    return paymentService.updatePaymentStatus(userId, transactionId, 'SUCCESS');
});
