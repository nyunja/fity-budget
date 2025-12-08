package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/nyunja/fity-budget-backend/internal/models"
)

func TestTransactionIntegration_CreateTransaction(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user and wallet
	user, token := createTestUser(t, "trans@example.com")
	wallet := createTestWallet(t, user.ID, "Main Wallet", 10000.00)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful expense transaction creation",
			requestBody: map[string]interface{}{
				"type":        "expense",
				"amount":      500.00,
				"category":    "Food & Groceries",
				"description": "Weekly groceries",
				"wallet_id":   wallet.ID.String(),
				"date":        time.Now().Format(time.RFC3339),
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify transaction was created in database
				var transaction models.Transaction
				if err := testDB.Where("user_id = ?", user.ID).First(&transaction).Error; err != nil {
					t.Errorf("Transaction not found in database: %v", err)
				}
				if transaction.Amount != 500.00 {
					t.Errorf("Expected amount 500.00, got %f", transaction.Amount)
				}

				// Verify wallet balance was updated
				var updatedWallet models.Wallet
				testDB.First(&updatedWallet, wallet.ID)
				expectedBalance := 10000.00 - 500.00
				if updatedWallet.Balance != expectedBalance {
					t.Errorf("Expected wallet balance %f, got %f", expectedBalance, updatedWallet.Balance)
				}
			},
		},
		{
			name: "successful income transaction creation",
			requestBody: map[string]interface{}{
				"type":        "income",
				"amount":      3000.00,
				"category":    "Salary",
				"description": "Monthly salary",
				"wallet_id":   wallet.ID.String(),
				"date":        time.Now().Format(time.RFC3339),
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify wallet balance increased
				var updatedWallet models.Wallet
				testDB.First(&updatedWallet, wallet.ID)
				if updatedWallet.Balance <= 10000.00 {
					t.Error("Expected wallet balance to increase")
				}
			},
		},
		{
			name: "create transaction with invalid amount",
			requestBody: map[string]interface{}{
				"type":        "expense",
				"amount":      -100.00,
				"category":    "Food",
				"description": "Invalid amount",
				"wallet_id":   wallet.ID.String(),
				"date":        time.Now().Format(time.RFC3339),
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "create transaction with missing required fields",
			requestBody: map[string]interface{}{
				"type":   "expense",
				"amount": 100.00,
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Prepare request
			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/api/v1/transactions", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+token)

			// Execute request
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			// Check status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			// Parse response
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			// Run additional checks
			tt.checkResponse(t, response)
		})
	}
}

func TestTransactionIntegration_ListTransactions(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user and wallet
	user, token := createTestUser(t, "list@example.com")
	wallet := createTestWallet(t, user.ID, "Main Wallet", 10000.00)

	// Create some test transactions
	transactions := []models.Transaction{
		{
			UserID:          user.ID,
			WalletID:        &wallet.ID,
			Amount:          500.00,
			Name:            "Groceries",
			Method:          "Cash",
			Category:        "Food",
			Notes:           "Weekly groceries",
			TransactionDate: time.Now(),
		},
		{
			UserID:          user.ID,
			WalletID:        &wallet.ID,
			Amount:          3000.00,
			Name:            "Monthly salary",
			Method:          "Bank Transfer",
			Category:        "Salary",
			Notes:           "Monthly salary",
			TransactionDate: time.Now(),
		},
		{
			UserID:          user.ID,
			WalletID:        &wallet.ID,
			Amount:          200.00,
			Name:            "Uber ride",
			Method:          "Credit Card",
			Category:        "Transport",
			Notes:           "Uber",
			TransactionDate: time.Now(),
		},
	}

	for _, trans := range transactions {
		testDB.Create(&trans)
	}

	tests := []struct {
		name           string
		queryParams    string
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:           "list all transactions",
			queryParams:    "",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				transactionsList := data["transactions"].([]interface{})
				if len(transactionsList) != 3 {
					t.Errorf("Expected 3 transactions, got %d", len(transactionsList))
				}
			},
		},
		{
			name:           "list transactions with pagination",
			queryParams:    "?page=1&limit=2",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				transactionsList := data["transactions"].([]interface{})
				if len(transactionsList) > 2 {
					t.Errorf("Expected at most 2 transactions, got %d", len(transactionsList))
				}
			},
		},
		{
			name:           "list transactions filtered by type",
			queryParams:    "?type=expense",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				transactionsList := data["transactions"].([]interface{})
				// Should only get expense transactions
				for _, trans := range transactionsList {
					transData := trans.(map[string]interface{})
					if transData["type"] != "expense" {
						t.Error("Expected only expense transactions")
					}
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Prepare request
			req, _ := http.NewRequest("GET", "/api/v1/transactions"+tt.queryParams, nil)
			req.Header.Set("Authorization", "Bearer "+token)

			// Execute request
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			// Check status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			// Parse response
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			// Run additional checks
			tt.checkResponse(t, response)
		})
	}
}

func TestTransactionIntegration_GetTransaction(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user and wallet
	user, token := createTestUser(t, "get@example.com")
	wallet := createTestWallet(t, user.ID, "Main Wallet", 10000.00)

	// Create a test transaction
	transaction := models.Transaction{
		UserID:          user.ID,
		WalletID:        &wallet.ID,
		Amount:          500.00,
		Name:            "Test transaction",
		Method:          "Cash",
		Category:        "Food",
		Notes:           "Test transaction",
		TransactionDate: time.Now(),
	}
	testDB.Create(&transaction)

	tests := []struct {
		name           string
		transactionID  string
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:           "get existing transaction",
			transactionID:  transaction.ID.String(),
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				transData := data["transaction"].(map[string]interface{})
				if transData["amount"].(float64) != 500.00 {
					t.Errorf("Expected amount 500.00, got %f", transData["amount"])
				}
			},
		},
		{
			name:           "get non-existent transaction",
			transactionID:  "00000000-0000-0000-0000-000000000000",
			expectedStatus: http.StatusNotFound,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name:           "get transaction with invalid ID",
			transactionID:  "invalid-id",
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Prepare request
			url := fmt.Sprintf("/api/v1/transactions/%s", tt.transactionID)
			req, _ := http.NewRequest("GET", url, nil)
			req.Header.Set("Authorization", "Bearer "+token)

			// Execute request
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			// Check status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			// Parse response
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			// Run additional checks
			tt.checkResponse(t, response)
		})
	}
}

func TestTransactionIntegration_UpdateTransaction(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user and wallet
	user, token := createTestUser(t, "update@example.com")
	wallet := createTestWallet(t, user.ID, "Main Wallet", 10000.00)

	// Create a test transaction
	transaction := models.Transaction{
		UserID:          user.ID,
		WalletID:        &wallet.ID,
		Amount:          500.00,
		Name:            "Original transaction",
		Method:          "Cash",
		Category:        "Food",
		Notes:           "Original description",
		TransactionDate: time.Now(),
	}
	testDB.Create(&transaction)

	tests := []struct {
		name           string
		transactionID  string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:          "successful transaction update",
			transactionID: transaction.ID.String(),
			requestBody: map[string]interface{}{
				"description": "Updated description",
				"amount":      600.00,
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify transaction was updated in database
				var updatedTransaction models.Transaction
				testDB.First(&updatedTransaction, transaction.ID)
				if updatedTransaction.Notes != "Updated description" {
					t.Errorf("Expected notes 'Updated description', got '%s'", updatedTransaction.Notes)
				}
				if updatedTransaction.Amount != 600.00 {
					t.Errorf("Expected amount 600.00, got %f", updatedTransaction.Amount)
				}
			},
		},
		{
			name:          "update non-existent transaction",
			transactionID: "00000000-0000-0000-0000-000000000000",
			requestBody: map[string]interface{}{
				"description": "Should fail",
			},
			expectedStatus: http.StatusNotFound,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Prepare request
			jsonBody, _ := json.Marshal(tt.requestBody)
			url := fmt.Sprintf("/api/v1/transactions/%s", tt.transactionID)
			req, _ := http.NewRequest("PUT", url, bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+token)

			// Execute request
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			// Check status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			// Parse response
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			// Run additional checks
			tt.checkResponse(t, response)
		})
	}
}

func TestTransactionIntegration_DeleteTransaction(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user and wallet
	user, token := createTestUser(t, "delete@example.com")
	wallet := createTestWallet(t, user.ID, "Main Wallet", 10000.00)

	// Create a test transaction
	transaction := models.Transaction{
		UserID:          user.ID,
		WalletID:        &wallet.ID,
		Amount:          500.00,
		Name:            "To be deleted",
		Method:          "Cash",
		Category:        "Food",
		Notes:           "To be deleted",
		TransactionDate: time.Now(),
	}
	testDB.Create(&transaction)

	tests := []struct {
		name           string
		transactionID  string
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:           "successful transaction deletion",
			transactionID:  transaction.ID.String(),
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify transaction was deleted from database
				var deletedTransaction models.Transaction
				err := testDB.First(&deletedTransaction, transaction.ID).Error
				if err == nil {
					t.Error("Expected transaction to be deleted")
				}
			},
		},
		{
			name:           "delete non-existent transaction",
			transactionID:  "00000000-0000-0000-0000-000000000000",
			expectedStatus: http.StatusNotFound,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Prepare request
			url := fmt.Sprintf("/api/v1/transactions/%s", tt.transactionID)
			req, _ := http.NewRequest("DELETE", url, nil)
			req.Header.Set("Authorization", "Bearer "+token)

			// Execute request
			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			// Check status code
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			// Parse response
			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)

			// Run additional checks
			tt.checkResponse(t, response)
		})
	}
}
