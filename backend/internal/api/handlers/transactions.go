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
	Name     string     `json:"name" binding:"required"`
	Method          string     `json:"method"`
	Category        string     `json:"category" binding:"required"`
	Status          string     `json:"status" binding:"omitempty,oneof=Completed Pending Failed"`
	Notes           string     `json:"notes"`
	ReceiptURL      string     `json:"receipt_url"`
	TransactionDate *time.Time `json:"transaction_date"`
}

type UpdateTransactionRequest struct {
	Amount          float64    `json:"amount" binding:"omitempty,gt=0"`
	Name            string     `json:"name"`
	Method          string     `json:"method"`
	Category        string     `json:"category"`
	Status          string     `json:"status" binding:"omitempty,oneof=Completed Pending Failed"`
	Notes           string     `json:"notes"`
	ReceiptURL      string     `json:"receipt_url"`
	TransactionDate *time.Time `json:"transaction_date"`
}

// ListTransactions godoc
// @Summary List transactions
// @Description Get paginated list of user's transactions
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} utils.Response{data=object{data=[]models.Transaction,pagination=object}}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /transactions [get]
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

	transactions, total, err := h.transactionService.GetUserTransactionsWithCount(userID, limit, offset)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "FETCH_FAILED", err.Error())
		return
	}

	// Calculate pagination metadata
	totalPages := (int(total) + limit - 1) / limit // Ceiling division
	hasNext := page < totalPages
	hasPrev := page > 1

	utils.Success(c, http.StatusOK, gin.H{
		"data": transactions,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
			"has_next":    hasNext,
			"has_prev":    hasPrev,
		},
	})
}

// GetTransaction godoc
// @Summary Get transaction
// @Description Get a single transaction by ID
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Success 200 {object} utils.Response{data=object{transaction=models.Transaction}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Router /transactions/{id} [get]
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

// CreateTransaction godoc
// @Summary Create transaction
// @Description Create a new transaction
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateTransactionRequest true "Transaction data"
// @Success 201 {object} utils.Response{data=object{transaction=models.Transaction}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /transactions [post]
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
		Name:            req.Name,
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

// UpdateTransaction godoc
// @Summary Update transaction
// @Description Update an existing transaction
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Param request body UpdateTransactionRequest true "Transaction update data"
// @Success 200 {object} utils.Response{data=object{transaction=models.Transaction}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /transactions/{id} [put]
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
		Name:            req.Name,
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

// DeleteTransaction godoc
// @Summary Delete transaction
// @Description Delete a transaction
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Transaction ID"
// @Success 204 "No Content"
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /transactions/{id} [delete]
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

// GetTransactionStats godoc
// @Summary Get transaction statistics
// @Description Get transaction statistics for the current month
// @Tags transactions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=object{stats=object}}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /transactions/stats [get]
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
