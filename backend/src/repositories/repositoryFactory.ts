import { ITransactionRepository } from "./ITransactionRepository";
import { InMemoryTransactionRepository } from "./InMemoryTransactionRepository";
import { TransactionRepository } from "./TransactionRepository";

/**
 * Repository factory.
 *
 * Chooses the persistence implementation at runtime:
 *   - `USE_IN_MEMORY_STORE=true` (default when no table is configured) → in-memory
 *   - otherwise → DynamoDB single-table repository
 *
 * This is what allows the identical service/controller/handler code to run
 * locally with zero AWS setup and in production against DynamoDB.
 */

let instance: ITransactionRepository | null = null;

function shouldUseInMemory(): boolean {
  if (process.env.USE_IN_MEMORY_STORE === "true") {
    return true;
  }
  if (process.env.USE_IN_MEMORY_STORE === "false") {
    return false;
  }
  // Default: use in-memory unless a DynamoDB table is explicitly configured.
  return !(process.env.TRANSACTIONS_TABLE_NAME || process.env.TABLE_NAME);
}

export function getTransactionRepository(): ITransactionRepository {
  if (!instance) {
    if (shouldUseInMemory()) {
      instance = new InMemoryTransactionRepository();
    } else {
      instance = new TransactionRepository();
    }
  }
  return instance;
}

/** Test helper: inject a repository implementation. */
export function setTransactionRepository(
  repository: ITransactionRepository,
): void {
  instance = repository;
}

export function resetTransactionRepository(): void {
  instance = null;
}
