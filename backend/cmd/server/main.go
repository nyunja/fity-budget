package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nyunja/fity-budget-backend/internal/api/handlers"
	"github.com/nyunja/fity-budget-backend/internal/api/routes"
	"github.com/nyunja/fity-budget-backend/internal/config"
	"github.com/nyunja/fity-budget-backend/internal/repository"
	"github.com/nyunja/fity-budget-backend/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()
	log.Println("Configuration loaded successfully")

	// Connect to database
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
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

	authService := services.NewAuthService(userRepo, cfg.JWT.Secret, jwtExpiry)
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

	// Start server
	addr := ":" + cfg.Server.Port
	log.Printf("🚀 FityBudget API server starting on port %s", cfg.Server.Port)
	log.Printf("📊 Environment: %s", cfg.Server.Env)
	log.Printf("🔗 API URL: http://localhost:%s/api/v1", cfg.Server.Port)
	log.Printf("💚 Health Check: http://localhost:%s/health", cfg.Server.Port)

	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
