package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nyunja/fity-budget-backend/internal/api/handlers"
	"github.com/nyunja/fity-budget-backend/internal/api/routes"
	"github.com/nyunja/fity-budget-backend/internal/config"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"gorm.io/gorm"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/nyunja/fity-budget-backend/docs" // Swagger docs
)

// @title FityBudget API
// @version 1.0
// @description Personal Finance Management API - Track expenses, manage budgets, and achieve savings goals
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.email support@fitybudget.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

func main() {
	// Load configuration
	cfg := config.Load()
	log.Println("Configuration loaded successfully")

	// Connect to database
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run auto-migrations on startup
	log.Println("Running database migrations...")
	if err := runMigrations(db); err != nil {
		log.Printf("Warning: Migration failed: %v", err)
	} else {
		log.Println("✓ Database migrations completed successfully")
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	transactionRepo := repository.NewTransactionRepository(db)
	goalRepo := repository.NewGoalRepository(db)
	budgetRepo := repository.NewBudgetRepository(db)
	walletRepo := repository.NewWalletRepository(db)
	log.Println("Repositories initialized")

	// Initialize services
	jwtExpiry, err := time.ParseDuration(cfg.JWT.Expiry)
	if err != nil {
		log.Printf("Invalid JWT expiry duration, using default 15m: %v", err)
		jwtExpiry = 15 * time.Minute
	}

	authService := services.NewAuthService(userRepo, walletRepo, cfg.JWT.Secret, jwtExpiry)
	transactionService := services.NewTransactionService(transactionRepo, walletRepo)
	goalService := services.NewGoalService(goalRepo)
	budgetService := services.NewBudgetService(budgetRepo, transactionRepo)
	walletService := services.NewWalletService(walletRepo)
	analyticsService := services.NewAnalyticsService(transactionRepo, walletRepo, budgetRepo, goalRepo)
	log.Println("Services initialized")

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	goalHandler := handlers.NewGoalHandler(goalService)
	budgetHandler := handlers.NewBudgetHandler(budgetService)
	walletHandler := handlers.NewWalletHandler(walletService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)
	log.Println("Handlers initialized")

	// Setup Gin engine
	if cfg.Server.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.Default()

	// Setup routes
	routes.SetupRoutes(
		router,
		cfg,
		authHandler,
		transactionHandler,
		goalHandler,
		budgetHandler,
		walletHandler,
		analyticsHandler,
	)
	log.Println("Routes configured")

	// Setup Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	log.Println("Swagger documentation enabled at /swagger/index.html")

	// Start server
	addr := ":" + cfg.Server.Port
	log.Printf("🚀 FityBudget API server starting on port %s", cfg.Server.Port)
	log.Printf("📊 Environment: %s", cfg.Server.Env)
	log.Printf("🔗 API URL: http://localhost:%s/api/v1", cfg.Server.Port)
	log.Printf("💚 Health Check: http://localhost:%s/health", cfg.Server.Port)
	log.Printf("📚 API Docs: http://localhost:%s/swagger/index.html", cfg.Server.Port)

	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// runMigrations runs database migrations on startup
func runMigrations(db *gorm.DB) error {
	log.Println("Enabling UUID extension...")
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		log.Printf("Warning: Could not create uuid-ossp extension: %v", err)
	}

	log.Println("Running auto-migrations for all models...")
	return db.AutoMigrate(
		&models.User{},
		&models.Wallet{},
		&models.Transaction{},
		&models.SavingGoal{},
		&models.Budget{},
	)
}
