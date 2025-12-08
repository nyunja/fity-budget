package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
)

// BudgetService defines the interface for budget operations
type BudgetService interface {
	CreateBudget(userID uuid.UUID, req CreateBudgetRequest) (*models.Budget, error)
	GetUserBudgets(userID uuid.UUID) ([]*models.Budget, error)
	GetBudgetByID(id, userID uuid.UUID) (*models.Budget, error)
	UpdateBudget(id, userID uuid.UUID, req UpdateBudgetRequest) (*models.Budget, error)
	DeleteBudget(id, userID uuid.UUID) error
	CheckBudgetStatus(userID uuid.UUID) ([]*BudgetStatus, error)
	GetBudgetSummary(userID uuid.UUID) (*BudgetSummary, error)
}

type budgetService struct {
	budgetRepo      repository.BudgetRepository
	transactionRepo repository.TransactionRepository
}

// CreateBudgetRequest represents the data needed to create a budget
type CreateBudgetRequest struct {
	Category       string `json:"category" binding:"required"`
	LimitAmount    float64 `json:"limit_amount" binding:"required,gt=0"`
	Color          string `json:"color" binding:"required"`
	Icon           string `json:"icon"`
	IsRollover     bool   `json:"is_rollover"`
	Type           string `json:"type" binding:"omitempty,oneof=Fixed Variable"`
	AlertThreshold int    `json:"alert_threshold" binding:"omitempty,gte=0,lte=100"`
}

// UpdateBudgetRequest represents the data needed to update a budget
type UpdateBudgetRequest struct {
	Category       string  `json:"category"`
	LimitAmount    float64 `json:"limit_amount" binding:"omitempty,gt=0"`
	Color          string  `json:"color"`
	Icon           string  `json:"icon"`
	IsRollover     *bool   `json:"is_rollover"`
	Type           string  `json:"type" binding:"omitempty,oneof=Fixed Variable"`
	AlertThreshold *int    `json:"alert_threshold" binding:"omitempty,gte=0,lte=100"`
}

// BudgetStatus represents the spending status of a budget
type BudgetStatus struct {
	BudgetID        uuid.UUID `json:"budget_id"`
	Category        string    `json:"category"`
	LimitAmount     float64   `json:"limit_amount"`
	SpentAmount     float64   `json:"spent_amount"`
	RemainingAmount float64   `json:"remaining_amount"`
	PercentageUsed  float64   `json:"percentage_used"`
	IsOverBudget    bool      `json:"is_over_budget"`
	IsNearLimit     bool      `json:"is_near_limit"`
	AlertThreshold  int       `json:"alert_threshold"`
}

// BudgetSummary represents overall budget summary for a user
type BudgetSummary struct {
	TotalBudgets    int     `json:"total_budgets"`
	TotalLimit      float64 `json:"total_limit"`
	TotalSpent      float64 `json:"total_spent"`
	TotalRemaining  float64 `json:"total_remaining"`
	OverBudgetCount int     `json:"over_budget_count"`
	NearLimitCount  int     `json:"near_limit_count"`
}

func NewBudgetService(budgetRepo repository.BudgetRepository, transactionRepo repository.TransactionRepository) BudgetService {
	return &budgetService{
		budgetRepo:      budgetRepo,
		transactionRepo: transactionRepo,
	}
}

// CreateBudget creates a new budget
func (s *budgetService) CreateBudget(userID uuid.UUID, req CreateBudgetRequest) (*models.Budget, error) {
	// Check if budget already exists for this category and user
	existingBudget, _ := s.budgetRepo.FindByUserIDAndCategory(userID, req.Category)
	if existingBudget != nil {
		return nil, errors.New("budget already exists for this category")
	}

	// Set default alert threshold if not provided (80%)
	alertThreshold := req.AlertThreshold
	if alertThreshold == 0 {
		alertThreshold = 80
	}

	// Set default type if not provided
	budgetType := req.Type
	if budgetType == "" {
		budgetType = "Variable"
	}

	budget := models.Budget{
		UserID:         userID,
		Category:       req.Category,
		LimitAmount:    req.LimitAmount,
		Color:          req.Color,
		Icon:           req.Icon,
		IsRollover:     req.IsRollover,
		Type:           budgetType,
		AlertThreshold: alertThreshold,
	}

	if err := s.budgetRepo.Create(&budget); err != nil {
		return nil, err
	}

	return &budget, nil
}

// GetUserBudgets retrieves all budgets for a specific user
func (s *budgetService) GetUserBudgets(userID uuid.UUID) ([]*models.Budget, error) {
	budgets, err := s.budgetRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	return budgets, nil
}

// GetBudgetByID retrieves a specific budget by ID
func (s *budgetService) GetBudgetByID(id, userID uuid.UUID) (*models.Budget, error) {
	budget, err := s.budgetRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("budget not found")
	}

	// Verify budget belongs to user
	if budget.UserID != userID {
		return nil, errors.New("unauthorized access to budget")
	}

	return budget, nil
}

// UpdateBudget updates an existing budget
func (s *budgetService) UpdateBudget(id, userID uuid.UUID, req UpdateBudgetRequest) (*models.Budget, error) {
	budget, err := s.budgetRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("budget not found")
	}

	// Verify budget belongs to user
	if budget.UserID != userID {
		return nil, errors.New("unauthorized access to budget")
	}

	// Update fields if provided
	if req.Category != "" {
		// Check if new category already has a budget
		if req.Category != budget.Category {
			existingBudget, _ := s.budgetRepo.FindByUserIDAndCategory(userID, req.Category)
			if existingBudget != nil {
				return nil, errors.New("budget already exists for this category")
			}
		}
		budget.Category = req.Category
	}
	if req.LimitAmount > 0 {
		budget.LimitAmount = req.LimitAmount
	}
	if req.Color != "" {
		budget.Color = req.Color
	}
	if req.Icon != "" {
		budget.Icon = req.Icon
	}
	if req.IsRollover != nil {
		budget.IsRollover = *req.IsRollover
	}
	if req.Type != "" {
		budget.Type = req.Type
	}
	if req.AlertThreshold != nil {
		budget.AlertThreshold = *req.AlertThreshold
	}

	if err := s.budgetRepo.Update(budget); err != nil {
		return nil, err
	}

	return budget, nil
}

// DeleteBudget deletes a budget
func (s *budgetService) DeleteBudget(id, userID uuid.UUID) error {
	budget, err := s.budgetRepo.FindByID(id)
	if err != nil {
		return errors.New("budget not found")
	}

	// Verify budget belongs to user
	if budget.UserID != userID {
		return errors.New("unauthorized access to budget")
	}

	if err := s.budgetRepo.Delete(id); err != nil {
		return err
	}

	return nil
}

// CheckBudgetStatus checks the spending status of all user budgets
func (s *budgetService) CheckBudgetStatus(userID uuid.UUID) ([]*BudgetStatus, error) {
	budgets, err := s.budgetRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	var statuses []*BudgetStatus

	// Get current month date range (default period)
	now := time.Now()
	startDate := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endDate := startDate.AddDate(0, 1, 0)

	for _, budget := range budgets {
		// Get transactions for this category
		allTransactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
		if err != nil {
			return nil, err
		}

		// Calculate spent amount for this category in the period
		var spentAmount float64
		for _, txn := range allTransactions {
			// Only count transactions that are completed and match category and date range
			// Note: Transaction model doesn't have Type field, so we count all transactions
			if txn.Status == "Completed" &&
				txn.Category == budget.Category &&
				txn.TransactionDate.After(startDate) &&
				txn.TransactionDate.Before(endDate) {
				spentAmount += txn.Amount
			}
		}

		// Calculate status metrics
		remainingAmount := budget.LimitAmount - spentAmount
		percentageUsed := (spentAmount / budget.LimitAmount) * 100
		isOverBudget := spentAmount > budget.LimitAmount
		isNearLimit := percentageUsed >= float64(budget.AlertThreshold) && !isOverBudget

		status := &BudgetStatus{
			BudgetID:        budget.ID,
			Category:        budget.Category,
			LimitAmount:     budget.LimitAmount,
			SpentAmount:     spentAmount,
			RemainingAmount: remainingAmount,
			PercentageUsed:  percentageUsed,
			IsOverBudget:    isOverBudget,
			IsNearLimit:     isNearLimit,
			AlertThreshold:  budget.AlertThreshold,
		}

		statuses = append(statuses, status)
	}

	return statuses, nil
}

// GetBudgetSummary returns an overall budget summary for a user
func (s *budgetService) GetBudgetSummary(userID uuid.UUID) (*BudgetSummary, error) {
	statuses, err := s.CheckBudgetStatus(userID)
	if err != nil {
		return nil, err
	}

	summary := &BudgetSummary{
		TotalBudgets: len(statuses),
	}

	for _, status := range statuses {
		summary.TotalLimit += status.LimitAmount
		summary.TotalSpent += status.SpentAmount
		summary.TotalRemaining += status.RemainingAmount

		if status.IsOverBudget {
			summary.OverBudgetCount++
		}
		if status.IsNearLimit {
			summary.NearLimitCount++
		}
	}

	return summary, nil
}

