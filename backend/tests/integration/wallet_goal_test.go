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

// Wallet Integration Tests

func TestWalletIntegration_CreateWallet(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "wallet@example.com")

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful wallet creation",
			requestBody: map[string]interface{}{
				"name":     "M-PESA",
				"type":     "Mobile Money",
				"balance":  5000.00,
				"currency": "KES",
				"color":    "#22C55E",
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify wallet was created in database
				var wallet models.Wallet
				if err := testDB.Where("user_id = ? AND name = ?", user.ID, "M-PESA").First(&wallet).Error; err != nil {
					t.Errorf("Wallet not found in database: %v", err)
				}
				if wallet.Balance != 5000.00 {
					t.Errorf("Expected balance 5000.00, got %f", wallet.Balance)
				}
			},
		},
		{
			name: "create wallet with missing fields",
			requestBody: map[string]interface{}{
				"name": "Incomplete",
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
			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/api/v1/wallets", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+token)

			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)
			tt.checkResponse(t, response)
		})
	}
}

func TestWalletIntegration_ListWallets(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "listwallet@example.com")

	// Create multiple wallets
	createTestWallet(t, user.ID, "Bank Account", 10000.00)
	createTestWallet(t, user.ID, "M-PESA", 5000.00)
	createTestWallet(t, user.ID, "Cash", 1000.00)

	req, _ := http.NewRequest("GET", "/api/v1/wallets", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if !response["success"].(bool) {
		t.Error("Expected success to be true")
	}

	data := response["data"].(map[string]interface{})
	wallets := data["wallets"].([]interface{})
	if len(wallets) != 3 {
		t.Errorf("Expected 3 wallets, got %d", len(wallets))
	}
}

func TestWalletIntegration_GetWallet(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "getwallet@example.com")
	wallet := createTestWallet(t, user.ID, "Test Wallet", 5000.00)

	tests := []struct {
		name           string
		walletID       string
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:           "get existing wallet",
			walletID:       wallet.ID.String(),
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				walletData := data["wallet"].(map[string]interface{})
				if walletData["name"] != "Test Wallet" {
					t.Errorf("Expected wallet name 'Test Wallet', got %s", walletData["name"])
				}
			},
		},
		{
			name:           "get non-existent wallet",
			walletID:       "00000000-0000-0000-0000-000000000000",
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
			url := fmt.Sprintf("/api/v1/wallets/%s", tt.walletID)
			req, _ := http.NewRequest("GET", url, nil)
			req.Header.Set("Authorization", "Bearer "+token)

			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)
			tt.checkResponse(t, response)
		})
	}
}

// Goal Integration Tests

func TestGoalIntegration_CreateGoal(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "goal@example.com")

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful goal creation",
			requestBody: map[string]interface{}{
				"name":          "New Laptop",
				"target_amount": 50000.00,
				"deadline":      time.Now().AddDate(0, 3, 0).Format(time.RFC3339),
				"category":      "Electronics",
				"color":         "#3B82F6",
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify goal was created in database
				var goal models.SavingGoal
				if err := testDB.Where("user_id = ? AND name = ?", user.ID, "New Laptop").First(&goal).Error; err != nil {
					t.Errorf("Goal not found in database: %v", err)
				}
				if goal.TargetAmount != 50000.00 {
					t.Errorf("Expected target 50000.00, got %f", goal.TargetAmount)
				}
				if goal.CurrentAmount != 0 {
					t.Errorf("Expected current amount 0, got %f", goal.CurrentAmount)
				}
			},
		},
		{
			name: "create goal with invalid target amount",
			requestBody: map[string]interface{}{
				"name":          "Invalid Goal",
				"target_amount": -1000.00,
				"deadline":      time.Now().AddDate(0, 1, 0).Format(time.RFC3339),
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
			jsonBody, _ := json.Marshal(tt.requestBody)
			req, _ := http.NewRequest("POST", "/api/v1/goals", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+token)

			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d. Body: %s", tt.expectedStatus, w.Code, w.Body.String())
			}

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)
			tt.checkResponse(t, response)
		})
	}
}

func TestGoalIntegration_ListGoals(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "listgoal@example.com")

	// Create test goals
	goals := []models.SavingGoal{
		{
			UserID:        user.ID,
			Name:          "Laptop",
			TargetAmount:  50000.00,
			CurrentAmount: 10000.00,
			Deadline:      time.Now().AddDate(0, 3, 0),
			Status:        "in_progress",
		},
		{
			UserID:        user.ID,
			Name:          "Vacation",
			TargetAmount:  30000.00,
			CurrentAmount: 5000.00,
			Deadline:      time.Now().AddDate(0, 6, 0),
			Status:        "in_progress",
		},
	}

	for _, goal := range goals {
		testDB.Create(&goal)
	}

	req, _ := http.NewRequest("GET", "/api/v1/goals", nil)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if !response["success"].(bool) {
		t.Error("Expected success to be true")
	}

	data := response["data"].(map[string]interface{})
	goalsList := data["goals"].([]interface{})
	if len(goalsList) != 2 {
		t.Errorf("Expected 2 goals, got %d", len(goalsList))
	}
}

func TestGoalIntegration_UpdateProgress(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "progress@example.com")

	// Create a test goal
	goal := models.SavingGoal{
		UserID:        user.ID,
		Name:          "Test Goal",
		TargetAmount:  10000.00,
		CurrentAmount: 2000.00,
		Deadline:      time.Now().AddDate(0, 3, 0),
		Status:        "in_progress",
	}
	testDB.Create(&goal)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful progress update",
			requestBody: map[string]interface{}{
				"amount": 1000.00,
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify goal progress was updated
				var updatedGoal models.SavingGoal
				testDB.First(&updatedGoal, goal.ID)
				expectedAmount := 2000.00 + 1000.00
				if updatedGoal.CurrentAmount != expectedAmount {
					t.Errorf("Expected current amount %f, got %f", expectedAmount, updatedGoal.CurrentAmount)
				}
			},
		},
		{
			name: "update with invalid amount",
			requestBody: map[string]interface{}{
				"amount": -500.00,
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
			jsonBody, _ := json.Marshal(tt.requestBody)
			url := fmt.Sprintf("/api/v1/goals/%s/progress", goal.ID.String())
			req, _ := http.NewRequest("PATCH", url, bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", "Bearer "+token)

			w := httptest.NewRecorder()
			testRouter.ServeHTTP(w, req)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var response map[string]interface{}
			json.Unmarshal(w.Body.Bytes(), &response)
			tt.checkResponse(t, response)
		})
	}
}

func TestGoalIntegration_DeleteGoal(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "deletegoal@example.com")

	// Create a test goal
	goal := models.SavingGoal{
		UserID:        user.ID,
		Name:          "To Delete",
		TargetAmount:  5000.00,
		CurrentAmount: 1000.00,
		Deadline:      time.Now().AddDate(0, 2, 0),
		Status:        "in_progress",
	}
	testDB.Create(&goal)

	url := fmt.Sprintf("/api/v1/goals/%s", goal.ID.String())
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("Authorization", "Bearer "+token)

	w := httptest.NewRecorder()
	testRouter.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)

	if !response["success"].(bool) {
		t.Error("Expected success to be true")
	}

	// Verify goal was deleted
	var deletedGoal models.SavingGoal
	err := testDB.First(&deletedGoal, goal.ID).Error
	if err == nil {
		t.Error("Expected goal to be deleted")
	}
}
