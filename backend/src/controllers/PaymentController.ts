import type { APIGatewayProxyEvent } from "aws-lambda";
import {
  CreatePaymentRequest,
  createPaymentSchema,
  createUpiIntentSchema,
  parseOrThrow,
} from "../utils/validation";
import {
  paymentService,
  PaymentService,
  PaymentReceipt,
} from "../services/PaymentService";
import { parseJsonBody } from "../utils/http";

export class PaymentController {
  private readonly service: PaymentService;

  constructor(service: PaymentService = paymentService) {
    this.service = service;
  }

  async createPayment(
    userId: string,
    event: APIGatewayProxyEvent,
  ): Promise<PaymentReceipt> {
    const body = parseJsonBody(event.body);
    const request = parseOrThrow(
      createPaymentSchema,
      body,
    ) as CreatePaymentRequest;
    return this.service.createPayment(userId, request);
  }

  async createUpiIntent(
    userId: string,
    event: APIGatewayProxyEvent,
  ): Promise<PaymentReceipt> {
    const body = parseJsonBody(event.body);
    const parsed = parseOrThrow(createUpiIntentSchema, body);
    const request: CreatePaymentRequest = {
      amount: parsed.amount,
      merchant: parsed.merchant,
      category: parsed.category,
      paymentMethod: parsed.paymentMethod,
      mode: "UPI",
      currency: "INR",
    };
    return this.service.createPayment(userId, request);
  }
}

export const paymentController = new PaymentController();
