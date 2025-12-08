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

func TestGoalHandler_ListGoals(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockGoalService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful list goals",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.GetUserGoalsFunc = func(userID uuid.UUID) ([]*models.SavingGoal, error) {
					deadline := time.Now().Add(time.Hour * 24 * 30)
					return []*models.SavingGoal{
						{
							ID:            testutils.TestGoalID,
							UserID:        userID,
							Name:          "MacBook Pro",
							TargetAmount:  2500.00,
							CurrentAmount: 850.00,
							Color:         "#6366F1",
							Priority:      "High",
							Status:        "Active",
							Deadline:      &deadline,
						},
					}, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				goals := data["goals"].([]interface{})
				if len(goals) != 1 {
					t.Errorf("Expected 1 goal, got %d", len(goals))
				}
			},
		},
		{
			name: "service error",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.GetUserGoalsFunc = func(userID uuid.UUID) ([]*models.SavingGoal, error) {
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
			mockService := &mocks.MockGoalService{}
			tt.mockSetup(mockService)
			handler := handlers.NewGoalHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/goals", func(c *gin.Context) {
				tt.setupContext(c)
				handler.ListGoals(c)
			})

			w := testutils.MakeRequest(router, "GET", "/goals", nil, nil)

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

func TestGoalHandler_GetGoal(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		goalID         string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockGoalService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:   "successful get goal",
			goalID: testutils.TestGoalID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.GetGoalByIDFunc = func(id, userID uuid.UUID) (*models.SavingGoal, error) {
					return &models.SavingGoal{
						ID:            id,
						UserID:        userID,
						Name:          "MacBook Pro",
						TargetAmount:  2500.00,
						CurrentAmount: 850.00,
						Status:        "Active",
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
			name:   "goal not found",
			goalID: testutils.TestGoalID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.GetGoalByIDFunc = func(id, userID uuid.UUID) (*models.SavingGoal, error) {
					return nil, errors.New("goal not found")
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
			name:   "invalid goal ID",
			goalID: "invalid-uuid",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockGoalService) {},
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
			mockService := &mocks.MockGoalService{}
			tt.mockSetup(mockService)
			handler := handlers.NewGoalHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/goals/:id", func(c *gin.Context) {
				tt.setupContext(c)
				handler.GetGoal(c)
			})

			w := testutils.MakeRequest(router, "GET", "/goals/"+tt.goalID, nil, nil)

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

func TestGoalHandler_CreateGoal(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockGoalService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful goal creation",
			requestBody: map[string]interface{}{
				"name":   "MacBook Pro",
				"target": 2500.00,
				"color":  "#6366F1",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.CreateGoalFunc = func(userID uuid.UUID, req services.CreateGoalRequest) (*models.SavingGoal, error) {
					return &models.SavingGoal{
						ID:            testutils.TestGoalID,
						UserID:        userID,
						Name:          req.Name,
						TargetAmount:  req.TargetAmount,
						CurrentAmount: req.CurrentAmount,
						Color:         req.Color,
						Status:        "Active",
					}, nil
				}
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				goal := data["goal"].(map[string]interface{})
				if goal["name"] != "MacBook Pro" {
					t.Errorf("Expected name 'MacBook Pro', got %v", goal["name"])
				}
			},
		},
		{
			name: "validation error - missing required fields",
			requestBody: map[string]interface{}{
				"name": "Test Goal",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockGoalService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "validation error - invalid target amount",
			requestBody: map[string]interface{}{
				"name":   "Test Goal",
				"target": -100.00,
				"color":  "#6366F1",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockGoalService) {},
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
				"name":   "Test Goal",
				"target": 1000.00,
				"color":  "#6366F1",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.CreateGoalFunc = func(userID uuid.UUID, req services.CreateGoalRequest) (*models.SavingGoal, error) {
					return nil, errors.New("deadline must be in the future")
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
			mockService := &mocks.MockGoalService{}
			tt.mockSetup(mockService)
			handler := handlers.NewGoalHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/goals", func(c *gin.Context) {
				tt.setupContext(c)
				handler.CreateGoal(c)
			})

			w := testutils.MakeRequest(router, "POST", "/goals", tt.requestBody, nil)

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

func TestGoalHandler_UpdateGoal(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		goalID         string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockGoalService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:   "successful update",
			goalID: testutils.TestGoalID.String(),
			requestBody: map[string]interface{}{
				"name":   "MacBook Pro Updated",
				"target": 3000.00,
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.UpdateGoalFunc = func(id, userID uuid.UUID, req services.UpdateGoalRequest) (*models.SavingGoal, error) {
					return &models.SavingGoal{
						ID:           id,
						UserID:       userID,
						Name:         req.Name,
						TargetAmount: req.TargetAmount,
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
			name:   "goal not found",
			goalID: testutils.TestGoalID.String(),
			requestBody: map[string]interface{}{
				"name": "Updated Goal",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.UpdateGoalFunc = func(id, userID uuid.UUID, req services.UpdateGoalRequest) (*models.SavingGoal, error) {
					return nil, errors.New("goal not found")
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
			mockService := &mocks.MockGoalService{}
			tt.mockSetup(mockService)
			handler := handlers.NewGoalHandler(mockService)

			router := testutils.SetupTestRouter()
			router.PUT("/goals/:id", func(c *gin.Context) {
				tt.setupContext(c)
				handler.UpdateGoal(c)
			})

			w := testutils.MakeRequest(router, "PUT", "/goals/"+tt.goalID, tt.requestBody, nil)

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

func TestGoalHandler_UpdateProgress(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		goalID         string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockGoalService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name:   "successful progress update",
			goalID: testutils.TestGoalID.String(),
			requestBody: map[string]interface{}{
				"amount": 150.00,
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.AddProgressFunc = func(id, userID uuid.UUID, amount float64) (*models.SavingGoal, error) {
					return &models.SavingGoal{
						ID:            id,
						UserID:        userID,
						CurrentAmount: 1000.00,
						TargetAmount:  2500.00,
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
			name:   "validation error - invalid amount",
			goalID: testutils.TestGoalID.String(),
			requestBody: map[string]interface{}{
				"amount": -50.00,
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup:      func(m *mocks.MockGoalService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name:   "cannot add progress to completed goal",
			goalID: testutils.TestGoalID.String(),
			requestBody: map[string]interface{}{
				"amount": 100.00,
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.AddProgressFunc = func(id, userID uuid.UUID, amount float64) (*models.SavingGoal, error) {
					return nil, errors.New("cannot add progress to completed goal")
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
			mockService := &mocks.MockGoalService{}
			tt.mockSetup(mockService)
			handler := handlers.NewGoalHandler(mockService)

			router := testutils.SetupTestRouter()
			router.PATCH("/goals/:id/progress", func(c *gin.Context) {
				tt.setupContext(c)
				handler.UpdateProgress(c)
			})

			w := testutils.MakeRequest(router, "PATCH", "/goals/"+tt.goalID+"/progress", tt.requestBody, nil)

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

func TestGoalHandler_DeleteGoal(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		goalID         string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockGoalService)
		expectedStatus int
	}{
		{
			name:   "successful deletion",
			goalID: testutils.TestGoalID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.DeleteGoalFunc = func(id, userID uuid.UUID) error {
					return nil
				}
			},
			expectedStatus: http.StatusNoContent,
		},
		{
			name:   "goal not found",
			goalID: testutils.TestGoalID.String(),
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockGoalService) {
				m.DeleteGoalFunc = func(id, userID uuid.UUID) error {
					return errors.New("goal not found")
				}
			},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockService := &mocks.MockGoalService{}
			tt.mockSetup(mockService)
			handler := handlers.NewGoalHandler(mockService)

			router := testutils.SetupTestRouter()
			router.DELETE("/goals/:id", func(c *gin.Context) {
				tt.setupContext(c)
				handler.DeleteGoal(c)
			})

			w := testutils.MakeRequest(router, "DELETE", "/goals/"+tt.goalID, nil, nil)

			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}
		})
	}
}
