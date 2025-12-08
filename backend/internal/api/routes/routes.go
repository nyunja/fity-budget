package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/nyunja/fity-budget-backend/internal/api/handlers"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/config"
)

// SetupRoutes configures all API routes with handlers and middleware
func SetupRoutes(
	router *gin.Engine,
	cfg *config.Config,
	authHandler *handlers.AuthHandler,
	transactionHandler *handlers.TransactionHandler,
	goalHandler *handlers.GoalHandler,
	budgetHandler *handlers.BudgetHandler,
	walletHandler *handlers.WalletHandler,
	analyticsHandler *handlers.AnalyticsHandler,
) {
	// Apply global middleware
	router.Use(middleware.CORSMiddleware(cfg.CORS.Origins))
	router.Use(middleware.LoggerMiddleware())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
			"service": "fity-budget-api",
		})
	})

	// API v1 group
	v1 := router.Group("/api/v1")

	// Public routes (no authentication required)
	authRoutes := v1.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}

	// Protected routes (authentication required)
	protected := v1.Group("")
	protected.Use(middleware.AuthMiddleware(cfg.JWT.Secret))
	{
		// Auth/User routes
		auth := protected.Group("/auth")
		{
			auth.GET("/me", authHandler.GetMe)
			auth.PUT("/profile", authHandler.UpdateProfile)
			auth.POST("/onboarding", authHandler.CompleteOnboarding)
		}

		// Transaction routes
		transactions := protected.Group("/transactions")
		{
			transactions.GET("", transactionHandler.ListTransactions)
			transactions.POST("", transactionHandler.CreateTransaction)
			transactions.GET("/stats", transactionHandler.GetTransactionStats)
			transactions.GET("/:id", transactionHandler.GetTransaction)
			transactions.PUT("/:id", transactionHandler.UpdateTransaction)
			transactions.DELETE("/:id", transactionHandler.DeleteTransaction)
		}

		// Goal routes
		goals := protected.Group("/goals")
		{
			goals.GET("", goalHandler.ListGoals)
			goals.POST("", goalHandler.CreateGoal)
			goals.GET("/:id", goalHandler.GetGoal)
			goals.PUT("/:id", goalHandler.UpdateGoal)
			goals.PATCH("/:id/progress", goalHandler.UpdateProgress)
			goals.DELETE("/:id", goalHandler.DeleteGoal)
		}

		// Budget routes
		budgets := protected.Group("/budgets")
		{
			budgets.GET("", budgetHandler.ListBudgets)
			budgets.POST("", budgetHandler.CreateBudget)
			budgets.GET("/summary", budgetHandler.GetBudgetSummary)
			budgets.GET("/:id", budgetHandler.GetBudget)
			budgets.PUT("/:id", budgetHandler.UpdateBudget)
			budgets.DELETE("/:id", budgetHandler.DeleteBudget)
		}

		// Wallet routes
		wallets := protected.Group("/wallets")
		{
			wallets.GET("", walletHandler.ListWallets)
			wallets.POST("", walletHandler.CreateWallet)
			wallets.GET("/:id", walletHandler.GetWallet)
			wallets.PUT("/:id", walletHandler.UpdateWallet)
			wallets.DELETE("/:id", walletHandler.DeleteWallet)
		}

		// Analytics routes
		analytics := protected.Group("/analytics")
		{
			analytics.GET("/dashboard", analyticsHandler.GetDashboardStats)
			analytics.GET("/money-flow", analyticsHandler.GetMoneyFlow)
			analytics.GET("/spending", analyticsHandler.GetSpendingAnalysis)
			analytics.GET("/insights", analyticsHandler.GetInsights)
			analytics.GET("/trends", analyticsHandler.GetTrends)
			analytics.GET("/health", analyticsHandler.GetFinancialHealth)
		}
	}
}
