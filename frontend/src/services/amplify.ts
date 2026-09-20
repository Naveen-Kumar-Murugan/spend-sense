/**
 * Amplify bootstrap. Called once from main.tsx before React renders.
 *
 * Only the User Pool is configured — SpendSense uses the JWT directly against
 * API Gateway's Cognito authorizer, so no Identity Pool or hosted UI is needed.
 */
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import { defaultStorage } from 'aws-amplify/utils';
import { config, isCognitoConfigured } from './config';

export function configureAmplify(): void {
  if (!isCognitoConfigured()) return;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: config.cognito.userPoolId,
        userPoolClientId: config.cognito.userPoolClientId,
        loginWith: { email: true },
        signUpVerificationMethod: 'code',
        userAttributes: { email: { required: true } },
        passwordFormat: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: false,
          requireNumbers: true,
          requireSpecialCharacters: false,
        },
      },
    },
  });

  // Tokens live in localStorage so a refresh keeps the session.
  // Swap for `sessionStorage` if you want sign-out on tab close.
  cognitoUserPoolsTokenProvider.setKeyValueStorage(defaultStorage);
}
