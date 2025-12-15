package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/internal/utils"
)

type BudgetHandler struct {
	budgetService services.BudgetService
}

func NewBudgetHandler(budgetService services.BudgetService) *BudgetHandler {
	return &BudgetHandler{budgetService: budgetService}
}

// Request/Response types
type CreateBudgetRequest struct {
	Category       string  `json:"category" binding:"required"`
	LimitAmount    float64 `json:"limit" binding:"required,gt=0"`
	Color          string  `json:"color" binding:"required"`
	Icon           string  `json:"icon"`
	IsRollover     bool    `json:"is_rollover"`
	Type           string  `json:"type" binding:"omitempty,oneof=Fixed Variable"`
	AlertThreshold int     `json:"alert_threshold" binding:"omitempty,gte=0,lte=100"`
}

type UpdateBudgetRequest struct {
	Category       string  `json:"category"`
	LimitAmount    float64 `json:"limit" binding:"omitempty,gt=0"`
	Color          string  `json:"color"`
	Icon           string  `json:"icon"`
	IsRollover     *bool   `json:"is_rollover"`
	Type           string  `json:"type" binding:"omitempty,oneof=Fixed Variable"`
	AlertThreshold *int    `json:"alert_threshold" binding:"omitempty,gte=0,lte=100"`
}

// ListBudgets godoc
// @Summary List budgets
// @Description Get all budgets for the authenticated user
// @Tags budgets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=object{budgets=[]models.Budget}}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /budgets [get]
func (h *BudgetHandler) ListBudgets(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	budgets, err := h.budgetService.GetUserBudgets(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "FETCH_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"budgets": budgets,
	})
}

// GetBudget godoc
// @Summary Get budget
// @Description Get a single budget by ID
// @Tags budgets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Budget ID"
// @Success 200 {object} utils.Response{data=object{budget=models.Budget}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Router /budgets/{id} [get]
func (h *BudgetHandler) GetBudget(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid budget ID")
		return
	}

	budget, err := h.budgetService.GetBudgetByID(id, userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "NOT_FOUND", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"budget": budget,
	})
}

// CreateBudget godoc
// @Summary Create budget
// @Description Create a new budget with spending limit
// @Tags budgets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateBudgetRequest true "Budget data"
// @Success 201 {object} utils.Response{data=object{budget=models.Budget}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /budgets [post]
func (h *BudgetHandler) CreateBudget(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	var req CreateBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	serviceReq := services.CreateBudgetRequest{
		Category:       req.Category,
		LimitAmount:    req.LimitAmount,
		Color:          req.Color,
		Icon:           req.Icon,
		IsRollover:     req.IsRollover,
		Type:           req.Type,
		AlertThreshold: req.AlertThreshold,
	}

	budget, err := h.budgetService.CreateBudget(userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, gin.H{
		"budget": budget,
	})
}

// UpdateBudget godoc
// @Summary Update budget
// @Description Update an existing budget
// @Tags budgets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Budget ID"
// @Param request body UpdateBudgetRequest true "Budget update data"
// @Success 200 {object} utils.Response{data=object{budget=models.Budget}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /budgets/{id} [put]
func (h *BudgetHandler) UpdateBudget(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid budget ID")
		return
	}

	var req UpdateBudgetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	serviceReq := services.UpdateBudgetRequest{
		Category:       req.Category,
		LimitAmount:    req.LimitAmount,
		Color:          req.Color,
		Icon:           req.Icon,
		IsRollover:     req.IsRollover,
		Type:           req.Type,
		AlertThreshold: req.AlertThreshold,
	}

	budget, err := h.budgetService.UpdateBudget(id, userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "UPDATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"budget": budget,
	})
}

// DeleteBudget godoc
// @Summary Delete budget
// @Description Delete a budget
// @Tags budgets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Budget ID"
// @Success 204 "No Content"
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /budgets/{id} [delete]
func (h *BudgetHandler) DeleteBudget(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid budget ID")
		return
	}

	if err := h.budgetService.DeleteBudget(id, userID); err != nil {
		utils.Error(c, http.StatusBadRequest, "DELETE_FAILED", err.Error())
		return
	}

	c.Status(http.StatusNoContent)
}

// GetBudgetSummary godoc
// @Summary Get budget summary
// @Description Get overall budget summary and spending for the current month
// @Tags budgets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=object{summary=object}}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /budgets/summary [get]
func (h *BudgetHandler) GetBudgetSummary(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	summary, err := h.budgetService.GetBudgetSummary(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "SUMMARY_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"summary": summary,
	})
}
