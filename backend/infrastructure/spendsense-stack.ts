import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SpendSenseTable } from './dynamodb';
import { SpendSenseAuth } from './cognito';
import { SpendSenseFunctions } from './lambda';
import { SpendSenseApi } from './api-gateway';
import { BedrockAccess } from './bedrock';

/**
 * SpendSenseStack
 *
 * Composes the full AWS architecture:
 *
 *   React (S3/CloudFront or Amplify Hosting)
 *     → API Gateway (Cognito authorizer)
 *     → Lambda (handler → controller → service → repository)
 *     → DynamoDB (single table)
 *     → Bedrock (insights only)
 *
 * Deploy with: `cd backend && npx cdk deploy`
 */
export class SpendSenseStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const bedrockModelId =
            this.node.tryGetContext('bedrockModelId') ||
            process.env.BEDROCK_MODEL_ID ||
            'anthropic.claude-3-haiku-20240307-v1:0';

        const table = new SpendSenseTable(this, 'Table');
        const auth = new SpendSenseAuth(this, 'Auth');

        const functions = new SpendSenseFunctions(this, 'Functions', {
            table: table.table,
            bedrockModelId,
        });

        new BedrockAccess(this, 'BedrockAccess', {
            insightsFunction: functions.insights,
            modelId: bedrockModelId,
        });

        const api = new SpendSenseApi(this, 'Api', {
            userPool: auth.userPool,
            createPayment: functions.createPayment,
            confirmPayment: functions.confirmPayment,
            transactions: functions.transactions,
            dashboard: functions.dashboard,
            insights: functions.insights,
            profile: functions.profile,
        });

        new CfnOutput(this, 'UserPoolId', {
            value: auth.userPool.userPoolId,
            description: 'Cognito User Pool ID (VITE_COGNITO_USER_POOL_ID)',
        });

        new CfnOutput(this, 'UserPoolClientId', {
            value: auth.userPoolClient.userPoolClientId,
            description: 'Cognito App Client ID (VITE_COGNITO_CLIENT_ID)',
        });

        new CfnOutput(this, 'TableName', {
            value: table.table.tableName,
            description: 'DynamoDB transactions table',
        });

        new CfnOutput(this, 'ApiEndpoint', {
            value: api.api.url ?? '',
            description: 'API Gateway base URL (VITE_API_URL)',
        });
    }
}