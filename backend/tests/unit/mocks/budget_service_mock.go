package mocks

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/services"
)

// MockBudgetService is a mock implementation of BudgetService
type MockBudgetService struct {
	CreateBudgetFunc      func(userID uuid.UUID, req services.CreateBudgetRequest) (*models.Budget, error)
	GetUserBudgetsFunc    func(userID uuid.UUID) ([]*models.Budget, error)
	GetBudgetByIDFunc     func(id, userID uuid.UUID) (*models.Budget, error)
	UpdateBudgetFunc      func(id, userID uuid.UUID, req services.UpdateBudgetRequest) (*models.Budget, error)
	DeleteBudgetFunc      func(id, userID uuid.UUID) error
	CheckBudgetStatusFunc func(userID uuid.UUID) ([]*services.BudgetStatus, error)
	GetBudgetSummaryFunc  func(userID uuid.UUID) (*services.BudgetSummary, error)
}

func (m *MockBudgetService) CreateBudget(userID uuid.UUID, req services.CreateBudgetRequest) (*models.Budget, error) {
	if m.CreateBudgetFunc != nil {
		return m.CreateBudgetFunc(userID, req)
	}
	return nil, nil
}

func (m *MockBudgetService) GetUserBudgets(userID uuid.UUID) ([]*models.Budget, error) {
	if m.GetUserBudgetsFunc != nil {
		return m.GetUserBudgetsFunc(userID)
	}
	return nil, nil
}

func (m *MockBudgetService) GetBudgetByID(id, userID uuid.UUID) (*models.Budget, error) {
	if m.GetBudgetByIDFunc != nil {
		return m.GetBudgetByIDFunc(id, userID)
	}
	return nil, nil
}

func (m *MockBudgetService) UpdateBudget(id, userID uuid.UUID, req services.UpdateBudgetRequest) (*models.Budget, error) {
	if m.UpdateBudgetFunc != nil {
		return m.UpdateBudgetFunc(id, userID, req)
	}
	return nil, nil
}

func (m *MockBudgetService) DeleteBudget(id, userID uuid.UUID) error {
	if m.DeleteBudgetFunc != nil {
		return m.DeleteBudgetFunc(id, userID)
	}
	return nil
}

func (m *MockBudgetService) CheckBudgetStatus(userID uuid.UUID) ([]*services.BudgetStatus, error) {
	if m.CheckBudgetStatusFunc != nil {
		return m.CheckBudgetStatusFunc(userID)
	}
	return nil, nil
}

func (m *MockBudgetService) GetBudgetSummary(userID uuid.UUID) (*services.BudgetSummary, error) {
	if m.GetBudgetSummaryFunc != nil {
		return m.GetBudgetSummaryFunc(userID)
	}
	return nil, nil
}
