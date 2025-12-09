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

func TestTransactionHandler_ListTransactions(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		queryParams    string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockTransactionService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:        "successful list with default pagination",
			queryParams: "",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetUserTransactionsWithCountFunc = func(userID uuid.UUID, limit, offset int) ([]*models.Transaction, int64, error) {
					return []*models.Transaction{
						{
							ID:              testutils.TestTransactionID,
							UserID:          userID,
							Amount:          150.00,
							Name:            "Test Transaction",
							Category:        "Shopping",
							Status:          "Completed",
							TransactionDate: time.Now(),
						},
					}, 1, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				transactions := data["data"].([]interface{})
				if len(transactions) != 1 {
					t.Errorf("Expected 1 transaction, got %d", len(transactions))
				}
				pagination := data["pagination"].(map[string]interface{})
				if pagination["total"].(float64) != 1 {
					t.Errorf("Expected total to be 1, got %v", pagination["total"])
				}
				if pagination["total_pages"].(float64) != 1 {
					t.Errorf("Expected total_pages to be 1, got %v", pagination["total_pages"])
				}
			},
		},
		{
			name:        "list with custom pagination",
			queryParams: "?page=2&limit=10",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetUserTransactionsWithCountFunc = func(userID uuid.UUID, limit, offset int) ([]*models.Transaction, int64, error) {
					if limit != 10 || offset != 10 {
						t.Errorf("Expected limit=10 and offset=10, got limit=%d, offset=%d", limit, offset)
					}
					return []*models.Transaction{}, 25, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				pagination := data["pagination"].(map[string]interface{})
				if pagination["page"].(float64) != 2 {
					t.Errorf("Expected page to be 2, got %v", pagination["page"])
				}
				if pagination["limit"].(float64) != 10 {
					t.Errorf("Expected limit to be 10, got %v", pagination["limit"])
				}
				if pagination["total"].(float64) != 25 {
					t.Errorf("Expected total to be 25, got %v", pagination["total"])
				}
				if pagination["has_prev"].(bool) != true {
					t.Error("Expected has_prev to be true")
				}
				if pagination["has_next"].(bool) != true {
					t.Error("Expected has_next to be true")
				}
			},
		},
		{
			name:        "service error",
			queryParams: "",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetUserTransactionsWithCountFunc = func(userID uuid.UUID, limit, offset int) ([]*models.Transaction, int64, error) {
					return nil, 0, errors.New("database error")
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
			// Setup
			mockService := &mocks.MockTransactionService{}
			tt.mockSetup(mockService)
			handler := handlers.NewTransactionHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/transactions", func(c *gin.Context) {
				tt.setupContext(c)
				handler.ListTransactions(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "GET", "/transactions"+tt.queryParams, nil, nil)

			// Assert
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

func TestTransactionHandler_GetTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		transactionID  string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockTransactionService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:          "successful get transaction",
			transactionID: testutils.TestTransactionID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetTransactionByIDFunc = func(id, userID uuid.UUID) (*models.Transaction, error) {
					return &models.Transaction{
						ID:       id,
						UserID:   userID,
						Amount:   150.00,
						Name:     "Test Transaction",
						Category: "Shopping",
						Status:   "Completed",
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
			name:          "transaction not found",
			transactionID: testutils.TestTransactionID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetTransactionByIDFunc = func(id, userID uuid.UUID) (*models.Transaction, error) {
					return nil, errors.New("transaction not found")
				}
			},
			expectedStatus: http.StatusNotFound,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name:          "invalid transaction ID",
			transactionID: "invalid-uuid",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockTransactionService) {},
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
			// Setup
			mockService := &mocks.MockTransactionService{}
			tt.mockSetup(mockService)
			handler := handlers.NewTransactionHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/transactions/:id", func(c *gin.Context) {
				tt.setupContext(c)
				handler.GetTransaction(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "GET", "/transactions/"+tt.transactionID, nil, nil)

			// Assert
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

func TestTransactionHandler_CreateTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockTransactionService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful transaction creation",
			requestBody: map[string]interface{}{
				"amount":   150.00,
				"name":     "Grocery Shopping",
				"method":   "VISA **3254",
				"category": "Food & Groceries",
				"status":   "Completed",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.CreateTransactionFunc = func(userID uuid.UUID, req services.CreateTransactionRequest) (*models.Transaction, error) {
					return &models.Transaction{
						ID:              testutils.TestTransactionID,
						UserID:          userID,
						Amount:          req.Amount,
						Name:            req.Name,
						Method:          req.Method,
						Category:        req.Category,
						Status:          req.Status,
						TransactionDate: time.Now(),
					}, nil
				}
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				transaction := data["transaction"].(map[string]interface{})
				if transaction["name"] != "Grocery Shopping" {
					t.Errorf("Expected name 'Grocery Shopping', got %v", transaction["name"])
				}
			},
		},
		{
			name: "validation error - missing required fields",
			requestBody: map[string]interface{}{
				"amount": 150.00,
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockTransactionService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "validation error - invalid amount",
			requestBody: map[string]interface{}{
				"amount":   -50.00,
				"name":     "Test",
				"method":   "Cash",
				"category": "Test",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockTransactionService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "service error",
			requestBody: map[string]interface{}{
				"amount":   150.00,
				"name":     "Test",
				"method":   "Cash",
				"category": "Test",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.CreateTransactionFunc = func(userID uuid.UUID, req services.CreateTransactionRequest) (*models.Transaction, error) {
					return nil, errors.New("wallet not found")
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
			// Setup
			mockService := &mocks.MockTransactionService{}
			tt.mockSetup(mockService)
			handler := handlers.NewTransactionHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/transactions", func(c *gin.Context) {
				tt.setupContext(c)
				handler.CreateTransaction(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "POST", "/transactions", tt.requestBody, nil)

			// Assert
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

func TestTransactionHandler_UpdateTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		transactionID  string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockTransactionService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:          "successful update",
			transactionID: testutils.TestTransactionID.String(),
			requestBody: map[string]interface{}{
				"amount": 200.00,
				"name":   "Updated Transaction",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.UpdateTransactionFunc = func(id, userID uuid.UUID, req services.UpdateTransactionRequest) (*models.Transaction, error) {
					return &models.Transaction{
						ID:     id,
						UserID: userID,
						Amount: req.Amount,
						Name:   req.Name,
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
			name:          "transaction not found",
			transactionID: testutils.TestTransactionID.String(),
			requestBody: map[string]interface{}{
				"amount": 200.00,
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.UpdateTransactionFunc = func(id, userID uuid.UUID, req services.UpdateTransactionRequest) (*models.Transaction, error) {
					return nil, errors.New("transaction not found")
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
			// Setup
			mockService := &mocks.MockTransactionService{}
			tt.mockSetup(mockService)
			handler := handlers.NewTransactionHandler(mockService)

			router := testutils.SetupTestRouter()
			router.PUT("/transactions/:id", func(c *gin.Context) {
				tt.setupContext(c)
				handler.UpdateTransaction(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "PUT", "/transactions/"+tt.transactionID, tt.requestBody, nil)

			// Assert
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

func TestTransactionHandler_DeleteTransaction(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		transactionID  string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockTransactionService)
		expectedStatus int
	}{
		{
			name:          "successful deletion",
			transactionID: testutils.TestTransactionID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.DeleteTransactionFunc = func(id, userID uuid.UUID) error {
					return nil
				}
			},
			expectedStatus: http.StatusNoContent,
		},
		{
			name:          "transaction not found",
			transactionID: testutils.TestTransactionID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.DeleteTransactionFunc = func(id, userID uuid.UUID) error {
					return errors.New("transaction not found")
				}
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			mockService := &mocks.MockTransactionService{}
			tt.mockSetup(mockService)
			handler := handlers.NewTransactionHandler(mockService)

			router := testutils.SetupTestRouter()
			router.DELETE("/transactions/:id", func(c *gin.Context) {
				tt.setupContext(c)
				handler.DeleteTransaction(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "DELETE", "/transactions/"+tt.transactionID, nil, nil)

			// Assert
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}

func TestTransactionHandler_GetTransactionStats(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockTransactionService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful stats retrieval",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetTransactionStatsFunc = func(userID uuid.UUID, startDate, endDate time.Time) (*services.TransactionStats, error) {
					return &services.TransactionStats{
						TotalIncome:      5000.00,
						TotalExpense:     3200.00,
						NetBalance:       1800.00,
						TransactionCount: 45,
					}, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				stats := data["stats"].(map[string]interface{})
				if stats["transaction_count"].(float64) != 45 {
					t.Errorf("Expected transaction count 45, got %v", stats["transaction_count"])
				}
			},
		},
		{
			name: "service error",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockTransactionService) {
				m.GetTransactionStatsFunc = func(userID uuid.UUID, startDate, endDate time.Time) (*services.TransactionStats, error) {
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
			// Setup
			mockService := &mocks.MockTransactionService{}
			tt.mockSetup(mockService)
			handler := handlers.NewTransactionHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/transactions/stats", func(c *gin.Context) {
				tt.setupContext(c)
				handler.GetTransactionStats(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "GET", "/transactions/stats", nil, nil)

			// Assert
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
