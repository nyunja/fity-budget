package main

import (
	"fmt"
	"log"

	"github.com/nyunja/fity-budget-backend/internal/config"
)

func main() {
	fmt.Println("=== Verifying Database Tables ===")

	// Load configuration
	cfg := config.Load()

	// Connect to database
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}

	// Get list of tables
	var tables []string
	query := `
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = 'public'
		AND table_type = 'BASE TABLE'
		ORDER BY table_name;
	`

	if err := db.Raw(query).Scan(&tables).Error; err != nil {
		log.Fatalf("❌ Failed to fetch tables: %v", err)
	}

	fmt.Printf("Found %d tables:\n\n", len(tables))
	for i, table := range tables {
		fmt.Printf("%d. %s\n", i+1, table)

		// Get column count for each table
		var columnCount int64
		columnQuery := `
			SELECT COUNT(*)
			FROM information_schema.columns
			WHERE table_schema = 'public'
			AND table_name = ?
		`
		db.Raw(columnQuery, table).Scan(&columnCount)
		fmt.Printf("   Columns: %d\n", columnCount)

		// Get row count
		var rowCount int64
		db.Table(table).Count(&rowCount)
		fmt.Printf("   Rows: %d\n\n", rowCount)
	}

	// Verify specific tables
	expectedTables := []string{"users", "wallets", "transactions", "saving_goals", "budgets"}
	fmt.Println("=== Verification Results ===")

	allFound := true
	for _, expected := range expectedTables {
		found := false
		for _, actual := range tables {
			if actual == expected {
				found = true
				break
			}
		}
		if found {
			fmt.Printf("✓ %s\n", expected)
		} else {
			fmt.Printf("✗ %s (MISSING)\n", expected)
			allFound = false
		}
	}

	fmt.Println()
	if allFound {
		fmt.Println("✅ All required tables exist!")
	} else {
		fmt.Println("❌ Some tables are missing!")
	}
}
