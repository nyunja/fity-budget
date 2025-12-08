package handlers

import (
	"errors"
	"net/http"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/api/handlers"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/tests/unit/mocks"
	"github.com/nyunja/fity-budget-backend/tests/unit/testutils"
)

// Budget Handler Tests
func TestBudgetHandler_CreateBudget(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockBudgetService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful budget creation",
			requestBody: map[string]interface{}{
				"category": "Food & Groceries",
				"limit":    1200.00,
				"color":    "#4F46E5",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockBudgetService) {
				m.CreateBudgetFunc = func(userID uuid.UUID, req services.CreateBudgetRequest) (*models.Budget, error) {
					return &models.Budget{
						ID:             testutils.TestBudgetID,
						UserID:         userID,
						Category:       req.Category,
						LimitAmount:    req.LimitAmount,
						Color:          req.Color,
						AlertThreshold: 80,
						Type:           "Variable",
					}, nil
				}
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
			},
		},
		{
			name: "duplicate budget category",
			requestBody: map[string]interface{}{
				"category": "Food & Groceries",
				"limit":    1200.00,
				"color":    "#4F46E5",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockBudgetService) {
				m.CreateBudgetFunc = func(userID uuid.UUID, req services.CreateBudgetRequest) (*models.Budget, error) {
					return nil, errors.New("budget already exists for this category")
				}
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := &mocks.MockBudgetService{}
			tt.mockSetup(mockService)
			handler := handlers.NewBudgetHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/budgets", func(c *gin.Context) {
				tt.setupContext(c)
				handler.CreateBudget(c)
			})

			w := testutils.MakeRequest(router, "POST", "/budgets", tt.requestBody, nil)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var response map[string]interface{}
			if err := testutils.ParseJSONResponse(w, &response); err != nil {
				t.Fatalf("Failed to parse response: %v", err)
			}

			tt.checkResponse(t, response)
		})
	}
}

func TestBudgetHandler_GetBudgetSummary(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mocks.MockBudgetService{}
	mockService.GetBudgetSummaryFunc = func(userID uuid.UUID) (*services.BudgetSummary, error) {
		return &services.BudgetSummary{
			TotalBudgets:    3,
			TotalLimit:      5000.00,
			TotalSpent:      3200.00,
			TotalRemaining:  1800.00,
			OverBudgetCount: 0,
			NearLimitCount:  1,
		}, nil
	}

	handler := handlers.NewBudgetHandler(mockService)
	router := testutils.SetupTestRouter()
	router.GET("/budgets/summary", func(c *gin.Context) {
		c.Set("userID", testutils.TestUserID)
		handler.GetBudgetSummary(c)
	})

	w := testutils.MakeRequest(router, "GET", "/budgets/summary", nil, nil)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	if err := testutils.ParseJSONResponse(w, &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if !response["success"].(bool) {
		t.Error("Expected success to be true")
	}
}

// Wallet Handler Tests
func TestWalletHandler_CreateWallet(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockWalletService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful wallet creation",
			requestBody: map[string]interface{}{
				"name":     "M-PESA",
				"type":     "Mobile Money",
				"balance":  12450.00,
				"currency": "KES",
				"color":    "#22C55E",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockWalletService) {
				m.CreateWalletFunc = func(userID uuid.UUID, req services.CreateWalletRequest) (*models.Wallet, error) {
					return &models.Wallet{
						ID:        testutils.TestWalletID,
						UserID:    userID,
						Name:      req.Name,
						Type:      req.Type,
						Balance:   req.Balance,
						Currency:  req.Currency,
						Color:     req.Color,
						IsDefault: false,
					}, nil
				}
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
			},
		},
		{
			name: "validation error - missing required fields",
			requestBody: map[string]interface{}{
				"name": "Test Wallet",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockWalletService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := &mocks.MockWalletService{}
			tt.mockSetup(mockService)
			handler := handlers.NewWalletHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/wallets", func(c *gin.Context) {
				tt.setupContext(c)
				handler.CreateWallet(c)
			})

			w := testutils.MakeRequest(router, "POST", "/wallets", tt.requestBody, nil)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var response map[string]interface{}
			if err := testutils.ParseJSONResponse(w, &response); err != nil {
				t.Fatalf("Failed to parse response: %v", err)
			}

			tt.checkResponse(t, response)
		})
	}
}

func TestWalletHandler_ListWallets(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mocks.MockWalletService{}
	mockService.GetUserWalletsFunc = func(userID uuid.UUID) ([]*models.Wallet, error) {
		return []*models.Wallet{
			{
				ID:        testutils.TestWalletID,
				UserID:    userID,
				Name:      "M-PESA",
				Type:      "Mobile Money",
				Balance:   12450.00,
				Currency:  "KES",
				IsDefault: true,
			},
		}, nil
	}

	handler := handlers.NewWalletHandler(mockService)
	router := testutils.SetupTestRouter()
	router.GET("/wallets", func(c *gin.Context) {
		c.Set("userID", testutils.TestUserID)
		handler.ListWallets(c)
	})

	w := testutils.MakeRequest(router, "GET", "/wallets", nil, nil)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	if err := testutils.ParseJSONResponse(w, &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if !response["success"].(bool) {
		t.Error("Expected success to be true")
	}
}

// Analytics Handler Tests
func TestAnalyticsHandler_GetDashboard(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := &mocks.MockAnalyticsService{}
	mockService.GetDashboardSummaryFunc = func(userID uuid.UUID) (*services.DashboardSummary, error) {
		return &services.DashboardSummary{
			TotalBalance: 15700.00,
			TotalIncome:  8500.00,
			TotalExpense: 6222.00,
			NetSavings:   2278.00,
		}, nil
	}

	handler := handlers.NewAnalyticsHandler(mockService)
	router := testutils.SetupTestRouter()
	router.GET("/analytics/dashboard", func(c *gin.Context) {
		c.Set("userID", testutils.TestUserID)
		handler.GetDashboardStats(c)
	})

	w := testutils.MakeRequest(router, "GET", "/analytics/dashboard", nil, nil)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status %d, got %d", http.StatusOK, w.Code)
	}

	var response map[string]interface{}
	if err := testutils.ParseJSONResponse(w, &response); err != nil {
		t.Fatalf("Failed to parse response: %v", err)
	}

	if !response["success"].(bool) {
		t.Error("Expected success to be true")
	}
}

func TestAnalyticsHandler_GetSpendingAnalysis(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		queryParams    string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockAnalyticsService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:        "successful spending analysis",
			queryParams: "?period=1month",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAnalyticsService) {
				m.GetSpendingByCategoryFunc = func(userID uuid.UUID, startDate, endDate time.Time) ([]*services.CategorySpending, error) {
					return []*services.CategorySpending{
						{
							Category:   "Food & Groceries",
							Amount:     800.00,
							Percentage: 12.85,
							Count:      12,
						},
					}, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
			},
		},
		{
			name:        "service error",
			queryParams: "",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAnalyticsService) {
				m.GetSpendingByCategoryFunc = func(userID uuid.UUID, startDate, endDate time.Time) ([]*services.CategorySpending, error) {
					return nil, errors.New("database error")
				}
			},
			expectedStatus: http.StatusInternalServerError,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := &mocks.MockAnalyticsService{}
			tt.mockSetup(mockService)
			handler := handlers.NewAnalyticsHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/analytics/spending", func(c *gin.Context) {
				tt.setupContext(c)
				handler.GetSpendingAnalysis(c)
			})

			w := testutils.MakeRequest(router, "GET", "/analytics/spending"+tt.queryParams, nil, nil)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var response map[string]interface{}
			if err := testutils.ParseJSONResponse(w, &response); err != nil {
				t.Fatalf("Failed to parse response: %v", err)
			}

			tt.checkResponse(t, response)
		})
	}
}
