# Project-Management-And-Collaboration-Tool
A scalable Kanban-based project management platform with real-time collaboration, drag-and-drop task workflows, user roles, and optimized performance using Reactjs. Designed to improve team productivity and workflow visibility.
---
 
## Table of Contents
 
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running with Docker](#running-with-docker)
- [API Documentation](#api-documentation)
- [Architecture Decisions](#architecture-decisions)
- [Environment Variables](#environment-variables)
 
---
 
## Features
 
- **Authentication** — Register/Login with JWT access tokens (15 min) + refresh tokens (7 days), auto-refresh via Axios interceptor
- **Projects** — Create, update, delete projects; invite members with roles (owner / admin / member)
- **Boards** — Multiple Kanban boards per project with custom columns
- **Tasks** — Full CRUD with status, priority, due date, assignee, labels, and activity history
- **Drag & Drop** — Kanban reordering via @dnd-kit with fractional indexing (no bulk re-ordering)
- **Comments** — Per-task comments with real-time updates via Socket.io
- **Search & Filters** — Filter tasks by status, priority, assignee; full-text search
- **Real-time** — Socket.io rooms per board; task create/update/delete broadcast live
- **API Docs** — Swagger UI at `/api/docs`
- **Role-Based Access** — Owner, admin, member permissions enforced on every route
 
---
 
## Tech Stack
 
| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js 18+ |
| Backend framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| Real-time | Socket.io |
| Validation | Joi |
| API Docs | Swagger UI + YAML |
| Frontend framework | React 18 + Vite |
| State management | Redux Toolkit |
| Routing | React Router v6 |
| HTTP client | Axios (with interceptors) |
| Drag & drop | @dnd-kit/core + @dnd-kit/sortable |
| Styling | Tailwind CSS |
| Forms | React Hook Form |
| Toasts | React Hot Toast |
 
---
 
## Project Structure
 
```
project/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── models/          # Mongoose schemas (User, Project, Board, Task, Comment)
│   │   ├── routes/          # Express route definitions
│   │   ├── controllers/     # Request handlers (thin layer)
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, RBAC, validation, error handler
│   │   ├── validators/      # Joi schemas
│   │   ├── utils/           # JWT helpers, API response helpers, AppError
│   │   ├── sockets/         # Socket.io setup and event handlers
│   │   ├── jobs/            # node-cron background jobs
│   │   ├── app.js           # Express app config
│   │   └── server.js        # HTTP server + socket init
│   ├── swagger.yaml         # Full OpenAPI 3.0 spec
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instance + API modules
    │   ├── store/           # Redux store + slices
    │   ├── pages/           # Route-level pages
    │   ├── components/
    │   │   ├── board/       # KanbanBoard, BoardColumn, TaskCard
    │   │   ├── task/        # TaskFormModal, TaskDetailModal, TaskFilters
    │   │   ├── common/      # Modal, Spinner, Avatar, ProtectedRoute
    │   │   └── layout/      # Layout with sidebar
    │   ├── hooks/           # useSocket, useDebounce, useAuth
    │   ├── utils/           # Date formatters, priority/status configs
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```
 
---
 
## Prerequisites
 
Make sure you have installed:
 
- **Node.js** v18 or higher — https://nodejs.org
- **npm** v9+ (comes with Node)
- **MongoDB** v6+ running locally OR a MongoDB Atlas connection string
- **Git**
 
Optional:
- **Redis** (for caching / rate-limit storage) — not required to run the app
- **Docker + Docker Compose** (for containerized setup)
 
---
 
## Backend Setup
 
### Step 1 — Install dependencies
 
```bash
cd backend
npm install
```
 
### Step 2 — Configure environment
 
```bash
cp .env.example .env
```
 
Open `.env` and set the following **required** values:
 
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/project_management
JWT_ACCESS_SECRET=tasksecretjwt
JWT_REFRESH_SECRET=refreshtasksecret
CLIENT_URL=http://localhost:5173
```
 
> **Tip:** Generate strong secrets with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
 
### Step 3 — Start MongoDB
 
If using a local MongoDB installation:
```bash
# macOS (Homebrew)
brew services start mongodb-community
 
# Ubuntu/Debian
sudo systemctl start mongod
 
# Windows
net start MongoDB
```
 
Or use **MongoDB Atlas** — paste your Atlas connection string into `MONGO_URI`.
 
### Step 4 — Start the backend server
 
```bash
# Development (auto-restart on file changes)
npm run dev
 
# Production
npm start
```
 
You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running on http://localhost:5000
📚 API Docs: http://localhost:5000/api/docs
🌍 Environment: development
```
 
---
 
## Frontend Setup
 
### Step 1 — Install dependencies
 
```bash
cd frontend
npm install
```
 
### Step 2 — Configure environment
 
```bash
cp .env.example .env
```
 
The defaults work if your backend runs on port 5000:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```
 
### Step 3 — Start the dev server
 
```bash
npm run dev
```
 
Open **http://localhost:5173** in your browser.
 
### Step 4 — Build for production
 
```bash
npm run build
# Output in dist/
npm run preview   # Preview the production build locally
```
 
---
 
## Running with Docker
 
Create a `docker-compose.yml` in the root `project/` folder:
 
```yaml
version: '3.9'
 
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
 
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGO_URI: mongodb://mongo:27017/project_management
      JWT_ACCESS_SECRET: change_me
      JWT_REFRESH_SECRET: change_me_too
      CLIENT_URL: http://localhost:5173
    depends_on:
      - mongo
 
  frontend:
    build: ./frontend
    ports:
      - "5173:80"
    depends_on:
      - backend
 
volumes:
  mongo_data:
```
 
Add a `Dockerfile` to the backend:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/server.js"]
```
 
Add a `Dockerfile` to the frontend:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
 
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```
 
Then run:
```bash
docker-compose up --build
```
 
---
 
## API Documentation
 
Once the backend is running, open:
 
**http://localhost:5000/api/docs**
 
This is an interactive Swagger UI where you can explore and test all endpoints.
 
### Quick API reference
 
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | — |
| POST | `/api/auth/login` | Login | — |
| POST | `/api/auth/refresh` | Refresh token | — |
| POST | `/api/auth/logout` | Logout | ✓ |
| GET | `/api/auth/me` | Current user | ✓ |
| GET | `/api/projects` | List projects | ✓ |
| POST | `/api/projects` | Create project | ✓ |
| GET | `/api/projects/:id` | Get project | ✓ member |
| PUT | `/api/projects/:id` | Update project | ✓ admin |
| DELETE | `/api/projects/:id` | Delete project | ✓ owner |
| POST | `/api/projects/:id/invite` | Invite member | ✓ admin |
| GET | `/api/boards/project/:projectId` | Get boards | ✓ member |
| POST | `/api/boards/project/:projectId` | Create board | ✓ member |
| GET | `/api/tasks/board/:boardId` | Get tasks (filters) | ✓ member |
| POST | `/api/tasks/board/:boardId` | Create task | ✓ member |
| PUT | `/api/tasks/:id` | Update task | ✓ member |
| DELETE | `/api/tasks/:id` | Delete task | ✓ member |
| POST | `/api/tasks/board/:boardId/reorder` | Drag-drop reorder | ✓ member |
| GET | `/api/comments/task/:taskId` | Get comments | ✓ member |
| POST | `/api/comments/task/:taskId` | Add comment | ✓ member |
| GET | `/api/users/search?q=` | Search users | ✓ |
 
### Example: Login and create a task
 
```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
 
# 2. Login — copy the accessToken from the response
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
 
# 3. Create a project (replace TOKEN)
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Project","description":"First project"}'
 
# 4. Get boards for the project (replace PROJECT_ID)
curl http://localhost:5000/api/boards/project/PROJECT_ID \
  -H "Authorization: Bearer TOKEN"
 
# 5. Create a task (replace BOARD_ID)
curl -X POST http://localhost:5000/api/tasks/board/BOARD_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Fix login bug","priority":"high","status":"todo"}'
```
 
---
 
## Architecture Decisions
 
### Authentication
- **Short-lived access tokens** (15 min) are kept in memory (Redux store + localStorage for page refresh). They are never stored in cookies so XSS risk is contained.
- **Refresh tokens** (7 days) are stored server-side (user document) and rotated on every use. Max 5 tokens per user. Revoked on logout.
- **Axios interceptor** automatically retries failed requests after refreshing the token — completely transparent to the UI.
 
### Drag-and-drop ordering
- Each task has a numeric `order` field. On drop, the new order is the **midpoint** between the two surrounding tasks (fractional indexing). This means only 1 document is written per drag operation instead of re-numbering all siblings.
- After many inserts the float precision can degrade. A background job can periodically normalize orders (e.g., 1000, 2000, 3000…).
 
### Role-Based Access Control
- Roles live inside the `project.members` array as `{ user, role }` — not on the user document globally.
- Three levels: `owner` (full control including delete), `admin` (invite, update), `member` (read/write tasks and boards).
- RBAC middleware reads `req.project` set by `requireProjectMember` and checks `req.memberRole`.
 
### Real-time (Socket.io)
- Rooms are named `board:<boardId>`. Users join a room when they open a board and leave on unmount.
- Task mutations in the service layer call `getIO().to(room).emit(event, data)` — no coupling between HTTP and socket layers except through the shared `getIO()` singleton.
 
### Caching strategy
- Redis is optional. If present it can cache: frequently read project members lists (short TTL ~60s), user search results, rate-limit counters.
- The rate limiter (`express-rate-limit`) runs in-memory by default. For multi-instance deployments swap to `rate-limit-redis`.
 
### Background jobs
- `node-cron` fires a daily job at 8:00 AM to find tasks due that day and log them. Wire up Nodemailer to send actual email notifications.
 
### Error handling
- All errors flow through a single `errorHandler` middleware. Mongoose errors (cast, duplicate, validation) are normalized to user-friendly messages. Operational errors use `AppError(message, statusCode)`. Unexpected errors return 500 in production without stack traces.
 
---
 
## Environment Variables
 
### Backend
 
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | `development` or `production` |
| `MONGO_URI` | **Yes** | — | MongoDB connection string |
| `JWT_ACCESS_SECRET` | **Yes** | — | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | — | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRE` | No | 15m | Access token TTL |
| `JWT_REFRESH_EXPIRE` | No | 7d | Refresh token TTL |
| `REDIS_URL` | No | — | Redis connection (optional) |
| `SMTP_HOST` | No | — | Email host (for notifications) |
| `SMTP_PORT` | No | — | Email port |
| `SMTP_USER` | No | — | Email username |
| `SMTP_PASS` | No | — | Email password |
| `CLIENT_URL` | No | http://localhost:5173 | Frontend URL for CORS |
 
### Frontend
 
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | /api | Backend API base URL |
| `VITE_SOCKET_URL` | (empty) | Socket.io server URL |
 
---
 
## Common Issues
 
**MongoDB connection refused**
```
Make sure MongoDB is running: sudo systemctl start mongod
Or update MONGO_URI to your Atlas cluster string.
```
 
**CORS errors in browser**
```
Set CLIENT_URL in backend .env to exactly match your frontend origin
including the port: http://localhost:5173
```
 
**Token expired immediately**
```
Check that your server clock is correct. JWT uses Unix timestamps.
Run: date (should show current time)
```
 
**Drag and drop not working**
```
@dnd-kit requires a PointerSensor. Make sure you're using a mouse or
touch device. The activationConstraint distance:5 prevents accidental
drags on click.
```
 
---
 
## Scripts Reference
 
### Backend
| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start with nodemon (auto-restart) |
| Production | `npm start` | Start without nodemon |
| Test | `npm test` | Run Jest test suite |
 
### Frontend
| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Vite dev server with HMR |
| Build | `npm run build` | Production build to `dist/` |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | ESLint check |
