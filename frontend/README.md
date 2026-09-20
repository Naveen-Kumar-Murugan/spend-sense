# SpendSense — frontend

Production-quality React frontend for SpendSense, built against the SpendSense API
specification and the supplied UI/UX design. Runs entirely on a mock data layer until
the backend is deployed.

## Run it

```bash
cd frontend
npm install
cp .env.example .env     # optional — mocks are on by default
npm run dev              # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run typecheck`.

Sign in with any email and a password of six or more characters — demo auth accepts it.

## Stack

React 18 · TypeScript (strict) · Vite · Tailwind CSS · shadcn-style primitives on Radix ·
React Router 6 · Recharts · Lucide icons · AWS Amplify (ready for Cognito).

## Routes

| Path | Screen |
| --- | --- |
| `/` | Landing |
| `/login`, `/signup`, `/forgot-password` | Authentication |
| `/app` | Dashboard |
| `/app/payment` | Make a payment |
| `/app/transactions` | Transactions (search, filters, table / mobile cards) |
| `/app/transactions/:id` | Transaction detail |
| `/app/insights` | Insights |
| `/app/ask` | Ask SpendSense |
| `/app/settings` | Settings |

Public pages and the authenticated shell are separate. `ProtectedRoute` guards `/app/*`
and shows a session-checking state before deciding.

## Architecture

```
src/
├── pages/          one file per route, composition only
├── components/
│   ├── layout/     AppLayout, AppHeader, AuthLayout, ProtectedRoute
│   ├── navigation/ desktop sidebar, mobile bottom bar
│   ├── dashboard/  summary, trend, category, merchants, recent activity
│   ├── payments/   form, method picker, receipt
│   ├── transactions/ row, card, table, filters, category editor
│   ├── insights/   insight cards, recurring, category change, unusual spend
│   ├── charts/     Recharts wrappers (responsive)
│   ├── common/     shared building blocks and states
│   └── ui/         shadcn-style primitives (Radix + cva)
├── services/       api.ts · auth.ts · payments.ts · http.ts · config.ts · mock/
├── hooks/          useAuth, useAsyncData, useToast, useDebouncedValue, useMediaQuery
├── utils/          format.ts · validation.ts · analytics.ts
├── constants/      categories, navigation, app-wide limits
└── types/          domain types mirroring the API spec
```

Rules the code follows:

- Components never import mock data. Everything goes through `services/api.ts`.
- All money maths lives in `utils/analytics.ts` — never in a component.
- Enums, limits and category metadata are centralised in `constants/`.
- `any` is not used anywhere; `strict` plus `noUnusedLocals` are on.
- Every async surface has loading, empty, error and success states.

## Connecting the backend

1. Deploy the API and set `VITE_API_URL` in `.env`, then set `VITE_USE_MOCKS=false`.
   `services/api.ts` switches every call from the mock store to the REST endpoints;
   no component changes.
2. `services/http.ts` already unwraps the `{ success, data }` envelope, maps the error
   envelope onto `ApiError`, and attaches `Authorization: Bearer <id token>`.
3. For Cognito, set `VITE_COGNITO_USER_POOL_ID` and `VITE_COGNITO_USER_POOL_CLIENT_ID`.
   `services/auth.ts` already runs on Amplify v6 against the pool; with the vars unset it
   falls back to a local demo session. See "Authentication" below.

### Endpoint mapping

| Service function | Endpoint |
| --- | --- |
| `getDashboard()` | `GET /dashboard` |
| `getTransactions(query)` | `GET /transactions` |
| `getTransaction(id)` | `GET /transactions/{id}` |
| `updateTransaction(id, patch)` / `updateTransactionCategory(...)` | `PATCH /transactions/{id}` |
| `createPayment(body)` | `POST /payments` |
| `createUpiIntent(body)` | `POST /payments/upi-intent` |
| `getInsights()` | `GET /insights` |
| `askSpendSense(question)` | `POST /insights/query` |

## Payments

`services/payments.ts` isolates the flow. Demo mode records a `SUCCESS` transaction
immediately. UPI mode builds a `upi://` intent, opens the payer's app, and leaves the
transaction `PENDING` — SpendSense cannot read an external app's result, so the payer
confirms from the receipt panel. Swapping in a real PSP means changing this one file.

## Mock data

`services/mock/data.ts` generates six months of deterministic history from a seeded PRNG
with Indian merchants (Swiggy, Zomato, Uber, Amazon, Netflix, Spotify, Airtel, BigBasket
and more), including steady monthly charges so recurring detection has something to find.
Payments you record persist in `localStorage`; Settings → Security → Reset demo data
restores the original set.

## Responsive behaviour

- **Desktop (≥1024px):** fixed sidebar, data table, three-column dashboard grid.
- **Tablet:** sidebar collapses into the header drawer, grids reflow to two columns.
- **Mobile:** bottom navigation, transaction cards instead of a table, stacked charts,
  full-width forms, safe-area padding.

Charts resize through `ResponsiveContainer`. Reduced motion is respected globally.

## Accessibility

Semantic landmarks, a skip link, labelled form fields with `aria-invalid` and inline
errors, `role="alert"` on failures, `aria-live` toasts, visible focus rings, keyboard
operable menus and sheets (Radix), and tabular figures for every monetary value.


## Authentication

`services/amplify.ts` configures Amplify from the env vars and is called once in
`main.tsx` before React renders. `services/auth.ts` is the only module that touches
Cognito; pages and hooks never import Amplify directly.

| Screen | Amplify call |
| --- | --- |
| Signup — details | `signUp({ username: email, password, options: { userAttributes: { email, given_name, family_name } } })` |
| Signup — code | `confirmSignUp()` then `signIn()` |
| Login | `signIn({ username: email, password, options: { authFlowType: 'USER_SRP_AUTH' } })` |
| Login — unconfirmed account | `resendSignUpCode()` then `confirmSignUp()` |
| Forgot password | `resetPassword()` then `confirmResetPassword()` |
| Session restore | `getCurrentUser()` + `fetchUserAttributes()` |
| Bearer token | `fetchAuthSession().tokens.idToken` |
| Settings | `updateUserAttributes()` |
| Sign out | `signOut()` |

Because the pool sets `autoVerify: { email: true }` with `VerificationEmailStyle.CODE`,
signup is two steps: Cognito emails a six-digit code and the account is inactive until
`confirmSignUp()` succeeds. The signup page handles that inline, and the login page
catches `UserNotConfirmedException` and drops the person into the same code screen.

The password checklist in the UI mirrors the pool policy: 8+ characters, one lowercase
letter, one number. Uppercase and symbols are not required — keep the two in sync if you
change the CDK.

The client has no secret (`generateSecret: false`), so it is safe in a browser. No AWS
credentials, access keys or Identity Pool are used anywhere in this app.

### CDK outputs to copy into `.env`

```ts
new CfnOutput(this, 'UserPoolId', { value: auth.userPool.userPoolId });
new CfnOutput(this, 'UserPoolClientId', { value: auth.userPoolClient.userPoolClientId });
```

```
VITE_COGNITO_USER_POOL_ID=ap-south-1_xxxxxxxxx
VITE_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_AWS_REGION=ap-south-1
VITE_USE_MOCKS=false
VITE_API_URL=https://xxxx.execute-api.ap-south-1.amazonaws.com/prod
```

Vite only exposes `VITE_`-prefixed vars, and these two identifiers are public by design —
they appear in every Cognito web app.
