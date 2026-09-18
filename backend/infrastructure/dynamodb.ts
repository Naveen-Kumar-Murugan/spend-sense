import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

/**
 * Single-table DynamoDB design for SpendSense.
 *
 *   PK: USER#{userId}
 *   SK: TXN#{createdAt}#{transactionId} | PROFILE
 *
 * This lets every query be scoped to the authenticated user with a single
 * partition-key lookup.
 */
export class SpendSenseTable extends Construct {
    public readonly table: Table;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.table = new Table(this, 'TransactionsTable', {
            tableName: `${Stack.of(this).stackName}-transactions`,
            partitionKey: { name: 'PK', type: AttributeType.STRING },
            sortKey: { name: 'SK', type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            pointInTimeRecovery: true,
            removalPolicy: RemovalPolicy.RETAIN,
        });
    }
}