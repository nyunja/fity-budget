package main

import (
	"fmt"
	"log"

	"github.com/nyunja/fity-budget-backend/internal/config"
)

func main() {
	fmt.Println("=== Testing Configuration Loading ===\n")

	// Load configuration
	cfg := config.Load()

	// Display loaded configuration
	fmt.Println("✓ Configuration loaded successfully!")
	fmt.Println("\n--- Server Configuration ---")
	fmt.Printf("Port: %s\n", cfg.Server.Port)
	fmt.Printf("Environment: %s\n", cfg.Server.Env)

	fmt.Println("\n--- Database Configuration ---")
	fmt.Printf("Host: %s\n", cfg.Database.Host)
	fmt.Printf("Port: %s\n", cfg.Database.Port)
	fmt.Printf("User: %s\n", cfg.Database.User)
	fmt.Printf("Database Name: %s\n", cfg.Database.DBName)
	fmt.Printf("SSL Mode: %s\n", cfg.Database.SSLMode)
	fmt.Printf("Password: %s\n", maskPassword(cfg.Database.Password))

	fmt.Println("\n--- JWT Configuration ---")
	fmt.Printf("Secret: %s\n", maskSecret(cfg.JWT.Secret))
	fmt.Printf("Expiry: %s\n", cfg.JWT.Expiry)

	fmt.Println("\n--- CORS Configuration ---")
	fmt.Printf("Allowed Origins: %v\n", cfg.CORS.Origins)

	fmt.Println("\n=== Testing Database Connection ===\n")

	// Test database connection
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("❌ Database connection failed: %v\n", err)
	}

	fmt.Println("✓ Database connection successful!")

	// Get the underlying SQL DB to test connection
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("❌ Failed to get database instance: %v\n", err)
	}

	// Ping database to verify connection
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("❌ Database ping failed: %v\n", err)
	}

	fmt.Println("✓ Database ping successful!")

	// Display database stats
	stats := sqlDB.Stats()
	fmt.Println("\n--- Database Connection Stats ---")
	fmt.Printf("Max Open Connections: %d\n", stats.MaxOpenConnections)
	fmt.Printf("Open Connections: %d\n", stats.OpenConnections)
	fmt.Printf("In Use: %d\n", stats.InUse)
	fmt.Printf("Idle: %d\n", stats.Idle)

	fmt.Println("\n✅ All tests passed successfully!")
}

// maskPassword masks the password for security
func maskPassword(password string) string {
	if len(password) <= 2 {
		return "****"
	}
	return password[:2] + "****"
}

// maskSecret masks the JWT secret for security
func maskSecret(secret string) string {
	if len(secret) <= 4 {
		return "****"
	}
	return secret[:4] + "****" + secret[len(secret)-4:]
}
