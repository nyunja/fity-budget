package mocks

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/services"
)

// MockGoalService is a mock implementation of GoalService
type MockGoalService struct {
	CreateGoalFunc     func(userID uuid.UUID, req services.CreateGoalRequest) (*models.SavingGoal, error)
	GetUserGoalsFunc   func(userID uuid.UUID) ([]*models.SavingGoal, error)
	GetGoalByIDFunc    func(id, userID uuid.UUID) (*models.SavingGoal, error)
	UpdateGoalFunc     func(id, userID uuid.UUID, req services.UpdateGoalRequest) (*models.SavingGoal, error)
	DeleteGoalFunc     func(id, userID uuid.UUID) error
	AddProgressFunc    func(id, userID uuid.UUID, amount float64) (*models.SavingGoal, error)
	GetGoalProgressFunc func(userID uuid.UUID) (*services.GoalProgressSummary, error)
}

func (m *MockGoalService) CreateGoal(userID uuid.UUID, req services.CreateGoalRequest) (*models.SavingGoal, error) {
	if m.CreateGoalFunc != nil {
		return m.CreateGoalFunc(userID, req)
	}
	return nil, nil
}

func (m *MockGoalService) GetUserGoals(userID uuid.UUID) ([]*models.SavingGoal, error) {
	if m.GetUserGoalsFunc != nil {
		return m.GetUserGoalsFunc(userID)
	}
	return nil, nil
}

func (m *MockGoalService) GetGoalByID(id, userID uuid.UUID) (*models.SavingGoal, error) {
	if m.GetGoalByIDFunc != nil {
		return m.GetGoalByIDFunc(id, userID)
	}
	return nil, nil
}

func (m *MockGoalService) UpdateGoal(id, userID uuid.UUID, req services.UpdateGoalRequest) (*models.SavingGoal, error) {
	if m.UpdateGoalFunc != nil {
		return m.UpdateGoalFunc(id, userID, req)
	}
	return nil, nil
}

func (m *MockGoalService) DeleteGoal(id, userID uuid.UUID) error {
	if m.DeleteGoalFunc != nil {
		return m.DeleteGoalFunc(id, userID)
	}
	return nil
}

func (m *MockGoalService) AddProgress(id, userID uuid.UUID, amount float64) (*models.SavingGoal, error) {
	if m.AddProgressFunc != nil {
		return m.AddProgressFunc(id, userID, amount)
	}
	return nil, nil
}

func (m *MockGoalService) GetGoalProgress(userID uuid.UUID) (*services.GoalProgressSummary, error) {
	if m.GetGoalProgressFunc != nil {
		return m.GetGoalProgressFunc(userID)
	}
	return nil, nil
}
