Plan: TaskFlow Backend Implementation
Context
TaskFlow is a frontend-only React SPA where all data lives in localStorage. We need to build a backend with real authentication, persistent database storage, and a RESTful API. The backend will be an Express.js + TypeScript server with PostgreSQL (via Prisma) in a server/ subdirectory.

1. Database Schema (Prisma)
File: server/prisma/schema.prisma

Users
Column	Type	Notes
id	UUID (PK)	@default(uuid())
email	String	@unique
password_hash	String	bcrypt
name	String	
created_at	DateTime	@default(now())
updated_at	DateTime	@updatedAt
Tasks
Column	Type	Notes
id	UUID (PK)	@default(uuid())
title	String	required
description	String?	optional
priority	Enum(HIGH,MEDIUM,LOW)	default MEDIUM
is_completed	Boolean	default false
due_date	DateTime?	optional
sort_order	Int	default 0, for drag-and-drop
created_at	DateTime	@default(now())
updated_at	DateTime	@updatedAt
user_id	UUID (FK→Users)	onDelete: Cascade
category_id	UUID? (FK→Categories)	onDelete: SetNull
Indexes: [user_id], [user_id, is_completed], [user_id, category_id], [user_id, sort_order]

Categories
Column	Type	Notes
id	UUID (PK)	@default(uuid())
name	String	
color	String	default "bg-gray-500"
is_default	Boolean	default false
created_at	DateTime	@default(now())
updated_at	DateTime	@updatedAt
user_id	UUID (FK→Users)	onDelete: Cascade
Constraint: @@unique([user_id, name])

RefreshTokens
Column	Type	Notes
id	UUID (PK)	
token	String	@unique
expires_at	DateTime	
created_at	DateTime	
user_id	UUID (FK→Users)	onDelete: Cascade
Key relationships
User has many Tasks, Categories, RefreshTokens
Category has many Tasks
Deleting a category sets category_id = null on its tasks (not deleted)
Deleting a user cascades to all their data
2. API Endpoints
Base: /api. All except auth endpoints require Authorization: Bearer <accessToken>.

Auth (/api/auth)
Method	Path	Body	Response	Notes
POST	/register	{email, password, name?}	{user, accessToken, refreshToken} 201	Seeds 3 default categories. Name defaults to email prefix.
POST	/login	{email, password}	{user, accessToken, refreshToken} 200	
POST	/refresh	{refreshToken}	{accessToken, refreshToken} 200	Token rotation (old token invalidated)
POST	/logout	{refreshToken}	204	Requires auth. Deletes refresh token from DB.
Users (/api/users)
Method	Path	Body	Response
GET	/me	—	{id, email, name, createdAt}
PATCH	/me	{name}	{id, email, name, createdAt}
PUT	/me/password	{currentPassword, newPassword}	{message} 200. Revokes all refresh tokens.
Tasks (/api/tasks)
Method	Path	Body/Query	Response
GET	/	Query: ?search=&priority=high,medium&categoryId=uuid&status=all|active|completed&sortBy=manual|createdAt|dueDate|priority|alphabetical	{tasks: Task[]}
POST	/	{title, description?, priority?, categoryId?, isCompleted?, dueDate?}	Task 201. New task gets sortOrder=0, existing tasks shift +1.
GET	/:id	—	Task
PATCH	/:id	Partial task fields	Task (updatedAt auto-set)
DELETE	/:id	—	204
PUT	/reorder	{tasks: [{id, sortOrder}]}	{message} 200. Batch update for drag-and-drop.
Sort logic matching frontend getFilteredTasks() in TaskContext.tsx:157-186:

manual: ORDER BY sort_order ASC
createdAt: ORDER BY created_at DESC
dueDate: ORDER BY due_date ASC NULLS LAST
priority: ORDER BY weight DESC (high=3, medium=2, low=1)
alphabetical: ORDER BY title ASC
For all sorts except manual: completed tasks sort to bottom when status=all
Categories (/api/categories)
Method	Path	Body	Response
GET	/	—	{categories: [{...category, taskCount}]} (taskCount = active tasks)
POST	/	{name, color?}	Category 201
PATCH	/:id	{name?, color?}	Category
DELETE	/:id	—	204. Returns 403 if isDefault=true. Tasks become uncategorized.
Stats (/api/stats)
Method	Path	Response
GET	/	{totalTasks, completedTasks, activeTasks, completionRate, highPriorityTasks, categoryCount}
Replaces the client-side computation in Profile.tsx.

3. Authentication System
Strategy: JWT access token (15min) + refresh token (7 days) with DB-backed rotation.

Access token payload: {sub: userId, email, iat, exp} — signed with JWT_ACCESS_SECRET
Refresh token payload: {sub: userId, jti: tokenId, iat, exp} — signed with JWT_REFRESH_SECRET, stored in refresh_tokens table
Auth middleware (authenticate): extracts Bearer token, verifies JWT, sets req.userId
Token rotation: each refresh consumes the old token and issues a new pair
Password change: revokes ALL refresh tokens for the user (forces re-login everywhere)
Registration: creates user + 3 default categories in a single transaction
Default categories seeded per user (from TaskContext.tsx:23-28, excluding virtual "All Tasks"):

Work / bg-blue-500 / isDefault: false
Personal / bg-purple-500 / isDefault: false
Study / bg-indigo-500 / isDefault: false
4. Directory Structure

server/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts                    # Entry: dotenv, listen on PORT
│   ├── app.ts                      # Express setup: cors, json, routes, errorHandler
│   ├── config/
│   │   └── env.ts                  # Zod-validated env vars
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── jwt.ts                  # sign/verify helpers for access + refresh tokens
│   │   └── password.ts             # bcrypt hash/compare
│   ├── types/
│   │   └── express.d.ts            # Extend Request with userId
│   ├── middleware/
│   │   ├── authenticate.ts         # JWT auth guard
│   │   ├── validate.ts             # Zod validation middleware factory
│   │   └── errorHandler.ts         # Global error handler
│   ├── validators/
│   │   ├── auth.validator.ts       # register, login, refresh, logout schemas
│   │   ├── user.validator.ts       # updateProfile, changePassword schemas
│   │   ├── task.validator.ts       # create, update, reorder, query schemas
│   │   └── category.validator.ts   # create, update schemas
│   ├── services/
│   │   ├── auth.service.ts         # register, login, refresh, logout logic
│   │   ├── user.service.ts         # getProfile, updateProfile, changePassword
│   │   ├── task.service.ts         # CRUD, filter/sort, reorder
│   │   ├── category.service.ts     # CRUD with taskCount
│   │   └── stats.service.ts        # Aggregate counts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── task.controller.ts
│   │   ├── category.controller.ts
│   │   └── stats.controller.ts
│   └── routes/
│       ├── index.ts                # Mounts all route groups on /api
│       ├── auth.routes.ts
│       ├── user.routes.ts
│       ├── task.routes.ts
│       ├── category.routes.ts
│       └── stats.routes.ts
├── .env.example
├── .env
├── package.json
├── tsconfig.json
└── nodemon.json
Architecture layers: Routes → Controllers → Services → Prisma. Services contain all business logic and never touch req/res.

5. Implementation Phases
Phase 1: Project scaffold
Create server/package.json with dependencies: express, @prisma/client, bcrypt, jsonwebtoken, zod, cors, dotenv + dev deps: typescript, ts-node, nodemon, prisma, @types/*
Create server/tsconfig.json (target ES2022, commonjs, outDir dist, rootDir src, strict)
Create server/nodemon.json (watch src, ext ts, exec ts-node)
Create server/.env.example and server/.env with: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, PORT=3001, CORS_ORIGIN=http://localhost:3000, BCRYPT_SALT_ROUNDS=12
Run cd server && npm install
Phase 2: Database
Create server/prisma/schema.prisma (full schema from section 1)
Run npx prisma migrate dev --name init
Phase 3: Core infrastructure (6 files)
src/lib/prisma.ts — Prisma client singleton
src/config/env.ts — Zod env validation
src/lib/password.ts — bcrypt hash/compare
src/lib/jwt.ts — sign/verify for access + refresh tokens
src/types/express.d.ts — extend Request with userId
src/middleware/errorHandler.ts — global error handler
Phase 4: Middleware (2 files)
src/middleware/authenticate.ts — JWT auth guard
src/middleware/validate.ts — Zod validation factory
Phase 5: Auth module (4 files)
src/validators/auth.validator.ts
src/services/auth.service.ts (register seeds default categories in transaction)
src/controllers/auth.controller.ts
src/routes/auth.routes.ts
Phase 6: User module (4 files)
src/validators/user.validator.ts
src/services/user.service.ts
src/controllers/user.controller.ts
src/routes/user.routes.ts
Phase 7: Category module (4 files)
src/validators/category.validator.ts
src/services/category.service.ts
src/controllers/category.controller.ts
src/routes/category.routes.ts
Phase 8: Task module (4 files)
src/validators/task.validator.ts
src/services/task.service.ts (filtering, sorting, reorder logic)
src/controllers/task.controller.ts
src/routes/task.routes.ts
Phase 9: Stats module (3 files)
src/services/stats.service.ts
src/controllers/stats.controller.ts
src/routes/stats.routes.ts
Phase 10: App assembly (2 files)
src/routes/index.ts — mount all route groups
src/app.ts — Express app with cors, json, routes, health check, error handler
src/index.ts — dotenv + listen
Phase 11: Frontend wiring
Add /api proxy to vite.config.ts → http://localhost:3001
Create api/client.ts — fetch wrapper with auth header + 401 refresh interceptor
Refactor context/AuthContext.tsx — replace localStorage mock with API calls
Refactor context/TaskContext.tsx — replace localStorage with API calls
Total: ~33 new files in server/, 3-4 modified frontend files

Verification
cd server && npm run dev — server starts on port 3001
curl http://localhost:3001/health → {"status":"ok"}
Register: POST /api/auth/register with email+password → returns user + tokens + 3 default categories created
Login: POST /api/auth/login → returns tokens
CRUD tasks and categories with Bearer token
npm run dev (frontend) with proxy → full integration, no localStorage dependency