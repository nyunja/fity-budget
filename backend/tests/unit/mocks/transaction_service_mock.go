package mocks

import (
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/services"
)

// MockTransactionService is a mock implementation of TransactionService
type MockTransactionService struct {
	CreateTransactionFunc   func(userID uuid.UUID, req services.CreateTransactionRequest) (*models.Transaction, error)
	GetUserTransactionsFunc func(userID uuid.UUID, limit, offset int) ([]*models.Transaction, error)
	GetTransactionByIDFunc  func(id, userID uuid.UUID) (*models.Transaction, error)
	UpdateTransactionFunc   func(id, userID uuid.UUID, req services.UpdateTransactionRequest) (*models.Transaction, error)
	DeleteTransactionFunc   func(id, userID uuid.UUID) error
	GetTransactionStatsFunc func(userID uuid.UUID, startDate, endDate time.Time) (*services.TransactionStats, error)
}

func (m *MockTransactionService) CreateTransaction(userID uuid.UUID, req services.CreateTransactionRequest) (*models.Transaction, error) {
	if m.CreateTransactionFunc != nil {
		return m.CreateTransactionFunc(userID, req)
	}
	return nil, nil
}

func (m *MockTransactionService) GetUserTransactions(userID uuid.UUID, limit, offset int) ([]*models.Transaction, error) {
	if m.GetUserTransactionsFunc != nil {
		return m.GetUserTransactionsFunc(userID, limit, offset)
	}
	return nil, nil
}

func (m *MockTransactionService) GetTransactionByID(id, userID uuid.UUID) (*models.Transaction, error) {
	if m.GetTransactionByIDFunc != nil {
		return m.GetTransactionByIDFunc(id, userID)
	}
	return nil, nil
}

func (m *MockTransactionService) UpdateTransaction(id, userID uuid.UUID, req services.UpdateTransactionRequest) (*models.Transaction, error) {
	if m.UpdateTransactionFunc != nil {
		return m.UpdateTransactionFunc(id, userID, req)
	}
	return nil, nil
}

func (m *MockTransactionService) DeleteTransaction(id, userID uuid.UUID) error {
	if m.DeleteTransactionFunc != nil {
		return m.DeleteTransactionFunc(id, userID)
	}
	return nil
}

func (m *MockTransactionService) GetTransactionStats(userID uuid.UUID, startDate, endDate time.Time) (*services.TransactionStats, error) {
	if m.GetTransactionStatsFunc != nil {
		return m.GetTransactionStatsFunc(userID, startDate, endDate)
	}
	return nil, nil
}
