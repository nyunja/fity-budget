package testutils

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SetupTestRouter creates a Gin router for testing
func SetupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

// MakeRequest creates a test HTTP request and returns the response recorder
func MakeRequest(router *gin.Engine, method, path string, body interface{}, headers map[string]string) *httptest.ResponseRecorder {
	var reqBody *bytes.Buffer
	if body != nil {
		jsonBytes, _ := json.Marshal(body)
		reqBody = bytes.NewBuffer(jsonBytes)
	} else {
		reqBody = bytes.NewBuffer([]byte{})
	}

	req, _ := http.NewRequest(method, path, reqBody)
	req.Header.Set("Content-Type", "application/json")

	// Add custom headers
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	return w
}

// GenerateTestUUID generates a new UUID for testing
func GenerateTestUUID() uuid.UUID {
	return uuid.New()
}

// ParseJSONResponse parses JSON response body into target
func ParseJSONResponse(w *httptest.ResponseRecorder, target interface{}) error {
	return json.Unmarshal(w.Body.Bytes(), target)
}

// TestUserID is a constant test user ID
var TestUserID = uuid.MustParse("550e8400-e29b-41d4-a716-446655440000")

// TestWalletID is a constant test wallet ID
var TestWalletID = uuid.MustParse("880e8400-e29b-41d4-a716-446655440001")

// TestGoalID is a constant test goal ID
var TestGoalID = uuid.MustParse("660e8400-e29b-41d4-a716-446655440001")

// TestBudgetID is a constant test budget ID
var TestBudgetID = uuid.MustParse("440e8400-e29b-41d4-a716-446655440001")

// TestTransactionID is a constant test transaction ID
var TestTransactionID = uuid.MustParse("770e8400-e29b-41d4-a716-446655440000")
