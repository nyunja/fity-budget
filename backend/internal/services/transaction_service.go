package services

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
)

// TransactionService defines the interface for transaction operations
type TransactionService interface {
	CreateTransaction(userID uuid.UUID, req CreateTransactionRequest) (*models.Transaction, error)
	GetUserTransactions(userID uuid.UUID, limit, offset int) ([]*models.Transaction, error)
	GetUserTransactionsWithCount(userID uuid.UUID, limit, offset int) ([]*models.Transaction, int64, error)
	GetTransactionByID(id, userID uuid.UUID) (*models.Transaction, error)
	UpdateTransaction(id, userID uuid.UUID, req UpdateTransactionRequest) (*models.Transaction, error)
	DeleteTransaction(id, userID uuid.UUID) error
	GetTransactionStats(userID uuid.UUID, startDate, endDate time.Time) (*TransactionStats, error)
}

type transactionService struct {
	transactionRepo repository.TransactionRepository
	walletRepo      repository.WalletRepository
}

// CreateTransactionRequest represents the data needed to create a transaction
type CreateTransactionRequest struct {
	WalletID        *uuid.UUID `json:"wallet_id"`
	Amount          float64    `json:"amount" binding:"required,gt=0"`
	Name            string     `json:"name" binding:"required"`
	Method          string     `json:"method" binding:"required"`
	Category        string     `json:"category" binding:"required"`
	Status          string     `json:"status" binding:"omitempty,oneof=Completed Pending Failed"`
	Notes           string     `json:"notes"`
	ReceiptURL      string     `json:"receipt_url"`
	TransactionDate time.Time  `json:"transaction_date"`
}

// UpdateTransactionRequest represents the data needed to update a transaction
type UpdateTransactionRequest struct {
	Amount          float64    `json:"amount" binding:"omitempty,gt=0"`
	Name            string     `json:"name"`
	Method          string     `json:"method"`
	Category        string     `json:"category"`
	Status          string     `json:"status" binding:"omitempty,oneof=Completed Pending Failed"`
	Notes           string     `json:"notes"`
	ReceiptURL      string     `json:"receipt_url"`
	TransactionDate time.Time  `json:"transaction_date"`
}

// TransactionStats represents aggregated transaction statistics
type TransactionStats struct {
	TotalIncome      float64 `json:"total_income"`
	TotalExpense     float64 `json:"total_expense"`
	NetBalance       float64 `json:"net_balance"`
	TransactionCount int     `json:"transaction_count"`
}

func NewTransactionService(transactionRepo repository.TransactionRepository, walletRepo repository.WalletRepository) TransactionService {
	return &transactionService{
		transactionRepo: transactionRepo,
		walletRepo:      walletRepo,
	}
}

// CreateTransaction creates a new transaction and updates the wallet balance
func (s *transactionService) CreateTransaction(userID uuid.UUID, req CreateTransactionRequest) (*models.Transaction, error) {
	// Verify wallet belongs to user if provided
	if req.WalletID != nil {
		wallet, err := s.walletRepo.FindByID(*req.WalletID)
		if err != nil {
			return nil, errors.New("wallet not found")
		}
		if wallet.UserID != userID {
			return nil, errors.New("unauthorized access to wallet")
		}
	}

	// Set default status if not provided
	status := req.Status
	if status == "" {
		status = "Completed"
	}

	// Set transaction date to now if not provided
	transactionDate := req.TransactionDate
	if transactionDate.IsZero() {
		transactionDate = time.Now()
	}

	transaction := models.Transaction{
		UserID:          userID,
		WalletID:        req.WalletID,
		Amount:          req.Amount,
		Name:            req.Name,
		Method:          req.Method,
		Category:        req.Category,
		Status:          status,
		Notes:           req.Notes,
		ReceiptURL:      req.ReceiptURL,
		TransactionDate: transactionDate,
	}

	if err := s.transactionRepo.Create(&transaction); err != nil {
		return nil, err
	}

	// Update wallet balance only if transaction is completed and wallet is specified
	if status == "Completed" && req.WalletID != nil {
		// Note: The model doesn't have a Type field to determine if income/expense
		// This would need to be determined by the Method or another field
		// For now, we'll comment this out until the business logic is clarified
		// if err := s.walletRepo.UpdateBalance(*req.WalletID, balanceChange); err != nil {
		// 	return nil, errors.New("failed to update wallet balance")
		// }
	}

	return &transaction, nil
}

// GetUserTransactions retrieves transactions for a specific user with pagination
func (s *transactionService) GetUserTransactions(userID uuid.UUID, limit, offset int) ([]*models.Transaction, error) {
	// Set default limit if not provided or invalid
	if limit <= 0 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	transactions, err := s.transactionRepo.FindByUserID(userID, limit, offset)
	if err != nil {
		return nil, err
	}

	return transactions, nil
}

// GetUserTransactionsWithCount retrieves transactions and total count for pagination
func (s *transactionService) GetUserTransactionsWithCount(userID uuid.UUID, limit, offset int) ([]*models.Transaction, int64, error) {
	// Set default limit if not provided or invalid
	if limit <= 0 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	// Get transactions
	transactions, err := s.transactionRepo.FindByUserID(userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	// Get total count
	total, err := s.transactionRepo.CountByUserID(userID)
	if err != nil {
		return nil, 0, err
	}

	return transactions, total, nil
}

// GetTransactionByID retrieves a specific transaction by ID
func (s *transactionService) GetTransactionByID(id, userID uuid.UUID) (*models.Transaction, error) {
	transaction, err := s.transactionRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("transaction not found")
	}

	// Verify transaction belongs to user
	if transaction.UserID != userID {
		return nil, errors.New("unauthorized access to transaction")
	}

	return transaction, nil
}

// UpdateTransaction updates an existing transaction
func (s *transactionService) UpdateTransaction(id, userID uuid.UUID, req UpdateTransactionRequest) (*models.Transaction, error) {
	transaction, err := s.transactionRepo.FindByID(id)
	if err != nil {
		return nil, errors.New("transaction not found")
	}

	// Verify transaction belongs to user
	if transaction.UserID != userID {
		return nil, errors.New("unauthorized access to transaction")
	}

	// Update fields if provided
	if req.Amount > 0 {
		transaction.Amount = req.Amount
	}
	if req.Name != "" {
		transaction.Name = req.Name
	}
	if req.Method != "" {
		transaction.Method = req.Method
	}
	if req.Category != "" {
		transaction.Category = req.Category
	}
	if req.Status != "" {
		transaction.Status = req.Status
	}
	if req.Notes != "" {
		transaction.Notes = req.Notes
	}
	if req.ReceiptURL != "" {
		transaction.ReceiptURL = req.ReceiptURL
	}
	if !req.TransactionDate.IsZero() {
		transaction.TransactionDate = req.TransactionDate
	}

	if err := s.transactionRepo.Update(transaction); err != nil {
		return nil, err
	}

	return transaction, nil
}

// DeleteTransaction deletes a transaction
func (s *transactionService) DeleteTransaction(id, userID uuid.UUID) error {
	transaction, err := s.transactionRepo.FindByID(id)
	if err != nil {
		return errors.New("transaction not found")
	}

	// Verify transaction belongs to user
	if transaction.UserID != userID {
		return errors.New("unauthorized access to transaction")
	}

	if err := s.transactionRepo.Delete(id); err != nil {
		return err
	}

	return nil
}

// GetTransactionStats calculates transaction statistics for a user within a date range
func (s *transactionService) GetTransactionStats(userID uuid.UUID, startDate, endDate time.Time) (*TransactionStats, error) {
	// Get all transactions for the user (we'll filter in memory for simplicity)
	// In production, you'd want to add a repository method with date filtering
	transactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	stats := &TransactionStats{}

	for _, txn := range transactions {
		// Filter by date range and only count completed transactions
		if txn.Status == "Completed" &&
			(startDate.IsZero() || txn.TransactionDate.After(startDate) || txn.TransactionDate.Equal(startDate)) &&
			(endDate.IsZero() || txn.TransactionDate.Before(endDate) || txn.TransactionDate.Equal(endDate)) {

			stats.TransactionCount++
			// Note: The Transaction model doesn't have a Type field
			// Income vs Expense would need to be determined by Method or Category
			// For now, we'll just count all as expenses
			stats.TotalExpense += txn.Amount
		}
	}

	stats.NetBalance = stats.TotalIncome - stats.TotalExpense

	return stats, nil
}
