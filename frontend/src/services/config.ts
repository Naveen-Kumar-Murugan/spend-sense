/** Runtime configuration read from Vite env vars. Never contains secrets. */
export const config = {
  apiUrl: import.meta.env.VITE_API_URL ?? '',
  /** Mocks are used when explicitly enabled or when no API URL is configured. */
  useMocks:
    import.meta.env.VITE_USE_MOCKS === 'true' || !import.meta.env.VITE_API_URL,
  cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
    userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ?? '',
    region: import.meta.env.VITE_AWS_REGION ?? 'ap-south-1',
  },
} as const;

export const isCognitoConfigured = (): boolean =>
  Boolean(config.cognito.userPoolId && config.cognito.userPoolClientId);
