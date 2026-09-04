# Scriverly

Scriverly is a writing workspace for organizing ideas, drafting content, and refining long-form text. The app combines marketing pages, authenticated product flows, onboarding, essays, profile settings, AI-assisted writing features, and subscription handling.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase
- Stripe
- Cypress
- Sass

## Prerequisites

- Node.js 20 or newer
- npm, pnpm, yarn, or bun
- Access to the required Supabase, Stripe, Anthropic, and Resend credentials for local development

## Setup

- Install dependencies.

```bash
npm install
```

- Create a local environment file if needed and provide the required values.

- Start the development server.

```bash
npm run dev
```

- Open http://localhost:3000 in your browser.

## Environment Variables

The app expects values such as:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_DESCRIPTION`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `RESEND_API_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PREMIUM_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Keep secrets out of source control and use local environment files or your deployment platform's secret storage.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - build the application for production
- `npm run start` - run the production build
- `npm run lint` - run ESLint
- `npm run cypress:open` - open Cypress in interactive mode
- `npm run cypress:run` - run the full Cypress suite
- `npm run cypress:run:auth` - run auth-related Cypress tests
- `npm run cypress:run:app` - run app-related Cypress tests

## Project Structure

- `src/app` - application routes, layouts, and API handlers
- `src/components` - shared UI and feature components
- `src/libs` - clients, helpers, hooks, validations, and integrations
- `src/services` - domain-specific service layers
- `cypress` - end-to-end tests, fixtures, and support files
- `supabase/migrations` - database migrations

## Testing

Use Cypress for end-to-end coverage and ESLint for code quality checks. Add new tests near the feature they exercise so behavior stays easy to verify.

## Deployment

The app is designed to run in a standard Next.js deployment environment with Supabase and Stripe configured for the target environment. Make sure all environment variables are set before building or deploying.
