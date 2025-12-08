package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/internal/utils"
)

type GoalHandler struct {
	goalService services.GoalService
}

func NewGoalHandler(goalService services.GoalService) *GoalHandler {
	return &GoalHandler{goalService: goalService}
}

// Request/Response types
type CreateGoalRequest struct {
	Name          string     `json:"name" binding:"required"`
	TargetAmount  float64    `json:"target" binding:"required,gt=0"`
	CurrentAmount float64    `json:"current" binding:"omitempty,gte=0"`
	Color         string     `json:"color" binding:"required"`
	Icon          string     `json:"icon"`
	Deadline      *time.Time `json:"deadline"`
	Priority      string     `json:"priority" binding:"omitempty,oneof=High Medium Low"`
	Category      string     `json:"category"`
	Status        string     `json:"status" binding:"omitempty,oneof=Active Paused Completed"`
}

type UpdateGoalRequest struct {
	Name          string     `json:"name"`
	TargetAmount  float64    `json:"target" binding:"omitempty,gt=0"`
	CurrentAmount float64    `json:"current" binding:"omitempty,gte=0"`
	Color         string     `json:"color"`
	Icon          string     `json:"icon"`
	Deadline      *time.Time `json:"deadline"`
	Priority      string     `json:"priority" binding:"omitempty,oneof=High Medium Low"`
	Category      string     `json:"category"`
	Status        string     `json:"status" binding:"omitempty,oneof=Active Paused Completed"`
}

type UpdateProgressRequest struct {
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

// ListGoals gets all savings goals for the authenticated user
// GET /api/v1/goals
func (h *GoalHandler) ListGoals(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	goals, err := h.goalService.GetUserGoals(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "FETCH_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"goals": goals,
	})
}

// GetGoal gets a single goal by ID
// GET /api/v1/goals/:id
func (h *GoalHandler) GetGoal(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid goal ID")
		return
	}

	goal, err := h.goalService.GetGoalByID(id, userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "NOT_FOUND", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"goal": goal,
	})
}

// CreateGoal creates a new savings goal
// POST /api/v1/goals
func (h *GoalHandler) CreateGoal(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	var req CreateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	serviceReq := services.CreateGoalRequest{
		Name:          req.Name,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: req.CurrentAmount,
		Color:         req.Color,
		Icon:          req.Icon,
		Deadline:      req.Deadline,
		Priority:      req.Priority,
		Category:      req.Category,
		Status:        req.Status,
	}

	goal, err := h.goalService.CreateGoal(userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, gin.H{
		"goal": goal,
	})
}

// UpdateGoal updates a savings goal
// PUT /api/v1/goals/:id
func (h *GoalHandler) UpdateGoal(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid goal ID")
		return
	}

	var req UpdateGoalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	serviceReq := services.UpdateGoalRequest{
		Name:          req.Name,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: req.CurrentAmount,
		Color:         req.Color,
		Icon:          req.Icon,
		Deadline:      req.Deadline,
		Priority:      req.Priority,
		Category:      req.Category,
		Status:        req.Status,
	}

	goal, err := h.goalService.UpdateGoal(id, userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "UPDATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"goal": goal,
	})
}

// UpdateProgress adds funds to a savings goal
// PATCH /api/v1/goals/:id/progress
func (h *GoalHandler) UpdateProgress(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid goal ID")
		return
	}

	var req UpdateProgressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	goal, err := h.goalService.AddProgress(id, userID, req.Amount)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "UPDATE_PROGRESS_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"goal": goal,
	})
}

// DeleteGoal deletes a savings goal
// DELETE /api/v1/goals/:id
func (h *GoalHandler) DeleteGoal(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid goal ID")
		return
	}

	if err := h.goalService.DeleteGoal(id, userID); err != nil {
		utils.Error(c, http.StatusBadRequest, "DELETE_FAILED", err.Error())
		return
	}

	c.Status(http.StatusNoContent)
}
