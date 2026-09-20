import { createHandler } from '../utils/handler.ts';
import { transactionController } from '../controllers/TransactionController.ts';

/**
 * Lambda entry point for transaction routes.
 *
 * GET   /transactions            → list/search/filter transactions
 * GET   /transactions/{id}       → single transaction
 * PATCH /transactions/{id}       → update category/subcategory
 *
 * Path parameters are read from the API Gateway event and passed to the
 * controller. No business logic lives here.
 */
export const handler = createHandler(async ({ event, userId }) => {
    const transactionId = event.pathParameters?.transactionId;
    const method = event.httpMethod;

    if (transactionId && method === 'PATCH') {
        return transactionController.updateTransaction(userId, transactionId, event);
    }
    if (transactionId && method === 'GET') {
        return transactionController.getTransaction(userId, transactionId);
    }
    return transactionController.getTransactions(userId, event);
});