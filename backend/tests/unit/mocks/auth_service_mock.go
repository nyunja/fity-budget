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
	UpdateProfileFunc      func(id uuid.UUID, name, email string) (*models.User, error)
	CompleteOnboardingFunc func(id uuid.UUID) error
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

func (m *MockAuthService) UpdateProfile(id uuid.UUID, name, email string) (*models.User, error) {
	if m.UpdateProfileFunc != nil {
		return m.UpdateProfileFunc(id, name, email)
	}
	return nil, nil
}

func (m *MockAuthService) CompleteOnboarding(id uuid.UUID) error {
	if m.CompleteOnboardingFunc != nil {
		return m.CompleteOnboardingFunc(id)
	}
	return nil
}
