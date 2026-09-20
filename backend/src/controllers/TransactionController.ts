import type { APIGatewayProxyEvent } from "aws-lambda";
import {
  listTransactionsQuerySchema,
  parseOrThrow,
  updateTransactionSchema,
} from "../utils/validation";
import {
  transactionService,
  TransactionService,
} from "../services/TransactionService";
import { Transaction, UpdateTransactionInput } from "../models/Transaction";
import { NotFoundError } from "../utils/errors";

export class TransactionController {
  private readonly service: TransactionService;

  constructor(service: TransactionService = transactionService) {
    this.service = service;
  }

  async getTransactions(
    userId: string,
    event: APIGatewayProxyEvent,
  ): Promise<Transaction[]> {
    const query = parseOrThrow(
      listTransactionsQuerySchema,
      event.queryStringParameters ?? {},
    );
    return this.service.getTransactions(userId, query);
  }

  async getTransaction(
    userId: string,
    transactionId: string,
  ): Promise<Transaction> {
    if (!transactionId) {
      throw new NotFoundError("Transaction id is required.");
    }
    return this.service.getTransaction(userId, transactionId);
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    event: APIGatewayProxyEvent,
  ): Promise<Transaction> {
    const body = event.body ? JSON.parse(event.body) : {};
    const updates = parseOrThrow(updateTransactionSchema, body);

    return this.service.updateTransaction(
      userId,
      transactionId,
      updates as UpdateTransactionInput,
    );
  }
}

export const transactionController = new TransactionController();
