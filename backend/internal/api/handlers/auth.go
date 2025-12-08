package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/internal/utils"
)

type AuthHandler struct {
	authService services.AuthService
}

func NewAuthHandler(authService services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// Request/Response types
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type UpdateProfileRequest struct {
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required,email"`
}

type OnboardingRequest struct {
	MonthlyIncome  float64  `json:"monthly_income" binding:"required,min=0"`
	Currency       string   `json:"currency" binding:"required,len=3"`
	FinancialGoals []string `json:"financial_goals"`
}

// Register creates a new user account
// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	user, token, err := h.authService.Register(req.Name, req.Email, req.Password)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "REGISTER_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, gin.H{
		"user":  user,
		"token": token,
	})
}

// Login authenticates a user and returns a JWT token
// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	user, token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "INVALID_CREDENTIALS", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"user":  user,
		"token": token,
	})
}

// GetMe returns the current authenticated user's profile
// GET /api/v1/auth/me
func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "USER_NOT_FOUND", "User not found")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"user": user,
	})
}

// UpdateProfile updates the current user's profile
// PUT /api/v1/auth/profile
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	user, err := h.authService.UpdateProfile(userID, req.Name, req.Email)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "UPDATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"user": user,
	})
}

// CompleteOnboarding marks the user's onboarding as complete
// POST /api/v1/auth/onboarding
func (h *AuthHandler) CompleteOnboarding(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	var req OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	if err := h.authService.CompleteOnboarding(userID, req.MonthlyIncome, req.Currency); err != nil {
		utils.Error(c, http.StatusBadRequest, "ONBOARDING_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"message": "Onboarding completed successfully",
	})
}
