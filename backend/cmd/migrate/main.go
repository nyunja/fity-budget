package main

import (
	"log"

	"github.com/nyunja/fity-budget-backend/internal/config"
	"github.com/nyunja/fity-budget-backend/internal/models"
)

func main() {
	log.Println("=== Starting Database Migration ===")

	// Load configuration
	cfg := config.Load()
	log.Println("✓ Configuration loaded")

	// Connect to database
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	log.Println("✓ Database connected")

	// Enable UUID extension for PostgreSQL
	log.Println("\nEnabling UUID extension...")
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		log.Printf("Warning: Could not create uuid-ossp extension: %v", err)
	}
	log.Println("✓ UUID extension enabled")

	// Run migrations
	log.Println("\nRunning auto-migrations...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Wallet{},
		&models.Transaction{},
		&models.SavingGoal{},
		&models.Budget{},
	)

	if err != nil {
		log.Fatalf("❌ Migration failed: %v", err)
	}

	log.Println("\n✅ All migrations completed successfully!")
	log.Println("\nTables created:")
	log.Println("  - users")
	log.Println("  - wallets")
	log.Println("  - transactions")
	log.Println("  - saving_goals")
	log.Println("  - budgets")
}
