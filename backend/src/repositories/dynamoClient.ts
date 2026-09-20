import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/**
 * Shared DynamoDB document client.
 *
 * The repository layer is the only place that should import from this module.
 * Endpoint/region overrides come from environment variables so the same code
 * runs against DynamoDB Local during development and real DynamoDB on AWS.
 */
const config: DynamoDBClientConfig = {
  region:
    process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1",
};

if (process.env.DYNAMODB_ENDPOINT) {
  config.endpoint = process.env.DYNAMODB_ENDPOINT;
  config.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "local",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "local",
  };
}

const baseClient = new DynamoDBClient(config);

export const documentClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
});

export function getTableName(): string {
  const table = process.env.TRANSACTIONS_TABLE_NAME || process.env.TABLE_NAME;
  if (!table) {
    throw new Error(
      "No DynamoDB table configured. Set TRANSACTIONS_TABLE_NAME (or TABLE_NAME) in the environment.",
    );
  }
  return table;
}
