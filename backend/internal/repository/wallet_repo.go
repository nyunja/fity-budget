package repository

import (
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"gorm.io/gorm"
)

// WalletRepository defines the interface for wallet data operations
type WalletRepository interface {
	Create(wallet *models.Wallet) error
	FindByID(id uuid.UUID) (*models.Wallet, error)
	FindByUserID(userID uuid.UUID) ([]*models.Wallet, error)
	FindDefaultByUserID(userID uuid.UUID) (*models.Wallet, error)
	FindAll() ([]*models.Wallet, error)
	Update(wallet *models.Wallet) error
	Delete(id uuid.UUID) error
	UpdateBalance(id uuid.UUID, amount float64) error
}

type walletRepository struct {
	db *gorm.DB
}

// NewWalletRepository creates a new instance of WalletRepository
func NewWalletRepository(db *gorm.DB) WalletRepository {
	return &walletRepository{db: db}
}

// Create inserts a new wallet into the database
func (r *walletRepository) Create(wallet *models.Wallet) error {
	return r.db.Create(wallet).Error
}

// FindByID retrieves a wallet by its ID
func (r *walletRepository) FindByID(id uuid.UUID) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.db.Where("id = ?", id).First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

// FindByUserID retrieves all wallets for a specific user
func (r *walletRepository) FindByUserID(userID uuid.UUID) ([]*models.Wallet, error) {
	var wallets []*models.Wallet
	err := r.db.Where("user_id = ?", userID).
		Order("is_default DESC, created_at DESC").
		Find(&wallets).Error
	return wallets, err
}

// FindDefaultByUserID retrieves the default wallet for a user
func (r *walletRepository) FindDefaultByUserID(userID uuid.UUID) (*models.Wallet, error) {
	var wallet models.Wallet
	err := r.db.Where("user_id = ? AND is_default = ?", userID, true).First(&wallet).Error
	if err != nil {
		return nil, err
	}
	return &wallet, nil
}

// FindAll retrieves all wallets
func (r *walletRepository) FindAll() ([]*models.Wallet, error) {
	var wallets []*models.Wallet
	err := r.db.Find(&wallets).Error
	return wallets, err
}

// Update modifies an existing wallet
func (r *walletRepository) Update(wallet *models.Wallet) error {
	return r.db.Save(wallet).Error
}

// Delete removes a wallet from the database (soft delete)
func (r *walletRepository) Delete(id uuid.UUID) error {
	return r.db.Delete(&models.Wallet{}, id).Error
}

// UpdateBalance updates the wallet balance by adding the specified amount
func (r *walletRepository) UpdateBalance(id uuid.UUID, amount float64) error {
	return r.db.Model(&models.Wallet{}).
		Where("id = ?", id).
		UpdateColumn("balance", gorm.Expr("balance + ?", amount)).
		Error
}
