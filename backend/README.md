# FityBudget Backend

A modern personal finance management API built with Go, Gin, and PostgreSQL.

## Features

✅ **Complete REST API** with JWT authentication
✅ **Interactive API Documentation** with Swagger/OpenAPI
✅ **Transaction Management** - Track income and expenses
✅ **Budget Tracking** - Set and monitor spending limits
✅ **Savings Goals** - Create and track financial goals
✅ **Wallet Management** - Manage multiple payment methods
✅ **Analytics & Insights** - Comprehensive financial analytics
✅ **Comprehensive Testing** - Unit and integration tests

---

## Quick Start

### Prerequisites

- Go 1.23 or higher
- PostgreSQL 15+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fity-budget-backend.git
   cd fity-budget-backend/backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Create database**
   ```bash
   createdb fity_budget
   ```

5. **Run the server**
   ```bash
   go run cmd/server/main.go
   ```

The server will start on `http://localhost:8080`

---

## API Documentation

### Swagger UI (Interactive)

Once the server is running, access the interactive API documentation:

```
http://localhost:8080/swagger/index.html
```

Features:
- 📖 Complete API reference
- 🧪 Test endpoints directly in browser
- 🔐 JWT authentication support
- 📝 Request/response examples
- 📊 Schema documentation

### Regenerating Swagger Docs

After modifying API endpoints:

```bash
# Install swag CLI (first time only)
go install github.com/swaggo/swag/cmd/swag@latest

# Generate documentation
swag init -g cmd/server/main.go -o docs
```

---

## Project Structure

```
backend/
├── cmd/
│   ├── server/          # Main application entry point
│   ├── migrate/         # Database migration utility
│   └── ...
├── internal/
│   ├── api/
│   │   ├── handlers/    # HTTP request handlers
│   │   ├── middleware/  # Auth, CORS, logging
│   │   └── routes/      # Route definitions
│   ├── config/          # Configuration management
│   ├── models/          # Database models (GORM)
│   ├── repository/      # Data access layer
│   ├── services/        # Business logic
│   └── utils/           # Utilities (JWT, responses)
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── docs/               # Swagger documentation (auto-generated)
├── go.mod
└── go.sum
```

---

## Environment Variables

Create a `.env` file with the following:

```env
# Server
PORT=8080
ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=fity_budget
DB_SSLMODE=disable

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=15m

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Running Tests

### Unit Tests
```bash
go test ./tests/unit/... -v
```

### Integration Tests

1. Create test database:
   ```bash
   createdb fity_budget_test
   ```

2. Run integration tests:
   ```bash
   go test ./tests/integration/... -v
   ```

### Test Coverage
```bash
go test ./... -cover
```

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/onboarding` - Complete onboarding

### Transactions
- `GET /api/v1/transactions` - List transactions (paginated)
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/:id` - Get transaction
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction
- `GET /api/v1/transactions/stats` - Get statistics

### Savings Goals
- `GET /api/v1/goals` - List goals
- `POST /api/v1/goals` - Create goal
- `GET /api/v1/goals/:id` - Get goal
- `PUT /api/v1/goals/:id` - Update goal
- `DELETE /api/v1/goals/:id` - Delete goal
- `PATCH /api/v1/goals/:id/progress` - Update progress

### Budgets
- `GET /api/v1/budgets` - List budgets
- `POST /api/v1/budgets` - Create budget
- `GET /api/v1/budgets/:id` - Get budget
- `PUT /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget
- `GET /api/v1/budgets/summary` - Get summary

### Wallets
- `GET /api/v1/wallets` - List wallets
- `POST /api/v1/wallets` - Create wallet
- `GET /api/v1/wallets/:id` - Get wallet
- `PUT /api/v1/wallets/:id` - Update wallet
- `DELETE /api/v1/wallets/:id` - Delete wallet

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard stats
- `GET /api/v1/analytics/money-flow` - Money flow
- `GET /api/v1/analytics/spending` - Spending analysis
- `GET /api/v1/analytics/insights` - Insights
- `GET /api/v1/analytics/trends` - Trends
- `GET /api/v1/analytics/health` - Financial health

For detailed endpoint documentation, see the Swagger UI.

---

## Building for Production

```bash
# Build binary
go build -o server cmd/server/main.go

# Run binary
./server
```

---

## Database Migrations

Migrations run automatically on server startup using GORM AutoMigrate.

To run migrations manually:

```bash
go run cmd/migrate/main.go
```

---

## Technology Stack

- **Language**: Go 1.23
- **Web Framework**: Gin v1.11.0
- **ORM**: GORM v1.31.1
- **Database**: PostgreSQL 15+
- **Authentication**: JWT (golang-jwt/jwt v5.3.0)
- **Encryption**: bcrypt
- **Documentation**: Swagger/OpenAPI (swaggo)
- **Testing**: Go testing + testify

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see LICENSE file for details

---

## Support

- 📚 [API Documentation](../docs/API_DOCUMENTATION.md)
- 🏗️ [Architecture](../docs/ARCHITECTURE.md)
- 💾 [Database Schema](../docs/DATABASE_SCHEMA.md)
- 📊 [Project Status](../docs/PROJECT_STATUS.md)

---

**Built with ❤️ using Go and PostgreSQL**
