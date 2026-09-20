import { CfnOutput } from 'aws-cdk-lib';
import {
    AuthorizationType,
    CognitoUserPoolsAuthorizer,
    Cors,
    LambdaIntegration,
    RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';

/**
 * REST API Gateway for SpendSense.
 *
 * Every route (except the health check) requires a valid Cognito JWT. The
 * authorizer validates the token and forwards the claims to Lambda, where the
 * backend derives the user id from `sub`.
 */
export interface SpendSenseApiProps {
    userPool: UserPool;
    createPayment: NodejsFunction;
    confirmPayment: NodejsFunction;
    transactions: NodejsFunction;
    dashboard: NodejsFunction;
    insights: NodejsFunction;
    profile: NodejsFunction;
}

export class SpendSenseApi extends Construct {
    public readonly api: RestApi;

    constructor(scope: Construct, id: string, props: SpendSenseApiProps) {
        super(scope, id);

        //creating a API Gateway RESTApi
        this.api = new RestApi(this, 'Api', {
            restApiName: 'spendsense-api',
            description: 'SpendSense personal finance API',
            //This is the CORS Configuration
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'Authorization'],
            },
        });

        //This is like the API Gatewauy Cognito Authorizer, which checks the Bearer token from the Authorization from the header, it is added to authed, which then used across all Lambda intgrations.
        const authorizer = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [props.userPool],
            authorizerName: 'spendsense-cognito-authorizer',
            identitySource: 'method.request.header.Authorization',
        });

        const authed = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer,
        };

        this.api.root.addResource('health').addMethod('GET', new LambdaIntegration(props.dashboard));

        // POST /payments
        // POST /payments/upi-intent
        // POST /payments/{transactionId}/confirm
        const payments = this.api.root.addResource('payments');
        payments.addMethod('POST', new LambdaIntegration(props.createPayment), authed);
        payments.addResource('upi-intent').addMethod('POST', new LambdaIntegration(props.createPayment), authed);
        const payment = payments.addResource('{transactionId}');
        payment.addResource('confirm').addMethod('POST', new LambdaIntegration(props.confirmPayment), authed);

        // GET   /transactions
        // GET   /transactions/{transactionId}
        // PATCH /transactions/{transactionId}
        const transactions = this.api.root.addResource('transactions');
        transactions.addMethod('GET', new LambdaIntegration(props.transactions), authed);
        const transaction = transactions.addResource('{transactionId}');
        transaction.addMethod('GET', new LambdaIntegration(props.transactions), authed);
        transaction.addMethod('PATCH', new LambdaIntegration(props.transactions), authed);

        //GET /dashboard
        this.api.root.addResource('dashboard').addMethod('GET', new LambdaIntegration(props.dashboard), authed);

        // GET   /profile
        // PATCH /profile  (save the user's own UPI ID on the PROFILE item)
        const profile = this.api.root.addResource('profile');
        profile.addMethod('GET', new LambdaIntegration(props.profile), authed);
        profile.addMethod('PATCH', new LambdaIntegration(props.profile), authed);

        // GET  /insights
        // POST /insights/query
        const insights = this.api.root.addResource('insights');
        insights.addMethod('GET', new LambdaIntegration(props.insights), authed);
        insights.addResource('query').addMethod('POST', new LambdaIntegration(props.insights), authed);

        //This essentially outputs the API Url when the cdk is deployed.
        new CfnOutput(this, 'ApiUrl', {
            value: this.api.url ?? '',
            description: 'SpendSense API base URL',
        });
    }
}