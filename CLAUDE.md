# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start:prod   # Build and serve production

# Testing
npm test             # Run tests (interactive)
npm run test:watch   # Run tests in watch mode
npm run test:cov     # Run tests with coverage

# Code quality
npm run lint         # Lint and auto-fix src/**/*.{js,jsx,ts,tsx}
```

Run a single test file:
```bash
npm test -- --testPathPattern=src/path/to/file.test.tsx
```

## Environment Variables

Copy `.env.example` to `.env`:
- `API_URI_DEV`: Dev API endpoint
- `API_URI`: Local API endpoint (default: `http://localhost:8080/api`)
- `NODE_ENV`: `prod` or `dev`

## Architecture

**Stack**: React 18 + TypeScript, React Router v6, Tailwind CSS v4 + DaisyUI, React Hook Form + Zod, Chart.js, Preact Signals.

### API Layer

`src/services/cg-api.service.ts` — generic HTTP client that auto-injects Bearer token from cookies. All domain services (`auth`, `user`, `shelter`, `coordinators`, `products`, etc.) wrap this client. Token management lives in `token.service.ts`; cookie helpers in `cookie.service.ts`.

### Auth & Routing

`src/context/Auth/` — React Context that holds `currentUser`, `status`, and `settings`, initialized from the stored token on load. Exposes `loginUser()` and `logout()`.

`src/routes/` — Three route guard wrappers:
- `AuthRoute` — public-only (login/register)
- `PrivateRoute` — requires authenticated user
- `PrivateRoleRoute` — requires specific role (admin)

### Forms & Validation

Zod schemas live in `src/validators/`. React Hook Form is wired to Zod via `@hookform/resolvers`. Add new validators there and import them into forms.

### Layout

`src/layout/index.tsx` — wraps all authenticated pages with Header, Sidebar, Notification panel, Footer, and a React Router `<Outlet>`.

### State

Auth state via React Context; lightweight reactive state via Preact Signals (`@preact/signals-react`).

### Styling

Tailwind v4 + DaisyUI. Active themes: `corporate` (light) and `business` (dark). Configured in `tailwind.config.js`.

### Storybook

Storybook 8.4.7 is installed for component documentation. Stories live alongside components.
