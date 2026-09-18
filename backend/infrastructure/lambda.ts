import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import * as path from 'path';

/**
 * Lambda functions for SpendSense.
 *
 * A small, fixed set of functions (one per route group) keeps the deployment
 * simple while preserving the layered handler → controller → service →
 * repository structure inside each bundle. This is a modular monolith on
 * Lambda, not microservices.
 */
export interface SpendSenseFunctionsProps {
    table: Table;
    bedrockModelId: string;
}

export class SpendSenseFunctions extends Construct {
    public readonly createPayment: NodejsFunction;
    public readonly transactions: NodejsFunction;
    public readonly dashboard: NodejsFunction;
    public readonly insights: NodejsFunction;

    constructor(scope: Construct, id: string, props: SpendSenseFunctionsProps) {
        super(scope, id);

        const environment = {
            TRANSACTIONS_TABLE_NAME: props.table.tableName,
            BEDROCK_MODEL_ID: props.bedrockModelId,
            LOG_LEVEL: 'info',
        };

        const makeFunction = (fnId: string, entry: string): NodejsFunction => {
            const fn = new NodejsFunction(this, fnId, {
                functionName: `spendsense-${fnId.toLowerCase()}`,
                runtime: Runtime.NODEJS_20_X,
                entry: path.join(__dirname, '..', 'src', 'handlers', entry),
                handler: 'handler',
                timeout: Duration.seconds(30),
                memorySize: 512,
                environment,
                bundling: {
                    minify: true,
                    sourceMap: true,
                    externalModules: ['@aws-sdk/*'],
                },
            });

            new LogGroup(this, `${fnId}LogGroup`, {
                logGroupName: `/aws/lambda/${fn.functionName}`,
                retention: RetentionDays.ONE_MONTH,
            });

            props.table.grantReadWriteData(fn);
            return fn;
        };

        this.createPayment = makeFunction('CreatePayment', 'createPayment.ts');
        this.transactions = makeFunction('Transactions', 'getTransactions.ts');
        this.dashboard = makeFunction('Dashboard', 'getDashboard.ts');
        this.insights = makeFunction('Insights', 'getInsights.ts');
    }
}