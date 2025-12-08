package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/nyunja/fity-budget-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func TestAuthIntegration_Register(t *testing.T) {
	cleanDatabaseForTest(t)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful registration",
			requestBody: map[string]interface{}{
				"name":     "John Doe",
				"email":    "john@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				if data["user"] == nil {
					t.Error("Expected user data")
				}
				if data["token"] == nil {
					t.Error("Expected token")
				}

				// Verify user was created in database
				var user models.User
				if err := testDB.Where("email = ?", "john@example.com").First(&user).Error; err != nil {
					t.Errorf("User not found in database: %v", err)
				}
				if user.Name != "John Doe" {
					t.Errorf("Expected name 'John Doe', got '%s'", user.Name)
				}
			},
		},
		{
			name: "registration with existing email",
			requestBody: map[string]interface{}{
				"name":     "Jane Doe",
				"email":    "existing@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				// First create a user with this email
				hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
				existingUser := &models.User{
					Name:         "Existing User",
					Email:        "existing@example.com",
					PasswordHash: string(hashedPassword),
				}
				testDB.Create(existingUser)

				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "registration with invalid email",
			requestBody: map[string]interface{}{
				"name":     "Invalid User",
				"email":    "invalid-email",
				"password": "password123",
			},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "registration with short password",
			requestBody: map[string]interface{}{
				"name":     "Short Pass",
				"email":    "short@example.com",
				"password": "short",
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
			req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")

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

func TestAuthIntegration_Login(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create a test user
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	testUser := &models.User{
		Name:         "Test User",
		Email:        "test@example.com",
		PasswordHash: string(hashedPassword),
		IsOnboarded:  true,
	}
	testDB.Create(testUser)

	tests := []struct {
		name           string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name: "successful login",
			requestBody: map[string]interface{}{
				"email":    "test@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				if data["user"] == nil {
					t.Error("Expected user data")
				}
				if data["token"] == nil {
					t.Error("Expected token")
				}
			},
		},
		{
			name: "login with wrong password",
			requestBody: map[string]interface{}{
				"email":    "test@example.com",
				"password": "wrongpassword",
			},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name: "login with non-existent email",
			requestBody: map[string]interface{}{
				"email":    "nonexistent@example.com",
				"password": "password123",
			},
			expectedStatus: http.StatusUnauthorized,
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
			req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")

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

func TestAuthIntegration_GetMe(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user with token
	user, token := createTestUser(t, "me@example.com")

	tests := []struct {
		name           string
		authToken      string
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:           "successful get user profile",
			authToken:      token,
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}
				data := resp["data"].(map[string]interface{})
				userData := data["user"].(map[string]interface{})
				if userData["email"] != user.Email {
					t.Errorf("Expected email %s, got %s", user.Email, userData["email"])
				}
			},
		},
		{
			name:           "get profile without token",
			authToken:      "",
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if resp["success"].(bool) {
					t.Error("Expected success to be false")
				}
			},
		},
		{
			name:           "get profile with invalid token",
			authToken:      "invalid-token",
			expectedStatus: http.StatusUnauthorized,
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
			req, _ := http.NewRequest("GET", "/api/v1/auth/me", nil)
			if tt.authToken != "" {
				req.Header.Set("Authorization", "Bearer "+tt.authToken)
			}

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

func TestAuthIntegration_UpdateProfile(t *testing.T) {
	cleanDatabaseForTest(t)

	// Create test user with token
	user, token := createTestUser(t, "update@example.com")

	tests := []struct {
		name           string
		authToken      string
		requestBody    map[string]interface{}
		expectedStatus int
		checkResponse  func(t *testing.T, resp map[string]interface{})
	}{
		{
			name:      "successful profile update",
			authToken: token,
			requestBody: map[string]interface{}{
				"name": "Updated Name",
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, resp map[string]interface{}) {
				if !resp["success"].(bool) {
					t.Error("Expected success to be true")
				}

				// Verify user was updated in database
				var updatedUser models.User
				testDB.First(&updatedUser, user.ID)
				if updatedUser.Name != "Updated Name" {
					t.Errorf("Expected name 'Updated Name', got '%s'", updatedUser.Name)
				}
			},
		},
		{
			name:      "update without authentication",
			authToken: "",
			requestBody: map[string]interface{}{
				"name": "Should Fail",
			},
			expectedStatus: http.StatusUnauthorized,
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
			req, _ := http.NewRequest("PUT", "/api/v1/auth/profile", bytes.NewBuffer(jsonBody))
			req.Header.Set("Content-Type", "application/json")
			if tt.authToken != "" {
				req.Header.Set("Authorization", "Bearer "+tt.authToken)
			}

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
