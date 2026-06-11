# Scouts Duty Management System

A full-stack, production-grade web application for managing scout registrations, duty assignments, inventory, equipment issue/return, fines, and reporting.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Redux Toolkit, TanStack Query |
| Backend | Node.js 20, Express.js 4, TypeScript, Prisma ORM, JWT Auth |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, BullMQ |
| Infrastructure | Docker, Docker Compose, Nginx |

## Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Node.js 20+ (for local dev tooling only)

### 1. Clone & configure environment

```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/api/.env` and set strong secrets for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

### 2. Start all services

```bash
npm run dev
# OR
docker compose up --build
```

This starts 6 containers: `postgres`, `redis`, `api`, `worker`, `web`, `nginx`.

### 3. Run migrations & seed data

```bash
npm run db:migrate   # Apply Prisma migrations
npm run db:seed      # Seed 50 scouts, 200+ items, 4 users
```

### 4. Access the application

| Service | URL |
|---|---|
| Web App | http://localhost (via Nginx) or http://localhost:3000 |
| API | http://localhost:3001/api/v1 |
| Health | http://localhost:3001/api/health |

### Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@scouts.pk | Admin@1234 |
| Registration Op. | registration@scouts.pk | Operator@1234 |
| Inventory Op. | inventory@scouts.pk | Operator@1234 |
| Viewer | viewer@scouts.pk | Operator@1234 |

## Environment Variables

### apps/api/.env

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://scouts_user:scouts_pass@postgres:5432/scouts_db
REDIS_URL=redis://redis:6379
JWT_ACCESS_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE_MB=2
FINE_PERCENTAGE=5
CORS_ORIGIN=http://localhost:3000
```

### apps/web/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Scouts Duty Management System
NEXT_PUBLIC_PROGRAM_NAME=Annual Scouts Program 2024
```

## Docker Commands

```bash
# Development
npm run dev              # Start all services (hot reload)
npm run dev:down         # Stop all services
npm run dev:logs         # Stream all logs
npm run logs:api         # Stream API logs only
npm run logs:web         # Stream web logs only

# Database
npm run db:migrate       # Apply migrations
npm run db:seed          # Seed test data
npm run db:studio        # Open Prisma Studio (web DB browser)
npm run db:reset         # Reset DB and re-apply migrations

# Shell access
npm run shell:api        # Shell into API container
npm run shell:db         # psql into PostgreSQL

# Production
npm run prod             # Start production build
npm run prod:down        # Stop production services
```

## Project Structure

```
scouts-duty-system/
├── apps/
│   ├── web/               # Next.js 14 frontend
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Reusable components
│   │   └── lib/           # Store, API hooks, utilities
│   └── api/               # Express backend
│       ├── src/modules/   # Feature modules (router/controller/service/repository)
│       ├── src/middleware/ # Auth, error handling, rate limiting
│       └── prisma/        # Schema + migrations + seed
├── packages/
│   └── shared/            # Shared Zod schemas + TypeScript types
├── docker/                # Nginx, Redis, Postgres configs
├── docker-compose.yml     # Development stack
└── docker-compose.prod.yml # Production overrides
```

## Module Overview

| Module | API Prefix | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Login, refresh token, logout |
| Scouts | `/api/v1/scouts` | Registration, search, profiles |
| Duties | `/api/v1/duties` | Departments, assignments |
| Inventory | `/api/v1/inventory` | Items, categories, cabin/shelf management |
| Issue | `/api/v1/issue` | Equipment issuance + guarantors |
| Returns | `/api/v1/returns` | Return processing |
| Fines | `/api/v1/fines` | Fine management + payment |
| Exchange | `/api/v1/exchange` | Item replacement tracking |
| Reports | `/api/v1/reports` | 13 report types + Excel export |
| Settings | `/api/v1/settings` | System configuration |
| Users | `/api/v1/users` | User management (Admin only) |

## Role-Based Access

| Role | Permissions |
|---|---|
| ADMIN | Full access — users, settings, all reports, waive fines |
| OPERATOR_REGISTRATION | Scout registration, duty assignment, ID card |
| OPERATOR_INVENTORY | Inventory CRUD, issue/return/exchange |
| VIEWER | Read-only reports and dashboards |

## Production Deployment

```bash
# Generate SSL certs and place in docker/nginx/certs/
# Then:
npm run prod

# Run migrations against prod DB
npm run db:migrate
```

Production differences:
- Nginx serves on ports 80 + 443 (SSL)
- Database and Redis ports NOT exposed externally
- Multi-stage Docker builds (minimal production images)
- `restart: always` on all containers
