# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaskFlow is a React 19 single-page task management application using Vite, TypeScript, and Tailwind CSS. All data is persisted in localStorage (no backend API).

## Commands

- `npm run dev` — Start dev server on port 3000
- `npm run build` — Production build
- `npm run preview` — Preview production build

No test runner, linter, or formatter is configured.

## Architecture

### State Management

Three React Context providers wrap the app (`App.tsx`):

- **AuthContext** — Mock auth with localStorage persistence (`taskflow_user`). Provides `useAuth()` hook.
- **TaskContext** — Task/category CRUD, filtering, sorting, drag-and-drop reordering. Persists to `taskflow_tasks` and `taskflow_categories`. Provides `useTasks()` hook.
- **ThemeContext** — Light/dark/system theme with class-based Tailwind dark mode. Persists to `taskflow_theme`. Provides `useTheme()` hook.

### Routing

HashRouter with protected routes. `ProtectedRoute` component redirects unauthenticated users to `/login`.

Routes: `/login`, `/register`, `/` (dashboard), `/calendar`, `/categories`, `/profile`.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. Theme (custom colors, dark mode class strategy, font) is configured in `index.css`. The `cn()` utility (`lib/utils.ts`) merges classes using `clsx` + `tailwind-merge`.

### Key Patterns

- **Path aliases**: `@/*` maps to the project root (configured in both `vite.config.ts` and `tsconfig.json`)
- **Drag & drop**: `@hello-pangea/dnd` for task reordering; only active when `sortBy='manual'`
- **Modals**: Page-level state controls modal visibility (TaskModal, TaskDetailModal, CategoryModal)
- **Responsive**: Mobile-first with slide-out sidebar drawer on small screens; desktop fixed sidebar
- **Reusable components**: `Button` (variants: primary/secondary/danger/ghost, sizes: sm/md/lg/icon) and `Input` with label/error/icon support in `components/`
- **Types**: All shared types defined in `types.ts` (Task, Category, User, FilterState, Priority)
