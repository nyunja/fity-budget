package repository

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"gorm.io/gorm"
)

// TransactionRepository defines the interface for transaction data operations
type TransactionRepository interface {
	Create(transaction *models.Transaction) error
	FindByID(id uuid.UUID) (*models.Transaction, error)
	FindByUserID(userID uuid.UUID, limit, offset int) ([]*models.Transaction, error)
	FindAll() ([]*models.Transaction, error)
	Update(transaction *models.Transaction) error
	Delete(id uuid.UUID) error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (r *transactionRepository) Create(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

func (r *transactionRepository) FindByID(id uuid.UUID) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.Where("id = ?", id).First(&transaction).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *transactionRepository) FindByUserID(userID uuid.UUID, limit, offset int) ([]*models.Transaction, error) {
	var transactions []*models.Transaction
	err := r.db.Where("user_id = ?", userID).
		Order("transaction_date DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

func (r *transactionRepository) FindAll() ([]*models.Transaction, error) {
	var transactions []*models.Transaction
	err := r.db.Find(&transactions).Error
	return transactions, err
}

func (r *transactionRepository) Update(transaction *models.Transaction) error {
	return r.db.Save(transaction).Error
}

func (r *transactionRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Transaction{}, id).Error
}

