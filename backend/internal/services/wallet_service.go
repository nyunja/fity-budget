package services

import (
	"errors"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
)

// WalletService defines the interface for wallet operations
type WalletService interface {
	CreateWallet(userID uuid.UUID, req CreateWalletRequest) (*models.Wallet, error)
	GetUserWallets(userID uuid.UUID) ([]*models.Wallet, error)
	GetWalletByID(id, userID uuid.UUID) (*models.Wallet, error)
	GetDefaultWallet(userID uuid.UUID) (*models.Wallet, error)
	UpdateWallet(id, userID uuid.UUID, req UpdateWalletRequest) (*models.Wallet, error)
	DeleteWallet(id, userID uuid.UUID) error
	SetDefaultWallet(id, userID uuid.UUID) (*models.Wallet, error)
	TransferBetweenWallets(fromWalletID, toWalletID, userID uuid.UUID, amount float64) error
}

type walletService struct {
	walletRepo repository.WalletRepository
}

// CreateWalletRequest represents the data needed to create a wallet
type CreateWalletRequest struct {
	Name          string  `json:"name" binding:"required"`
	Type          string  `json:"type" binding:"required"`
	Balance       float64 `json:"balance" binding:"omitempty,gte=0"`
	Currency      string  `json:"currency"`
	Color         string  `json:"color" binding:"required"`
	AccountNumber string  `json:"account_number"`
	IsDefault     bool    `json:"is_default"`
}

// UpdateWalletRequest represents the data needed to update a wallet
type UpdateWalletRequest struct {
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Balance       float64 `json:"balance" binding:"omitempty,gte=0"`
	Currency      string  `json:"currency"`
	Color         string  `json:"color"`
	AccountNumber string  `json:"account_number"`
}

func NewWalletService(walletRepo repository.WalletRepository) WalletService {
	return &walletService{
		walletRepo: walletRepo,
	}
}

// CreateWallet creates a new wallet
func (s *walletService) CreateWallet(userID uuid.UUID, req CreateWalletRequest) (*models.Wallet, error) {
	// Check if this is the first wallet for the user
	existingWallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	// If this is the first wallet or user explicitly wants it as default, set it as default
	isDefault := req.IsDefault || len(existingWallets) == 0

	// If setting as default, unset other defaults
	if isDefault {
		for _, wallet := range existingWallets {
			if wallet.IsDefault {
				wallet.IsDefault = false
				if err := s.walletRepo.Update(wallet); err != nil {
					return nil, errors.New("failed to update existing default wallet")
				}
			}
		}
	}

	// Set default currency if not provided
	currency := req.Currency
	if currency == "" {
		currency = "KES"
	}

	wallet := models.Wallet{
		UserID:        userID,
		Name:          req.Name,
		Type:          req.Type,
		Balance:       req.Balance,
		Currency:      currency,
		Color:         req.Color,
		AccountNumber: req.AccountNumber,
		IsDefault:     isDefault,
	}

	if err := s.walletRepo.Create(&wallet); err != nil {
		return nil, err
	}

	return &wallet, nil
}

// GetUserWallets retrieves all wallets for a specific user
func (s *walletService) GetUserWallets(userID uuid.UUID) ([]*models.Wallet, error) {
	wallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	return wallets, nil
}

// GetWalletByID retrieves a specific wallet by ID
func (s *walletService) GetWalletByID(id, userID uuid.UUID) (*models.Wallet, error) {
	wallet, err := s.walletRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("wallet not found")
	}

	// Verify wallet belongs to user
	if wallet.UserID != userID {
		return nil, errors.New("unauthorized access to wallet")
	}

	return wallet, nil
}

// GetDefaultWallet retrieves the default wallet for a user
func (s *walletService) GetDefaultWallet(userID uuid.UUID) (*models.Wallet, error) {
	wallet, err := s.walletRepo.FindDefaultByUserID(userID)
	if err != nil {
		return nil, errors.New("no default wallet found")
	}

	return wallet, nil
}

// UpdateWallet updates an existing wallet
func (s *walletService) UpdateWallet(id, userID uuid.UUID, req UpdateWalletRequest) (*models.Wallet, error) {
	wallet, err := s.walletRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("wallet not found")
	}

	// Verify wallet belongs to user
	if wallet.UserID != userID {
		return nil, errors.New("unauthorized access to wallet")
	}

	// Update fields if provided
	if req.Name != "" {
		wallet.Name = req.Name
	}
	if req.Type != "" {
		wallet.Type = req.Type
	}
	if req.Currency != "" {
		wallet.Currency = req.Currency
	}
	if req.Color != "" {
		wallet.Color = req.Color
	}
	if req.Balance >= 0 {
		wallet.Balance = req.Balance
	}
	if req.AccountNumber != "" {
		wallet.AccountNumber = req.AccountNumber
	}

	if err := s.walletRepo.Update(wallet); err != nil {
		return nil, err
	}

	return wallet, nil
}

// DeleteWallet deletes a wallet
func (s *walletService) DeleteWallet(id, userID uuid.UUID) error {
	wallet, err := s.walletRepo.FindByID(id)
	if err != nil {
		return errors.New("wallet not found")
	}

	// Verify wallet belongs to user
	if wallet.UserID != userID {
		return errors.New("unauthorized access to wallet")
	}

	// Check if wallet has balance
	if wallet.Balance > 0 {
		return errors.New("cannot delete wallet with remaining balance")
	}

	// If deleting default wallet, set another wallet as default
	if wallet.IsDefault {
		otherWallets, err := s.walletRepo.FindByUserID(userID)
		if err != nil {
			return err
		}

		// Find another wallet to set as default (excluding the one being deleted)
		for _, otherWallet := range otherWallets {
			if otherWallet.ID != id {
				otherWallet.IsDefault = true
				if err := s.walletRepo.Update(otherWallet); err != nil {
					return errors.New("failed to set new default wallet")
				}
				break
			}
		}
	}

	if err := s.walletRepo.Delete(id); err != nil {
		return err
	}

	return nil
}

// SetDefaultWallet sets a wallet as the default wallet for a user
func (s *walletService) SetDefaultWallet(id, userID uuid.UUID) (*models.Wallet, error) {
	wallet, err := s.walletRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("wallet not found")
	}

	// Verify wallet belongs to user
	if wallet.UserID != userID {
		return nil, errors.New("unauthorized access to wallet")
	}

	// If already default, return as is
	if wallet.IsDefault {
		return wallet, nil
	}

	// Unset other default wallets
	userWallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}

	for _, userWallet := range userWallets {
		if userWallet.IsDefault {
			userWallet.IsDefault = false
			if err := s.walletRepo.Update(userWallet); err != nil {
				return nil, errors.New("failed to update existing default wallet")
			}
		}
	}

	// Set this wallet as default
	wallet.IsDefault = true
	if err := s.walletRepo.Update(wallet); err != nil {
		return nil, err
	}

	return wallet, nil
}

// TransferBetweenWallets transfers funds between two wallets
func (s *walletService) TransferBetweenWallets(fromWalletID, toWalletID, userID uuid.UUID, amount float64) error {
	if amount <= 0 {
		return errors.New("transfer amount must be greater than zero")
	}

	// Get and verify source wallet
	fromWallet, err := s.walletRepo.FindByID(fromWalletID)
	if err != nil {
		return errors.New("source wallet not found")
	}
	if fromWallet.UserID != userID {
		return errors.New("unauthorized access to source wallet")
	}

	// Get and verify destination wallet
	toWallet, err := s.walletRepo.FindByID(toWalletID)
	if err != nil {
		return errors.New("destination wallet not found")
	}
	if toWallet.UserID != userID {
		return errors.New("unauthorized access to destination wallet")
	}

	// Check if source wallet has sufficient balance
	if fromWallet.Balance < amount {
		return errors.New("insufficient balance in source wallet")
	}

	// Warn if currencies are different
	if fromWallet.Currency != toWallet.Currency {
		// In a production app, you'd want to handle currency conversion here
		// For now, we'll just log a warning but allow the transfer
	}

	// Perform the transfer
	if err := s.walletRepo.UpdateBalance(fromWalletID, -amount); err != nil {
		return errors.New("failed to deduct from source wallet")
	}

	if err := s.walletRepo.UpdateBalance(toWalletID, amount); err != nil {
		// Attempt to revert the deduction from source wallet
		s.walletRepo.UpdateBalance(fromWalletID, amount)
		return errors.New("failed to add to destination wallet")
	}

	return nil
}
