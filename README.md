# FityBudget

A comprehensive personal finance management application built with Go backend and React frontend, designed to help users track expenses, manage budgets, set savings goals, and gain AI-powered financial insights.

## Overview

FityBudget is a full-stack financial management platform that enables users to:
- Track income and expenses across multiple wallets
- Set and monitor savings goals with progress tracking
- Create and manage budgets with alerts and rollover options
- Visualize spending patterns with analytics and charts
- Receive AI-powered financial insights and recommendations
- Manage multiple payment methods (Mobile Money, Bank, Cash, Credit)

## Tech Stack

### Backend
- **Language**: Go 1.21+
- **Web Framework**: Gin (HTTP web framework)
- **Database**: PostgreSQL 15+
- **ORM**: GORM (Go Object-Relational Mapping)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: go-playground/validator

### Frontend
- **Framework**: React 19.2
- **Language**: TypeScript
- **Build Tool**: Vite 6.2
- **UI Library**: Lucide React (icons)
- **Charts**: Recharts 3.5
- **AI Integration**: Google Generative AI (Gemini)

### Database
- **PostgreSQL 15+** with UUID primary keys
- GORM for migrations and ORM operations
- Soft deletes for data recovery
- Comprehensive indexing for performance

## Architecture

The backend follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────────────────────────┐
│                         HTTP Layer                          │
│                  (Handlers/Controllers)                     │
├─────────────────────────────────────────────────────────────┤
│                      Middleware Layer                       │
│            (Auth, CORS, Logging, Validation)               │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                          │
│                    (Business Logic)                         │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                         │
│                  (Database Operations)                      │
├─────────────────────────────────────────────────────────────┤
│                       Data Layer                            │
│                   (Models/Entities)                         │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
fity-budget/
├── backend/                      # Go backend application
│   ├── cmd/
│   │   ├── server/              # Main server entry point
│   │   └── migrate/             # Database migration utility
│   ├── internal/
│   │   ├── api/
│   │   │   ├── handlers/        # HTTP request handlers
│   │   │   ├── middleware/      # HTTP middleware (auth, CORS, logging)
│   │   │   └── routes/          # Route definitions
│   │   ├── models/              # Database models (GORM)
│   │   ├── repository/          # Data access layer
│   │   ├── services/            # Business logic layer
│   │   ├── config/              # Configuration management
│   │   └── utils/               # Utilities (JWT, response, validation)
│   ├── migrations/              # Database migration files
│   ├── tests/
│   │   ├── unit/                # Unit tests (75 test cases)
│   │   └── integration/         # Integration tests (42 test cases)
│   ├── go.mod
│   └── go.sum
├── frontend/                     # React frontend application
│   ├── components/              # React components
│   ├── contexts/                # React contexts (auth, theme)
│   ├── hooks/                   # Custom React hooks
│   ├── services/                # API service clients
│   ├── utils/                   # Utility functions
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # Application entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── constants.ts             # Application constants
│   ├── package.json
│   └── vite.config.ts
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md          # Architecture overview
│   ├── DATABASE_SCHEMA.md       # Database schema details
│   ├── API_ENDPOINTS.md         # API documentation
│   ├── SETUP_GUIDE.md           # Development setup guide
│   └── TEST_SUMMARY.md          # Test coverage summary
└── README.md                     # This file
```

## Features

### Core Features
- **User Authentication**: Secure registration and login with JWT tokens
- **Transaction Management**: Create, read, update, delete transactions with categorization
- **Budget Tracking**: Set category budgets with alerts and spending visualization
- **Savings Goals**: Track progress toward financial goals with deadlines and priorities
- **Wallet Management**: Multiple wallet support (Mobile Money, Bank, Cash, Credit)
- **Analytics Dashboard**: Real-time financial statistics and insights
- **AI Insights**: Gemini-powered financial recommendations

### Security Features
- JWT-based authentication
- Bcrypt password hashing (cost factor 12)
- CORS protection
- Input validation and sanitization
- Row-level security via user_id checks
- Soft deletes for data recovery

## Getting Started

### Prerequisites

- **Go** 1.21 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 15 or higher
- **Git**

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fity-budget.git
   cd fity-budget
   ```

2. **Set up the backend**
   ```bash
   cd backend

   # Install dependencies
   go mod tidy

   # Create .env file
   cp .env.example .env
   # Edit .env with your database credentials

   # Run migrations
   go run cmd/migrate/main.go

   # Start the server
   go run cmd/server/main.go
   ```
   Backend will start on `http://localhost:8080`

3. **Set up the frontend**
   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Create .env file
   cp .env.example .env.local
   # Edit .env.local with your API URL and Gemini API key

   # Start the development server
   npm run dev
   ```
   Frontend will start on `http://localhost:5173`

4. **Set up the database**
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE fity_budget;
   \q
   ```

For detailed setup instructions, see [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)

## API Documentation

The API provides RESTful endpoints for all features. See [API_ENDPOINTS.md](docs/API_ENDPOINTS.md) for complete documentation.

### Base URL
- Development: `http://localhost:8080/api/v1`
- Production: `https://api.fitybudget.com/api/v1`

### Key Endpoints

**Authentication**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `POST /auth/onboarding` - Complete onboarding

**Transactions**
- `GET /transactions` - List transactions (paginated)
- `POST /transactions` - Create transaction
- `GET /transactions/:id` - Get transaction
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction
- `GET /transactions/stats` - Get transaction statistics

**Savings Goals**
- `GET /goals` - List goals
- `POST /goals` - Create goal
- `GET /goals/:id` - Get goal
- `PUT /goals/:id` - Update goal
- `PATCH /goals/:id/progress` - Update goal progress
- `DELETE /goals/:id` - Delete goal

**Budgets**
- `GET /budgets` - List budgets
- `POST /budgets` - Create budget
- `GET /budgets/:id` - Get budget
- `PUT /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget
- `GET /budgets/summary` - Get budget summary

**Wallets**
- `GET /wallets` - List wallets
- `POST /wallets` - Create wallet
- `GET /wallets/:id` - Get wallet
- `PUT /wallets/:id` - Update wallet
- `DELETE /wallets/:id` - Delete wallet

**Analytics**
- `GET /analytics/dashboard` - Get dashboard stats
- `GET /analytics/money-flow` - Get income/expense flow
- `GET /analytics/spending` - Get spending analysis
- `GET /analytics/insights` - Get AI insights

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User accounts and authentication
- **transactions** - Financial transactions
- **saving_goals** - Savings goals with progress tracking
- **budgets** - Budget limits and alerts
- **wallets** - Payment methods and accounts

See [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for detailed schema information.

## Testing

### Test Coverage
- **Unit Tests**: 75 test cases covering all handlers
- **Integration Tests**: 42 test cases covering full request/response cycles
- **Total Coverage**: 100% of API endpoints

### Running Tests

```bash
# Backend unit tests
cd backend
go test ./tests/unit/... -v

# Backend integration tests
go test ./tests/integration/... -v

# Run with coverage
go test ./... -cover

# Run specific tests
go test -run TestAuthHandler ./tests/unit/handlers/... -v
```

### Test Results
```
✅ Auth Handler: 15 tests passing
✅ Transaction Handler: 26 tests passing
✅ Goals Handler: 18 tests passing
✅ Budgets Handler: 4 tests passing
✅ Wallets Handler: 4 tests passing
✅ Analytics Handler: 8 tests passing
```

See [TEST_SUMMARY.md](docs/TEST_SUMMARY.md) for detailed test information.

## Development

### Backend Development
```bash
cd backend

# Run server with hot reload (if air is installed)
air

# Format code
go fmt ./...

# Lint code (if golangci-lint is installed)
golangci-lint run

# Run tests
go test ./... -v
```

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

## Environment Variables

### Backend (.env)
```env
PORT=8080
ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=fity_budget
DB_SSLMODE=disable

JWT_SECRET=your-secret-key
JWT_EXPIRY=15m

CORS_ORIGINS=http://localhost:5173,http://localhost:3000

GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Deployment

### Backend Deployment
1. Build the binary: `go build -o server cmd/server/main.go`
2. Set production environment variables
3. Run migrations: `./server migrate`
4. Start the server: `./server`

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Serve the `dist/` directory with a web server (Nginx, Caddy, etc.)
3. Configure environment variables for production API URL

### Production Checklist
- [ ] Change JWT secret to a strong random value
- [ ] Set `ENV=production` in backend
- [ ] Enable SSL/TLS for database connections
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Configure rate limiting
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure reverse proxy (Nginx/Caddy)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Go best practices and clean architecture principles
- Write tests for all new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Gin](https://gin-gonic.com/) - HTTP web framework
- [GORM](https://gorm.io/) - ORM library
- [React](https://react.dev/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Recharts](https://recharts.org/) - Charting library
- [Google Gemini](https://ai.google.dev/) - AI insights

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the setup guide for troubleshooting

## Roadmap

### Future Enhancements
- [ ] Mobile applications (iOS/Android)
- [ ] Recurring transactions
- [ ] Multi-currency support with conversion
- [ ] Bill reminders and notifications
- [ ] Family/shared budgets
- [ ] Export data (CSV, PDF)
- [ ] Bank account integration
- [ ] Receipt scanning with OCR
- [ ] Investment tracking
- [ ] Tax reporting
