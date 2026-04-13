# Government Tender Monitoring System

South African government tender monitoring, verification and anti-corruption platform.

## Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | HTML5 · CSS3 · Vanilla JS |
| API        | Go 1.23 + Gin (port 8080) |
| Proxy      | Node.js + http-proxy-middleware (port 3000) |
| Database   | MySQL 8 |
| Auth       | JWT HS256, 7-day expiry |

## Project Structure

```
├── cmd/
│   └── api/main.go           # Entry point
├── internal/                 # Private application code (Go standard layout)
│   ├── config/               # DB pool + JWT secret loader
│   ├── domain/               # Pure business types — no DB, no HTTP
│   ├── repository/           # All SQL queries (UserRepo, TenderRepo, AuditRepo)
│   ├── service/              # Business logic (AuthService, TenderService, BlockchainService)
│   ├── handler/              # Thin Gin HTTP handlers
│   ├── middleware/           # Gin middleware: JWT auth, request logger
│   └── router/               # Dependency wiring + all route registration
├── pkg/
│   └── response/             # Shared HTTP JSON response helpers
├── database/
│   ├── schema.sql            # Table definitions
│   └── seed.sql              # Sample data
├── client/                   # Frontend
│   ├── assets/               # Shared images
│   ├── css/                  # All stylesheets
│   ├── js/                   # Shared + page-specific JS
│   └── pages/
│       ├── admin/            # Admin HTML pages
│       └── user/             # User HTML pages
└── server/
    └── server.js             # Node.js static server + proxy to Go API
```

## API Endpoints

### Auth (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register — returns JWT |
| POST | `/api/auth/login` | Login — returns JWT |

### Tenders
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/tenders` | Public | List (filter: status, category, search) |
| GET | `/api/tenders/:id` | Public | Single tender |
| POST | `/api/tenders` | Government/Admin | Create tender |
| POST | `/api/tenders/:id/apply` | Contractor | Apply for tender |
| GET | `/api/tenders/:id/applications` | Government/Admin | View applications |

### Users
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/users/me` | Authenticated | Own profile |
| GET | `/api/users/me/applications` | Contractor | Own applications |
| GET | `/api/users` | Admin | All users |
| PATCH | `/api/users/:id/status` | Admin | Enable/disable user |

### Blockchain
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/blockchain/audit` | Government/Admin | Audit trail with hashes |
| POST | `/api/blockchain/verify` | Government/Admin | Verify record hash |
| GET | `/api/blockchain/stats` | Government/Admin | System statistics |

## Setup

```bash
# 1. Environment
cp .env.example .env
# Edit .env with your DB credentials and JWT secret

# 2. Database
npm run db:setup    # create tables
npm run db:seed     # load sample data

# 3. Go API  (Terminal 1)
go run ./cmd/api    # → http://localhost:8080

# 4. Node proxy + static  (Terminal 2)
npm install
npm run dev         # → http://localhost:3000
```

## Roles

| Role | Permissions |
|------|-------------|
| `contractor` | Browse tenders, apply, view own applications |
| `investor` | Browse tenders and investment data |
| `government` | Create tenders, view applications, blockchain audit |
| `admin` | Full access including user management |
