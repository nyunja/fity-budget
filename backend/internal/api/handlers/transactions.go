package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/internal/utils"
)

type TransactionHandler struct {
	transactionService services.TransactionService
}

func NewTransactionHandler(transactionService services.TransactionService) *TransactionHandler {
	return &TransactionHandler{transactionService: transactionService}
}

// Request/Response types
type CreateTransactionRequest struct {
	WalletID        *uuid.UUID `json:"wallet_id"`
	Amount          float64    `json:"amount" binding:"required,gt=0"`
	Description     string     `json:"description" binding:"required"`
	Method          string     `json:"method"`
	Category        string     `json:"category" binding:"required"`
	Status          string     `json:"status" binding:"omitempty,oneof=Completed Pending Failed"`
	Notes           string     `json:"notes"`
	ReceiptURL      string     `json:"receipt_url"`
	TransactionDate *time.Time `json:"transaction_date"`
}

type UpdateTransactionRequest struct {
	Amount          float64    `json:"amount" binding:"omitempty,gt=0"`
	Description     string     `json:"description"`
	Method          string     `json:"method"`
	Category        string     `json:"category"`
	Status          string     `json:"status" binding:"omitempty,oneof=Completed Pending Failed"`
	Notes           string     `json:"notes"`
	ReceiptURL      string     `json:"receipt_url"`
	TransactionDate *time.Time `json:"transaction_date"`
}

// ListTransactions gets paginated list of user's transactions
// GET /api/v1/transactions
func (h *TransactionHandler) ListTransactions(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	// Get pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	transactions, err := h.transactionService.GetUserTransactions(userID, limit, offset)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "FETCH_FAILED", err.Error())
		return
	}

	// TODO: Implement proper pagination metadata
	utils.Success(c, http.StatusOK, gin.H{
		"data": transactions,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
		},
	})
}

// GetTransaction gets a single transaction by ID
// GET /api/v1/transactions/:id
func (h *TransactionHandler) GetTransaction(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid transaction ID")
		return
	}

	transaction, err := h.transactionService.GetTransactionByID(id, userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "NOT_FOUND", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"transaction": transaction,
	})
}

// CreateTransaction creates a new transaction
// POST /api/v1/transactions
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	var req CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	var transactionDate time.Time
	if req.TransactionDate != nil {
		transactionDate = *req.TransactionDate
	} else {
		transactionDate = time.Now()
	}

	serviceReq := services.CreateTransactionRequest{
		WalletID:        req.WalletID,
		Amount:          req.Amount,
		Name:            req.Description,
		Method:          req.Method,
		Category:        req.Category,
		Status:          req.Status,
		Notes:           req.Notes,
		ReceiptURL:      req.ReceiptURL,
		TransactionDate: transactionDate,
	}

	transaction, err := h.transactionService.CreateTransaction(userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, gin.H{
		"transaction": transaction,
	})
}

// UpdateTransaction updates an existing transaction
// PUT /api/v1/transactions/:id
func (h *TransactionHandler) UpdateTransaction(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid transaction ID")
		return
	}

	var req UpdateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	var transactionDate time.Time
	if req.TransactionDate != nil {
		transactionDate = *req.TransactionDate
	}

	serviceReq := services.UpdateTransactionRequest{
		Amount:          req.Amount,
		Name:            req.Description,
		Method:          req.Method,
		Category:        req.Category,
		Status:          req.Status,
		Notes:           req.Notes,
		ReceiptURL:      req.ReceiptURL,
		TransactionDate: transactionDate,
	}

	transaction, err := h.transactionService.UpdateTransaction(id, userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "UPDATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"transaction": transaction,
	})
}

// DeleteTransaction deletes a transaction
// DELETE /api/v1/transactions/:id
func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid transaction ID")
		return
	}

	if err := h.transactionService.DeleteTransaction(id, userID); err != nil {
		utils.Error(c, http.StatusBadRequest, "DELETE_FAILED", err.Error())
		return
	}

	c.Status(http.StatusNoContent)
}

// GetTransactionStats gets transaction statistics for current month
// GET /api/v1/transactions/stats
func (h *TransactionHandler) GetTransactionStats(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	// Get current month date range
	now := time.Now()
	startDate := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endDate := startDate.AddDate(0, 1, 0)

	stats, err := h.transactionService.GetTransactionStats(userID, startDate, endDate)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "STATS_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"stats": stats,
	})
}
