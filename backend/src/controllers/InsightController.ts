import type { APIGatewayProxyEvent } from "aws-lambda";
import { insightQuerySchema, parseOrThrow } from "../utils/validation";
import {
  insightService,
  InsightService,
  InsightsResponse,
  FinancialAnswer,
} from "../services/InsightService";
import { parseJsonBody } from "../utils/http";

export class InsightController {
  private readonly service: InsightService;

  constructor(service: InsightService = insightService) {
    this.service = service;
  }

  async getInsights(userId: string): Promise<InsightsResponse> {
    return this.service.generateInsights(userId);
  }

  async askQuestion(
    userId: string,
    event: APIGatewayProxyEvent,
  ): Promise<FinancialAnswer> {
    const body = parseJsonBody(event.body);
    const { question } = parseOrThrow(insightQuerySchema, body);
    return this.service.answerFinancialQuestion(userId, question);
  }
}

export const insightController = new InsightController();
