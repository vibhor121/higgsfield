# Higgsfield

Higgsfield is a modern TurboRepo project combining a Next.js frontend with a Bun + Express backend. It is designed to showcase AI-powered avatar and video workflows, with authentication, credits management, and media generation support.

## Demo Video

Watch the project demo on X:

- https://x.com/mahajanvibhor8/status/2067188307273126384/video/1

> This demo shows the product in action, including avatar creation, video generation, and the user dashboard experience.

## Project Structure

- `apps/frontend` — Next.js application for the user interface
- `apps/backend` — Bun + Express backend with Prisma and API routes
- `packages/eslint-config` — shared ESLint configuration
- `packages/typescript-config` — shared TypeScript configuration
- `packages/ui` — shared UI components

## What it includes

- User authentication and session handling
- Avatar creation and management
- Video generation and result tracking
- Credits management
- AI model integrations for media generation
- Full monorepo tooling with TurboRepo

## Getting Started

### Install dependencies

```sh
bun install
```

### Run development mode

```sh
bun exec turbo dev
```

This starts both `apps/frontend` and `apps/backend` in development mode.

## Scripts

Use the root workspace scripts:

```sh
bun exec turbo build
bun exec turbo dev
bun exec turbo run lint
bun exec turbo run check-types
bun exec prettier --write "**/*.{ts,tsx,md}"
```

## Frontend

The frontend is a Next.js app located in `apps/frontend`.

```sh
cd apps/frontend
bun run next dev
```

## Backend

The backend is a Bun-based API service with Prisma and Express, located in `apps/backend`.

```sh
cd apps/backend
bun run --watch src/index.ts
```

## Notes

- Requires Node.js 18+ and Bun
- The repository uses TurboRepo for monorepo task orchestration
- Update the `apps/backend/.env` or backend environment variables as needed for your database and API keys

## License

This repository is private and intended for demo / development use.
