package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
	"github.com/nyunja/fity-budget-backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

// AuthService defines the interface for authentication operations
type AuthService interface {
	Register(name, email, password string) (*models.User, string, error)
	Login(email, password string) (*models.User, string, error)
	GetUserByID(id uuid.UUID) (*models.User, error)
	UpdateProfile(id uuid.UUID, name, email string) (*models.User, error)
	CompleteOnboarding(id uuid.UUID) error
}

type authService struct {
	userRepo  repository.UserRepository
	jwtSecret string
	jwtExpiry time.Duration
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string, jwtExpiry time.Duration) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

// Register creates a new user account
func (s *authService) Register(name, email, password string) (*models.User, string, error) {
	existingUser, _ := s.userRepo.FindByEmail(email)
	if existingUser != nil {
		return nil, "", errors.New("email already exists")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}
	user := models.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hashedPassword),
		IsOnboarded:  false,
	}

	if err := s.userRepo.Create(&user); err != nil {
		return nil, "", err
	}
	token, err := utils.GenerateJWT(user.ID, user.Email, s.jwtSecret, s.jwtExpiry)
	if err != nil {
		return nil, "", err
	}
	user.PasswordHash = ""
	return &user, token, nil
}

func (s *authService) Login(email, password string) (*models.User, string, error) {
	user, err := s.userRepo.FindByEmail(email)
	if err != nil {
		return nil, "", err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, "", err
	}
	token, err := utils.GenerateJWT(user.ID, user.Email, s.jwtSecret, s.jwtExpiry)
	if err != nil {
		return nil, "", err
	}
	user.PasswordHash = ""
	return user, token, nil
}

func (s *authService) GetUserByID(id uuid.UUID) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	user.PasswordHash = ""
	return user, nil
}

func (s *authService) UpdateProfile(id uuid.UUID, name, email string) (*models.User, error) {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}
	if email != user.Email {
		existingUser, _ := s.userRepo.FindByEmail(email)
		if existingUser != nil {
			return nil, errors.New("email already exists")
		}
	}
	user.Name = name
	user.Email = email
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}
	user.PasswordHash = ""
	return user, nil
}

func (s *authService) CompleteOnboarding(id uuid.UUID) error {
	user, err := s.userRepo.FindByID(id)
	if err != nil {
		return errors.New("user not found")
	}
	user.IsOnboarded = true
	if err := s.userRepo.Update(user); err != nil {
		return err
	}
	return nil
}
