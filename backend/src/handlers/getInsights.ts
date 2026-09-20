import { createHandler } from '../utils/handler.ts';
import { insightController } from '../controllers/InsightController.ts';

/**
 * Lambda entry point for insight routes.
 *
 * GET  /insights        → AI-generated spending insights
 * POST /insights/query  → answer a natural-language financial question
 *
 * The controller delegates to InsightService, which computes facts via
 * AnalyticsService and asks Bedrock to explain them.
 */
export const handler = createHandler(async ({ event, userId }) => {
    if (event.httpMethod === 'POST') {
        return insightController.askQuestion(userId, event);
    }
    return insightController.getInsights(userId);
});