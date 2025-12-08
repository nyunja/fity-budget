package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
)

// GoalService defines the interface for savings goal operations
type GoalService interface {
	CreateGoal(userID uuid.UUID, req CreateGoalRequest) (*models.SavingGoal, error)
	GetUserGoals(userID uuid.UUID) ([]*models.SavingGoal, error)
	GetGoalByID(id, userID uuid.UUID) (*models.SavingGoal, error)
	UpdateGoal(id, userID uuid.UUID, req UpdateGoalRequest) (*models.SavingGoal, error)
	DeleteGoal(id, userID uuid.UUID) error
	AddProgress(id, userID uuid.UUID, amount float64) (*models.SavingGoal, error)
	GetGoalProgress(userID uuid.UUID) (*GoalProgressSummary, error)
}

type goalService struct {
	goalRepo repository.GoalRepository
}

// CreateGoalRequest represents the data needed to create a savings goal
type CreateGoalRequest struct {
	Name          string     `json:"name" binding:"required"`
	TargetAmount  float64    `json:"target_amount" binding:"required,gt=0"`
	CurrentAmount float64    `json:"current_amount" binding:"omitempty,gte=0"`
	Color         string     `json:"color" binding:"required"`
	Icon          string     `json:"icon"`
	Deadline      *time.Time `json:"deadline"`
	Priority      string     `json:"priority" binding:"omitempty,oneof=High Medium Low"`
	Category      string     `json:"category"`
	Status        string     `json:"status" binding:"omitempty,oneof=Active Paused Completed"`
}

// UpdateGoalRequest represents the data needed to update a savings goal
type UpdateGoalRequest struct {
	Name          string     `json:"name"`
	TargetAmount  float64    `json:"target_amount" binding:"omitempty,gt=0"`
	CurrentAmount float64    `json:"current_amount" binding:"omitempty,gte=0"`
	Color         string     `json:"color"`
	Icon          string     `json:"icon"`
	Deadline      *time.Time `json:"deadline"`
	Priority      string     `json:"priority" binding:"omitempty,oneof=High Medium Low"`
	Category      string     `json:"category"`
	Status        string     `json:"status" binding:"omitempty,oneof=Active Paused Completed"`
}

// GoalProgressSummary represents overall progress for all user goals
type GoalProgressSummary struct {
	TotalGoals      int     `json:"total_goals"`
	CompletedGoals  int     `json:"completed_goals"`
	ActiveGoals     int     `json:"active_goals"`
	TotalTarget     float64 `json:"total_target"`
	TotalSaved      float64 `json:"total_saved"`
	OverallProgress float64 `json:"overall_progress"`
}

func NewGoalService(goalRepo repository.GoalRepository) GoalService {
	return &goalService{
		goalRepo: goalRepo,
	}
}

// CreateGoal creates a new savings goal
func (s *goalService) CreateGoal(userID uuid.UUID, req CreateGoalRequest) (*models.SavingGoal, error) {
	// Validate deadline is in the future if provided
	if req.Deadline != nil && req.Deadline.Before(time.Now()) {
		return nil, errors.New("deadline must be in the future")
	}

	// Set default priority if not provided
	priority := req.Priority
	if priority == "" {
		priority = "Medium"
	}

	// Set default status if not provided
	status := req.Status
	if status == "" {
		status = "Active"
	}

	// Validate current amount doesn't exceed target
	if req.CurrentAmount > req.TargetAmount {
		return nil, errors.New("current amount cannot exceed target amount")
	}

	// Auto-complete if current amount reaches target
	if req.CurrentAmount >= req.TargetAmount {
		status = "Completed"
	}

	goal := models.SavingGoal{
		UserID:        userID,
		Name:          req.Name,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: req.CurrentAmount,
		Color:         req.Color,
		Icon:          req.Icon,
		Deadline:      req.Deadline,
		Priority:      priority,
		Category:      req.Category,
		Status:        status,
	}

	if err := s.goalRepo.Create(&goal); err != nil {
		return nil, err
	}

	return &goal, nil
}

// GetUserGoals retrieves all savings goals for a specific user
func (s *goalService) GetUserGoals(userID uuid.UUID) ([]*models.SavingGoal, error) {
	goals, err := s.goalRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	return goals, nil
}

// GetGoalByID retrieves a specific savings goal by ID
func (s *goalService) GetGoalByID(id, userID uuid.UUID) (*models.SavingGoal, error) {
	goal, err := s.goalRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("goal not found")
	}

	// Verify goal belongs to user
	if goal.UserID != userID {
		return nil, errors.New("unauthorized access to goal")
	}

	return goal, nil
}

// UpdateGoal updates an existing savings goal
func (s *goalService) UpdateGoal(id, userID uuid.UUID, req UpdateGoalRequest) (*models.SavingGoal, error) {
	goal, err := s.goalRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("goal not found")
	}

	// Verify goal belongs to user
	if goal.UserID != userID {
		return nil, errors.New("unauthorized access to goal")
	}

	// Update fields if provided
	if req.Name != "" {
		goal.Name = req.Name
	}
	if req.TargetAmount > 0 {
		goal.TargetAmount = req.TargetAmount
	}
	if req.CurrentAmount >= 0 {
		// Validate current amount doesn't exceed target
		if req.CurrentAmount > goal.TargetAmount {
			return nil, errors.New("current amount cannot exceed target amount")
		}
		goal.CurrentAmount = req.CurrentAmount
	}
	if req.Color != "" {
		goal.Color = req.Color
	}
	if req.Icon != "" {
		goal.Icon = req.Icon
	}
	if req.Deadline != nil {
		// Validate deadline if goal is not completed
		if goal.Status != "Completed" && req.Deadline.Before(time.Now()) {
			return nil, errors.New("deadline must be in the future")
		}
		goal.Deadline = req.Deadline
	}
	if req.Priority != "" {
		goal.Priority = req.Priority
	}
	if req.Category != "" {
		goal.Category = req.Category
	}
	if req.Status != "" {
		goal.Status = req.Status
	}

	// Auto-complete if current amount reaches target
	if goal.CurrentAmount >= goal.TargetAmount {
		goal.Status = "Completed"
	}

	if err := s.goalRepo.Update(goal); err != nil {
		return nil, err
	}

	return goal, nil
}

// DeleteGoal deletes a savings goal
func (s *goalService) DeleteGoal(id, userID uuid.UUID) error {
	goal, err := s.goalRepo.FindByID(id)
	if err != nil {
		return errors.New("goal not found")
	}

	// Verify goal belongs to user
	if goal.UserID != userID {
		return errors.New("unauthorized access to goal")
	}

	if err := s.goalRepo.Delete(id); err != nil {
		return err
	}

	return nil
}

// AddProgress adds an amount to the goal's current progress
func (s *goalService) AddProgress(id, userID uuid.UUID, amount float64) (*models.SavingGoal, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be greater than zero")
	}

	goal, err := s.goalRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("goal not found")
	}

	// Verify goal belongs to user
	if goal.UserID != userID {
		return nil, errors.New("unauthorized access to goal")
	}

	// Don't allow adding progress to completed goals
	if goal.Status == "Completed" {
		return nil, errors.New("cannot add progress to completed goal")
	}

	// Update progress using repository method
	if err := s.goalRepo.UpdateProgress(id, amount); err != nil {
		return nil, err
	}

	// Fetch updated goal
	updatedGoal, err := s.goalRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Auto-complete if current amount reaches or exceeds target
	if updatedGoal.CurrentAmount >= updatedGoal.TargetAmount {
		updatedGoal.Status = "Completed"
		if err := s.goalRepo.Update(updatedGoal); err != nil {
			return nil, err
		}
	}

	return updatedGoal, nil
}

// GetGoalProgress calculates overall progress for all user goals
func (s *goalService) GetGoalProgress(userID uuid.UUID) (*GoalProgressSummary, error) {
	goals, err := s.goalRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	summary := &GoalProgressSummary{
		TotalGoals: len(goals),
	}

	for _, goal := range goals {
		if goal.Status == "Completed" {
			summary.CompletedGoals++
		} else {
			summary.ActiveGoals++
		}

		summary.TotalTarget += goal.TargetAmount
		summary.TotalSaved += goal.CurrentAmount
	}

	// Calculate overall progress percentage
	if summary.TotalTarget > 0 {
		summary.OverallProgress = (summary.TotalSaved / summary.TotalTarget) * 100
	}

	return summary, nil
}
