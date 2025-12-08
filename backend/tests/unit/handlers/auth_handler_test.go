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
	"github.com/nyunja/fity-budget-backend/tests/unit/mocks"
	"github.com/nyunja/fity-budget-backend/tests/unit/testutils"
)

func TestAuthHandler_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		mockSetup      func(*mocks.MockAuthService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful registration",
			requestBody: map[string]interface{}{
				"name":     "John Doe",
				"email":    "john@example.com",
				"password": "password123",
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.RegisterFunc = func(name, email, password string) (*models.User, string, error) {
					return &models.User{
						ID:          testutils.TestUserID,
						Name:        name,
						Email:       email,
						IsOnboarded: false,
						CreatedAt:   time.Now(),
					}, "test-token", nil
				}
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				if data["token"] != "test-token" {
					t.Errorf("Expected token 'test-token', got %v", data["token"])
				}
				user := data["user"].(map[string]interface{})
				if user["email"] != "john@example.com" {
					t.Errorf("Expected email 'john@example.com', got %v", user["email"])
				}
			},
		},
		{
			name: "registration with existing email",
			requestBody: map[string]interface{}{
				"name":     "John Doe",
				"email":    "existing@example.com",
				"password": "password123",
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.RegisterFunc = func(name, email, password string) (*models.User, string, error) {
					return nil, "", errors.New("email already exists")
				}
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
				errorData := body["error"].(map[string]interface{})
				if errorData["code"] != "REGISTER_FAILED" {
					t.Errorf("Expected error code 'REGISTER_FAILED', got %v", errorData["code"])
				}
			},
		},
		{
			name: "registration with invalid email",
			requestBody: map[string]interface{}{
				"name":     "John Doe",
				"email":    "invalid-email",
				"password": "password123",
			},
			mockSetup:      func(m *mocks.MockAuthService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "registration with short password",
			requestBody: map[string]interface{}{
				"name":     "John Doe",
				"email":    "john@example.com",
				"password": "short",
			},
			mockSetup:      func(m *mocks.MockAuthService) {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "registration with missing fields",
			requestBody: map[string]interface{}{
				"email": "john@example.com",
			},
			mockSetup:      func(m *mocks.MockAuthService) {},
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
			mockService := &mocks.MockAuthService{}
			tt.mockSetup(mockService)
			handler := handlers.NewAuthHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/register", handler.Register)

			// Execute
			w := testutils.MakeRequest(router, "POST", "/register", tt.requestBody, nil)

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

func TestAuthHandler_Login(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		mockSetup      func(*mocks.MockAuthService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful login",
			requestBody: map[string]interface{}{
				"email":    "john@example.com",
				"password": "password123",
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.LoginFunc = func(email, password string) (*models.User, string, error) {
					return &models.User{
						ID:          testutils.TestUserID,
						Name:        "John Doe",
						Email:       email,
						IsOnboarded: true,
					}, "test-token", nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				if data["token"] != "test-token" {
					t.Errorf("Expected token 'test-token', got %v", data["token"])
				}
			},
		},
		{
			name: "login with invalid credentials",
			requestBody: map[string]interface{}{
				"email":    "john@example.com",
				"password": "wrongpassword",
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.LoginFunc = func(email, password string) (*models.User, string, error) {
					return nil, "", errors.New("invalid credentials")
				}
			},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if body["success"].(bool) {
					t.Error("Expected success to be false")
				}
				errorData := body["error"].(map[string]interface{})
				if errorData["code"] != "INVALID_CREDENTIALS" {
					t.Errorf("Expected error code 'INVALID_CREDENTIALS', got %v", errorData["code"])
				}
			},
		},
		{
			name: "login with missing password",
			requestBody: map[string]interface{}{
				"email": "john@example.com",
			},
			mockSetup:      func(m *mocks.MockAuthService) {},
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
			mockService := &mocks.MockAuthService{}
			tt.mockSetup(mockService)
			handler := handlers.NewAuthHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/login", handler.Login)

			// Execute
			w := testutils.MakeRequest(router, "POST", "/login", tt.requestBody, nil)

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

func TestAuthHandler_GetMe(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockAuthService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful get user profile",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.GetUserByIDFunc = func(id uuid.UUID) (*models.User, error) {
					return &models.User{
						ID:          id,
						Name:        "John Doe",
						Email:       "john@example.com",
						IsOnboarded: true,
					}, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				user := data["user"].(map[string]interface{})
				if user["email"] != "john@example.com" {
					t.Errorf("Expected email 'john@example.com', got %v", user["email"])
				}
			},
		},
		{
			name: "user not found",
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.GetUserByIDFunc = func(id uuid.UUID) (*models.User, error) {
					return nil, errors.New("user not found")
				}
			},
			expectedStatus: http.StatusNotFound,
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
			mockService := &mocks.MockAuthService{}
			tt.mockSetup(mockService)
			handler := handlers.NewAuthHandler(mockService)

			router := testutils.SetupTestRouter()
			router.GET("/me", func(c *gin.Context) {
				tt.setupContext(c)
				handler.GetMe(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "GET", "/me", nil, nil)

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

func TestAuthHandler_UpdateProfile(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockAuthService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful profile update",
			requestBody: map[string]interface{}{
				"name":  "John Updated",
				"email": "john.updated@example.com",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.UpdateProfileFunc = func(id uuid.UUID, name, email string) (*models.User, error) {
					return &models.User{
						ID:    id,
						Name:  name,
						Email: email,
					}, nil
				}
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, body map[string]interface{}) {
				if !body["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := body["data"].(map[string]interface{})
				user := data["user"].(map[string]interface{})
				if user["name"] != "John Updated" {
					t.Errorf("Expected name 'John Updated', got %v", user["name"])
				}
			},
		},
		{
			name: "update with existing email",
			requestBody: map[string]interface{}{
				"name":  "John",
				"email": "existing@example.com",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.UpdateProfileFunc = func(id uuid.UUID, name, email string) (*models.User, error) {
					return nil, errors.New("email already exists")
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
			mockService := &mocks.MockAuthService{}
			tt.mockSetup(mockService)
			handler := handlers.NewAuthHandler(mockService)

			router := testutils.SetupTestRouter()
			router.PUT("/profile", func(c *gin.Context) {
				tt.setupContext(c)
				handler.UpdateProfile(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "PUT", "/profile", tt.requestBody, nil)

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

func TestAuthHandler_CompleteOnboarding(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupContext   func(*gin.Context)
		mockSetup      func(*mocks.MockAuthService)
		expectedStatus int
		checkResponse  func(t *testing.T, body map[string]interface{})
	}{
		{
			name: "successful onboarding completion",
			requestBody: map[string]interface{}{
				"monthly_income": 5000.0,
				"currency":       "USD",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.CompleteOnboardingFunc = func(id uuid.UUID, monthlyIncome float64, currency string) error {
					return nil
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
			name: "onboarding failure",
			requestBody: map[string]interface{}{
				"monthly_income": 5000.0,
				"currency":       "USD",
			},
			setupContext: func(c *gin.Context) {
				c.Set("userID", testutils.TestUserID)
			},
			mockSetup: func(m *mocks.MockAuthService) {
				m.CompleteOnboardingFunc = func(id uuid.UUID, monthlyIncome float64, currency string) error {
					return errors.New("user not found")
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
			mockService := &mocks.MockAuthService{}
			tt.mockSetup(mockService)
			handler := handlers.NewAuthHandler(mockService)

			router := testutils.SetupTestRouter()
			router.POST("/onboarding", func(c *gin.Context) {
				tt.setupContext(c)
				handler.CompleteOnboarding(c)
			})

			// Execute
			w := testutils.MakeRequest(router, "POST", "/onboarding", tt.requestBody, nil)

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
