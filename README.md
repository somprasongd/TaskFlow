# TaskFlow

TaskFlow is a modern, intuitive task management application designed for individuals and small teams. It features priority management, categorization, and a streamlined workflow with real-time persistence.

## Features

- **Authentication**: Secure registration and login with JWT.
- **Task Management**: CRUD operations for tasks with priority levels.
- **Categorization**: Organize tasks into custom categories.
- **Drag & Drop**: Reorder tasks manually (when manual sorting is enabled).
- **Responsive Design**: Fully functional on mobile and desktop.
- **Dark Mode**: Supports light, dark, and system themes.

## Tech Stack

### Frontend
- React 19 / Vite
- TypeScript
- Tailwind CSS v4
- Context API for state management

### Backend
- Node.js / Express
- PostgreSQL
- Prisma ORM
- Zod for validation
- JWT for authentication

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   ```

### Configuration

1. Create a `.env` file in the root directory (for frontend):
   ```env
   VITE_API_URL=/api
   ```

2. Create a `.env` file in the `server` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
   JWT_ACCESS_SECRET="your_access_secret"
   JWT_REFRESH_SECRET="your_refresh_secret"
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

### Running the App

1. **Start the Backend**:
   ```bash
   cd server
   npx prisma migrate dev
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.
