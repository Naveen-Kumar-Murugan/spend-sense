import { RemovalPolicy } from 'aws-cdk-lib';
import {
    AccountRecovery,
    OAuthScope,
    UserPool,
    UserPoolClient,
    VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

/**
 * Cognito User Pool for SpendSense authentication.
 *
 * The frontend signs users up / in against this pool. API Gateway validates
 * the issued JWTs and forwards the claims to Lambda, where the backend derives
 * `userId` from `sub` — never from client input.
 */
export class SpendSenseAuth extends Construct {
    public readonly userPool: UserPool;
    public readonly userPoolClient: UserPoolClient;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.userPool = new UserPool(this, 'UserPool', {
            userPoolName: 'spendsense-users',
            selfSignUpEnabled: true,
            signInAliases: { email: true },
            autoVerify: { email: true },
            standardAttributes: {
                email: { required: true, mutable: true },
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: false,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: AccountRecovery.EMAIL_ONLY,
            userVerification: {
                emailSubject: 'Verify your SpendSense account',
                emailBody: 'Your verification code is {####}',
                emailStyle: VerificationEmailStyle.CODE,
            },
            removalPolicy: RemovalPolicy.RETAIN,
        });

        this.userPoolClient = this.userPool.addClient('WebClient', {
            userPoolClientName: 'spendsense-web',
            generateSecret: false,
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            oAuth: {
                flows: { authorizationCodeGrant: true },
                scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
            },
        });
    }
}