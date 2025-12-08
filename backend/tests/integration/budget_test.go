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

func TestBudgetIntegration_CreateBudget(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "budget@example.com")

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful budget creation",
			requestBody: map[string]interface{}{
				"category":        "Food & Groceries",
				"limit":           15000.00,
				"period":          "monthly",
				"alert_threshold": 80,
				"color":           "#4F46E5",
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify budget was created in database
				var budget models.Budget
				if err := testDB.Where("user_id = ? AND category = ?", user.ID, "Food & Groceries").First(&budget).Error; err != nil {
					t.Errorf("Budget not found in database: %v", err)
				}
				if budget.LimitAmount != 15000.00 {
					t.Errorf("Expected limit 15000.00, got %f", budget.LimitAmount)
				}
				if budget.AlertThreshold != 80 {
					t.Errorf("Expected alert threshold 80, got %d", budget.AlertThreshold)
				}
			},
		},
		{
			name: "create budget with duplicate category",
			requestBody: map[string]interface{}{
				"category": "Transport",
				"limit":    5000.00,
				"period":   "monthly",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				// First create a budget with this category
				existingBudget := &models.Budget{
					UserID:      user.ID,
					Category:    "Transport",
					LimitAmount: 5000.00,
					Period:      "monthly",
					StartDate:   time.Now(),
				}
				testDB.Create(existingBudget)

				// The second attempt should fail
				if resp["success"].(bool) {
					t.Error("Expected success to be false for duplicate category")
				}
			},
		},
		{
			name: "create budget with invalid limit",
			requestBody: map[string]interface{}{
				"category": "Entertainment",
				"limit":    -1000.00,
				"period":   "monthly",
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
			req, _ := http.NewRequest("POST", "/api/v1/budgets", bytes.NewBuffer(jsonBody))
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

func TestBudgetIntegration_ListBudgets(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "listbudget@example.com")

	// Create test budgets
	budgets := []models.Budget{
		{
			UserID:      user.ID,
			Category:    "Food",
			LimitAmount: 15000.00,
			SpentAmount: 8000.00,
			Period:      "monthly",
			StartDate:   time.Now(),
		},
		{
			UserID:      user.ID,
			Category:    "Transport",
			LimitAmount: 5000.00,
			SpentAmount: 2000.00,
			Period:      "monthly",
			StartDate:   time.Now(),
		},
		{
			UserID:      user.ID,
			Category:    "Entertainment",
			LimitAmount: 3000.00,
			SpentAmount: 1500.00,
			Period:      "monthly",
			StartDate:   time.Now(),
		},
	}

	for _, budget := range budgets {
		testDB.Create(&budget)
	}

	req, _ := http.NewRequest("GET", "/api/v1/budgets", nil)
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
	budgetsList := data["budgets"].([]interface{})
	if len(budgetsList) != 3 {
		t.Errorf("Expected 3 budgets, got %d", len(budgetsList))
	}
}

func TestBudgetIntegration_GetBudget(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "getbudget@example.com")

	// Create a test budget
	budget := models.Budget{
		UserID:      user.ID,
		Category:    "Shopping",
		LimitAmount: 10000.00,
		SpentAmount: 3000.00,
		Period:      "monthly",
		StartDate:   time.Now(),
		Color:       "#10B981",
	}
	testDB.Create(&budget)

	tests := []struct {
		name           string
		budgetID       string
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:           "get existing budget",
			budgetID:       budget.ID.String(),
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				budgetData := data["budget"].(map[string]interface{})
				if budgetData["category"] != "Shopping" {
					t.Errorf("Expected category 'Shopping', got %s", budgetData["category"])
				}
				if budgetData["limit_amount"].(float64) != 10000.00 {
					t.Errorf("Expected limit 10000.00, got %f", budgetData["limit_amount"])
				}
			},
		},
		{
			name:           "get non-existent budget",
			budgetID:       "00000000-0000-0000-0000-000000000000",
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
			url := fmt.Sprintf("/api/v1/budgets/%s", tt.budgetID)
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

func TestBudgetIntegration_UpdateBudget(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "updatebudget@example.com")

	// Create a test budget
	budget := models.Budget{
		UserID:         user.ID,
		Category:       "Utilities",
		LimitAmount:    8000.00,
		SpentAmount:    2000.00,
		Period:         "monthly",
		AlertThreshold: 75,
		StartDate:      time.Now(),
	}
	testDB.Create(&budget)

	tests := []struct {
		name           string
		budgetID       string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:     "successful budget update",
			budgetID: budget.ID.String(),
			requestBody: map[string]interface{}{
				"limit":           10000.00,
				"alert_threshold": 85,
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify budget was updated in database
				var updatedBudget models.Budget
				testDB.First(&updatedBudget, budget.ID)
				if updatedBudget.LimitAmount != 10000.00 {
					t.Errorf("Expected limit 10000.00, got %f", updatedBudget.LimitAmount)
				}
				if updatedBudget.AlertThreshold != 85 {
					t.Errorf("Expected alert threshold 85, got %d", updatedBudget.AlertThreshold)
				}
			},
		},
		{
			name:     "update non-existent budget",
			budgetID: "00000000-0000-0000-0000-000000000000",
			requestBody: map[string]interface{}{
				"limit": 5000.00,
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
			jsonBody, _ := json.Marshal(tt.requestBody)
			url := fmt.Sprintf("/api/v1/budgets/%s", tt.budgetID)
			req, _ := http.NewRequest("PUT", url, bytes.NewBuffer(jsonBody))
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

func TestBudgetIntegration_GetBudgetSummary(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "summary@example.com")

	// Create test budgets with different spending levels
	budgets := []models.Budget{
		{
			UserID:      user.ID,
			Category:    "Food",
			LimitAmount: 15000.00,
			SpentAmount: 12000.00, // 80% spent (near limit)
			Period:      "monthly",
			StartDate:   time.Now(),
		},
		{
			UserID:      user.ID,
			Category:    "Transport",
			LimitAmount: 5000.00,
			SpentAmount: 6000.00, // 120% spent (over budget)
			Period:      "monthly",
			StartDate:   time.Now(),
		},
		{
			UserID:      user.ID,
			Category:    "Entertainment",
			LimitAmount: 3000.00,
			SpentAmount: 1000.00, // 33% spent (safe)
			Period:      "monthly",
			StartDate:   time.Now(),
		},
	}

	for _, budget := range budgets {
		testDB.Create(&budget)
	}

	req, _ := http.NewRequest("GET", "/api/v1/budgets/summary", nil)
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
	summary := data["summary"].(map[string]interface{})

	// Verify summary contains expected fields
	if summary["total_budgets"] == nil {
		t.Error("Expected total_budgets field")
	}
	if summary["total_limit"] == nil {
		t.Error("Expected total_limit field")
	}
	if summary["total_spent"] == nil {
		t.Error("Expected total_spent field")
	}
	if summary["over_budget_count"] == nil {
		t.Error("Expected over_budget_count field")
	}

	// Verify calculations
	totalBudgets := int(summary["total_budgets"].(float64))
	if totalBudgets != 3 {
		t.Errorf("Expected 3 total budgets, got %d", totalBudgets)
	}

	overBudgetCount := int(summary["over_budget_count"].(float64))
	if overBudgetCount != 1 {
		t.Errorf("Expected 1 over-budget budget, got %d", overBudgetCount)
	}
}

func TestBudgetIntegration_DeleteBudget(t *testing.T) {
	cleanDatabaseForTest(t)

	user, token := createTestUser(t, "deletebudget@example.com")

	// Create a test budget
	budget := models.Budget{
		UserID:      user.ID,
		Category:    "To Delete",
		LimitAmount: 5000.00,
		Period:      "monthly",
		StartDate:   time.Now(),
	}
	testDB.Create(&budget)

	url := fmt.Sprintf("/api/v1/budgets/%s", budget.ID.String())
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

	// Verify budget was deleted
	var deletedBudget models.Budget
	err := testDB.First(&deletedBudget, budget.ID).Error
	if err == nil {
		t.Error("Expected budget to be deleted")
	}
}
