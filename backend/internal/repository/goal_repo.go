package repository

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"gorm.io/gorm"
)

// GoalRepository defines the interface for savings goal data operations
type GoalRepository interface {
	Create(goal *models.SavingGoal) error
	FindByID(id uuid.UUID) (*models.SavingGoal, error)
	FindByUserID(userID uuid.UUID) ([]*models.SavingGoal, error)
	FindAll() ([]*models.SavingGoal, error)
	Update(goal *models.SavingGoal) error
	Delete(id uuid.UUID) error
	UpdateProgress(id uuid.UUID, amount float64) error
}

type goalRepository struct {
	db *gorm.DB
}

func NewGoalRepository(db *gorm.DB) GoalRepository {
	return &goalRepository{db: db}
}

func (r *goalRepository) Create(goal *models.SavingGoal) error {
	return r.db.Create(goal).Error
}

func (r *goalRepository) FindByID(id uuid.UUID) (*models.SavingGoal, error) {
	var goal *models.SavingGoal
	err := r.db.Where("id = ?", id).First(&goal).Error
	if err != nil {
		return nil, err
	}
	return goal, nil
}

func (r *goalRepository) FindByUserID(userID uuid.UUID) ([]*models.SavingGoal, error) {
	var goals []*models.SavingGoal
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

func (r *goalRepository) FindAll() ([]*models.SavingGoal, error) {
	var goals []*models.SavingGoal
	err := r.db.Find(&goals).Error
	if err != nil {
		return nil, err
	}
	return goals, nil
}

func (r *goalRepository) Update(goal *models.SavingGoal) error {
	return r.db.Save(goal).Error
}

func (r *goalRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.SavingGoal{}, id).Error
}

// UpdateProgress adds an amount to the goal's current progress
func (r *goalRepository) UpdateProgress(id uuid.UUID, amount float64) error {
	return r.db.Model(&models.SavingGoal{}).
	Where("id = ?", id).
	UpdateColumn("current_amount", gorm.Expr("current_amount + ?", amount)).Error
}
