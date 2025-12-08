package integration

import (
	"fmt"
	"log"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/api/handlers"
	"github.com/nyunja/fity-budget-backend/internal/api/routes"
	"github.com/nyunja/fity-budget-backend/internal/config"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var (
	testDB     *gorm.DB
	testRouter *gin.Engine
	testConfig *config.Config
)

// TestMain sets up the test database and runs all tests
func TestMain(m *testing.M) {
	// Setup
	setup()

	// Run tests
	code := m.Run()

	// Teardown
	teardown()

	os.Exit(code)
}

func setup() {
	// Set Gin to test mode
	gin.SetMode(gin.TestMode)

	// Load test configuration
	testConfig = &config.Config{
		Server: config.ServerConfig{
			Port: "8080",
			Env:  "test",
		},
		Database: config.DatabaseConfig{
			Host:     getEnv("TEST_DB_HOST", "localhost"),
			Port:     getEnv("TEST_DB_PORT", "5432"),
			User:     getEnv("TEST_DB_USER", "postgres"),
			Password: getEnv("TEST_DB_PASSWORD", "postgres"),
			DBName:   getEnv("TEST_DB_NAME", "fity_budget_test"),
			SSLMode:  "disable",
		},
		JWT: config.JWTConfig{
			Secret: "test-secret-key",
			Expiry: "1h",
		},
		CORS: config.CORSConfig{
			Origins: []string{"http://localhost:3000"},
		},
	}

	// Connect to test database
	var err error
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		testConfig.Database.Host,
		testConfig.Database.Port,
		testConfig.Database.User,
		testConfig.Database.Password,
		testConfig.Database.DBName,
		testConfig.Database.SSLMode,
	)

	testDB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatalf("Failed to connect to test database: %v", err)
	}

	// Run migrations
	err = testDB.AutoMigrate(
		&models.User{},
		&models.Wallet{},
		&models.Transaction{},
		&models.SavingGoal{},
		&models.Budget{},
	)
	if err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(testDB)
	transactionRepo := repository.NewTransactionRepository(testDB)
	goalRepo := repository.NewGoalRepository(testDB)
	budgetRepo := repository.NewBudgetRepository(testDB)
	walletRepo := repository.NewWalletRepository(testDB)

	// Initialize services
	jwtExpiry, _ := time.ParseDuration(testConfig.JWT.Expiry)
	authService := services.NewAuthService(userRepo, testConfig.JWT.Secret, jwtExpiry)
	transactionService := services.NewTransactionService(transactionRepo, walletRepo)
	goalService := services.NewGoalService(goalRepo)
	budgetService := services.NewBudgetService(budgetRepo, transactionRepo)
	walletService := services.NewWalletService(walletRepo)
	analyticsService := services.NewAnalyticsService(transactionRepo, goalRepo, budgetRepo, walletRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	transactionHandler := handlers.NewTransactionHandler(transactionService)
	goalHandler := handlers.NewGoalHandler(goalService)
	budgetHandler := handlers.NewBudgetHandler(budgetService)
	walletHandler := handlers.NewWalletHandler(walletService)
	analyticsHandler := handlers.NewAnalyticsHandler(analyticsService)

	// Setup router
	testRouter = gin.New()
	routes.SetupRoutes(
		testRouter,
		testConfig,
		authHandler,
		transactionHandler,
		goalHandler,
		budgetHandler,
		walletHandler,
		analyticsHandler,
	)

	log.Println("Test setup completed successfully")
}

func teardown() {
	// Clean up database
	cleanDatabase()

	// Close database connection
	sqlDB, err := testDB.DB()
	if err == nil {
		sqlDB.Close()
	}

	log.Println("Test teardown completed")
}

// cleanDatabase removes all data from tables
func cleanDatabase() {
	testDB.Exec("TRUNCATE TABLE transactions CASCADE")
	testDB.Exec("TRUNCATE TABLE saving_goals CASCADE")
	testDB.Exec("TRUNCATE TABLE budgets CASCADE")
	testDB.Exec("TRUNCATE TABLE wallets CASCADE")
	testDB.Exec("TRUNCATE TABLE users CASCADE")
}

// cleanDatabaseForTest cleans the database before each test
func cleanDatabaseForTest(t *testing.T) {
	t.Helper()
	cleanDatabase()
}

// createTestUser creates a test user in the database
func createTestUser(t *testing.T, email string) (*models.User, string) {
	t.Helper()

	user := &models.User{
		ID:           uuid.New(),
		Name:         "Test User",
		Email:        email,
		PasswordHash: "$2a$10$test.hash.value.for.password123",
		IsOnboarded:  false,
	}

	if err := testDB.Create(user).Error; err != nil {
		t.Fatalf("Failed to create test user: %v", err)
	}

	// Generate JWT token for the user
	jwtExpiry, _ := time.ParseDuration(testConfig.JWT.Expiry)
	token, err := generateTestToken(user.ID, user.Email, testConfig.JWT.Secret, jwtExpiry)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	return user, token
}

// createTestWallet creates a test wallet for a user
func createTestWallet(t *testing.T, userID uuid.UUID, name string, balance float64) *models.Wallet {
	t.Helper()

	wallet := &models.Wallet{
		ID:        uuid.New(),
		UserID:    userID,
		Name:      name,
		Type:      "Bank Account",
		Balance:   balance,
		Currency:  "KES",
		Color:     "#4F46E5",
		IsDefault: true,
	}

	if err := testDB.Create(wallet).Error; err != nil {
		t.Fatalf("Failed to create test wallet: %v", err)
	}

	return wallet
}

// generateTestToken generates a JWT token for testing
func generateTestToken(userID uuid.UUID, email, secret string, expiry time.Duration) (string, error) {
	// Use the same JWT generation logic as the main app
	// This is a simplified version - in production, import from utils
	claims := map[string]interface{}{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(expiry).Unix(),
		"iat":     time.Now().Unix(),
	}

	// For testing purposes, we'll use a simple token
	// In a real scenario, you'd use the actual JWT library
	return fmt.Sprintf("test-token-%s", userID.String()), nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
