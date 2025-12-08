package repository

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"gorm.io/gorm"
)

// BudgetRepository defines the interface for budget data operations
type BudgetRepository interface {
	Create(budget *models.Budget) error
	FindByID(id uuid.UUID) (*models.Budget, error)
	FindByUserID(userID uuid.UUID) ([]*models.Budget, error)
	FindByUserIDAndCategory(userID uuid.UUID, category string) (*models.Budget, error)
	FindAll() ([]*models.Budget, error)
	Update(budget *models.Budget) error
	Delete(id uuid.UUID) error
}

type budgetRepository struct {
	db *gorm.DB
}

// NewBudgetRepository creates a new instance of BudgetRepository
func NewBudgetRepository(db *gorm.DB) BudgetRepository {
	return &budgetRepository{db: db}
}

// Create inserts a new budget into the database
func (r *budgetRepository) Create(budget *models.Budget) error {
	return r.db.Create(budget).Error
}

// FindByID retrieves a budget by its ID
func (r *budgetRepository) FindByID(id uuid.UUID) (*models.Budget, error) {
	var budget models.Budget
	err := r.db.Where("id = ?", id).First(&budget).Error
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

// FindByUserID retrieves all budgets for a specific user
func (r *budgetRepository) FindByUserID(userID uuid.UUID) ([]*models.Budget, error) {
	var budgets []*models.Budget
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&budgets).Error
	return budgets, err
}

// FindByUserIDAndCategory retrieves a specific budget by user and category
func (r *budgetRepository) FindByUserIDAndCategory(userID uuid.UUID, category string) (*models.Budget, error) {
	var budget models.Budget
	err := r.db.Where("user_id = ? AND category = ?", userID, category).First(&budget).Error
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

// FindAll retrieves all budgets
func (r *budgetRepository) FindAll() ([]*models.Budget, error) {
	var budgets []*models.Budget
	err := r.db.Find(&budgets).Error
	return budgets, err
}

// Update modifies an existing budget
func (r *budgetRepository) Update(budget *models.Budget) error {
	return r.db.Save(budget).Error
}

// Delete removes a budget from the database (soft delete)
func (r *budgetRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Budget{}, id).Error
}
