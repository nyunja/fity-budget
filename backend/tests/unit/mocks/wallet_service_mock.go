package mocks

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/services"
)

// MockWalletService is a mock implementation of WalletService
type MockWalletService struct {
	CreateWalletFunc           func(userID uuid.UUID, req services.CreateWalletRequest) (*models.Wallet, error)
	GetUserWalletsFunc         func(userID uuid.UUID) ([]*models.Wallet, error)
	GetWalletByIDFunc          func(id, userID uuid.UUID) (*models.Wallet, error)
	GetDefaultWalletFunc       func(userID uuid.UUID) (*models.Wallet, error)
	UpdateWalletFunc           func(id, userID uuid.UUID, req services.UpdateWalletRequest) (*models.Wallet, error)
	DeleteWalletFunc           func(id, userID uuid.UUID) error
	SetDefaultWalletFunc       func(id, userID uuid.UUID) (*models.Wallet, error)
	TransferBetweenWalletsFunc func(fromWalletID, toWalletID, userID uuid.UUID, amount float64) error
}

func (m *MockWalletService) CreateWallet(userID uuid.UUID, req services.CreateWalletRequest) (*models.Wallet, error) {
	if m.CreateWalletFunc != nil {
		return m.CreateWalletFunc(userID, req)
	}
	return nil, nil
}

func (m *MockWalletService) GetUserWallets(userID uuid.UUID) ([]*models.Wallet, error) {
	if m.GetUserWalletsFunc != nil {
		return m.GetUserWalletsFunc(userID)
	}
	return nil, nil
}

func (m *MockWalletService) GetWalletByID(id, userID uuid.UUID) (*models.Wallet, error) {
	if m.GetWalletByIDFunc != nil {
		return m.GetWalletByIDFunc(id, userID)
	}
	return nil, nil
}

func (m *MockWalletService) UpdateWallet(id, userID uuid.UUID, req services.UpdateWalletRequest) (*models.Wallet, error) {
	if m.UpdateWalletFunc != nil {
		return m.UpdateWalletFunc(id, userID, req)
	}
	return nil, nil
}

func (m *MockWalletService) GetDefaultWallet(userID uuid.UUID) (*models.Wallet, error) {
	if m.GetDefaultWalletFunc != nil {
		return m.GetDefaultWalletFunc(userID)
	}
	return nil, nil
}

func (m *MockWalletService) DeleteWallet(id, userID uuid.UUID) error {
	if m.DeleteWalletFunc != nil {
		return m.DeleteWalletFunc(id, userID)
	}
	return nil
}

func (m *MockWalletService) SetDefaultWallet(id, userID uuid.UUID) (*models.Wallet, error) {
	if m.SetDefaultWalletFunc != nil {
		return m.SetDefaultWalletFunc(id, userID)
	}
	return nil, nil
}

func (m *MockWalletService) TransferBetweenWallets(fromWalletID, toWalletID, userID uuid.UUID, amount float64) error {
	if m.TransferBetweenWalletsFunc != nil {
		return m.TransferBetweenWalletsFunc(fromWalletID, toWalletID, userID, amount)
	}
	return nil
}
