package mocks

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
)

// MockAuthService is a mock implementation of AuthService
type MockAuthService struct {
	RegisterFunc           func(name, email, password string) (*models.User, string, error)
	LoginFunc              func(email, password string) (*models.User, string, error)
	GetUserByIDFunc        func(id uuid.UUID) (*models.User, error)
	UpdateProfileFunc      func(id uuid.UUID, name, email, currency string) (*models.User, error)
	ChangePasswordFunc     func(id uuid.UUID, currentPassword, newPassword string) error
	CompleteOnboardingFunc func(id uuid.UUID, monthlyIncome float64, currency string) error
}

func (m *MockAuthService) Register(name, email, password string) (*models.User, string, error) {
	if m.RegisterFunc != nil {
		return m.RegisterFunc(name, email, password)
	}
	return nil, "", nil
}

func (m *MockAuthService) Login(email, password string) (*models.User, string, error) {
	if m.LoginFunc != nil {
		return m.LoginFunc(email, password)
	}
	return nil, "", nil
}

func (m *MockAuthService) GetUserByID(id uuid.UUID) (*models.User, error) {
	if m.GetUserByIDFunc != nil {
		return m.GetUserByIDFunc(id)
	}
	return nil, nil
}

func (m *MockAuthService) UpdateProfile(id uuid.UUID, name, email, currency string) (*models.User, error) {
	if m.UpdateProfileFunc != nil {
		return m.UpdateProfileFunc(id, name, email, currency)
	}
	return nil, nil
}

func (m *MockAuthService) ChangePassword(id uuid.UUID, currentPassword, newPassword string) error {
	if m.ChangePasswordFunc != nil {
		return m.ChangePasswordFunc(id, currentPassword, newPassword)
	}
	return nil
}

func (m *MockAuthService) CompleteOnboarding(id uuid.UUID, monthlyIncome float64, currency string) error {
	if m.CompleteOnboardingFunc != nil {
		return m.CompleteOnboardingFunc(id, monthlyIncome, currency)
	}
	return nil
}
