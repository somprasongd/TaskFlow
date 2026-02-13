# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskFlow is a full-stack task management application.
- **Frontend**: React 19 single-page application using Vite, TypeScript, and Tailwind CSS.
- **Backend**: Node.js Express server with PostgreSQL database and Prisma ORM.

## Commands

### Frontend
- `npm run dev` — Start frontend dev server on port 3000
- `npm run build` — Production build
- `npm run preview` — Preview production build

### Backend (in `server/` directory)
- `npm run dev` — Start backend dev server on port 3001
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run production build
- `npx prisma migrate dev` — Run database migrations
- `npx prisma studio` — Open Prisma database browser

## Architecture

### Frontend State Management
Three React Context providers wrap the app (`App.tsx`):
- **AuthContext** — Manages user authentication state, tokens, and profile. Interacts with `/api/auth` and `/api/users`.
- **TaskContext** — Task/category CRUD, filtering, sorting, drag-and-drop reordering. Interacts with `/api/tasks` and `/api/categories`.
- **ThemeContext** — Light/dark/system theme with class-based Tailwind dark mode. Persists to `taskflow_theme`.

### Backend Implementation
- **Express.js**: REST API framework.
- **Prisma**: Type-safe ORM for PostgreSQL.
- **JWT**: Authentication using access (15m) and refresh (7d) tokens.
- **Zod**: Request validation for all endpoints.

### Routing
- **Frontend**: HashRouter with protected routes. `ProtectedRoute` redirects unauthenticated users to `/login`.
- **Backend**: API endpoints mounted under `/api`.

### Key Patterns
- **Path aliases**: `@/*` maps to the project root (frontend).
- **API Client**: `services/client.ts` handles fetch requests with auth headers and automatic token refresh.
- **Reusable components**: `components/Button.tsx` and `components/Input.tsx` provide consistent UI elements.
- **Types**: Shared types defined in `types.ts`.
- **Backend Layers**: Routes -> Controllers -> Services -> Prisma. Business logic resides in Services.
