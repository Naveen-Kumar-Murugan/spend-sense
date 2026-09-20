import { createHandler } from '../utils/handler.ts';
import { paymentController } from '../controllers/PaymentController.ts';

export const handler = createHandler(async ({ event, userId }) => {
    const path = event.path || '';
    if (path.endsWith('/upi-intent')) {
        return paymentController.createUpiIntent(userId, event);
    }
    return paymentController.createPayment(userId, event);
}, 201);