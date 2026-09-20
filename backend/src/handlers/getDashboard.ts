import { createHandler } from '../utils/handler.ts';
import { dashboardController } from '../controllers/DashboardController.ts';

/**
 * Lambda entry point for GET /dashboard
 *
 * Returns the full dashboard payload: totals, category breakdown, charts data,
 * recent transactions, recurring payments, and AI insights. Assembled entirely
 * by the controller/service layers.
 */
export const handler = createHandler(async ({ userId }) => {
    return dashboardController.getDashboard(userId);
});