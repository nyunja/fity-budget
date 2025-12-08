package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/internal/utils"
)

type WalletHandler struct {
	walletService services.WalletService
}

func NewWalletHandler(walletService services.WalletService) *WalletHandler {
	return &WalletHandler{walletService: walletService}
}

// Request/Response types
type CreateWalletRequest struct {
	Name          string  `json:"name" binding:"required"`
	Type          string  `json:"type" binding:"required"`
	Balance       float64 `json:"balance" binding:"omitempty,gte=0"`
	Currency      string  `json:"currency"`
	Color         string  `json:"color" binding:"required"`
	AccountNumber string  `json:"account_number"`
	IsDefault     bool    `json:"is_default"`
}

type UpdateWalletRequest struct {
	Name          string  `json:"name"`
	Type          string  `json:"type"`
	Balance       float64 `json:"balance" binding:"omitempty,gte=0"`
	Currency      string  `json:"currency"`
	Color         string  `json:"color"`
	AccountNumber string  `json:"account_number"`
	IsDefault     *bool   `json:"is_default"`
}

// ListWallets gets all wallet accounts for the authenticated user
// GET /api/v1/wallets
func (h *WalletHandler) ListWallets(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	wallets, err := h.walletService.GetUserWallets(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "FETCH_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"wallets": wallets,
	})
}

// GetWallet gets a single wallet by ID
// GET /api/v1/wallets/:id
func (h *WalletHandler) GetWallet(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid wallet ID")
		return
	}

	wallet, err := h.walletService.GetWalletByID(id, userID)
	if err != nil {
		utils.Error(c, http.StatusNotFound, "NOT_FOUND", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"wallet": wallet,
	})
}

// CreateWallet creates a new wallet account
// POST /api/v1/wallets
func (h *WalletHandler) CreateWallet(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	var req CreateWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Convert to service request
	serviceReq := services.CreateWalletRequest{
		Name:          req.Name,
		Type:          req.Type,
		Balance:       req.Balance,
		Currency:      req.Currency,
		Color:         req.Color,
		AccountNumber: req.AccountNumber,
		IsDefault:     req.IsDefault,
	}

	wallet, err := h.walletService.CreateWallet(userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "CREATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusCreated, gin.H{
		"wallet": wallet,
	})
}

// UpdateWallet updates a wallet account
// PUT /api/v1/wallets/:id
func (h *WalletHandler) UpdateWallet(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid wallet ID")
		return
	}

	var req UpdateWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "VALIDATION_ERROR", err.Error())
		return
	}

	// Handle is_default separately if provided
	if req.IsDefault != nil && *req.IsDefault {
		_, err := h.walletService.SetDefaultWallet(id, userID)
		if err != nil {
			utils.Error(c, http.StatusBadRequest, "SET_DEFAULT_FAILED", err.Error())
			return
		}
	}

	// Convert to service request
	serviceReq := services.UpdateWalletRequest{
		Name:          req.Name,
		Type:          req.Type,
		Balance:       req.Balance,
		Currency:      req.Currency,
		Color:         req.Color,
		AccountNumber: req.AccountNumber,
	}

	wallet, err := h.walletService.UpdateWallet(id, userID, serviceReq)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "UPDATE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"wallet": wallet,
	})
}

// DeleteWallet deletes a wallet account
// DELETE /api/v1/wallets/:id
func (h *WalletHandler) DeleteWallet(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "INVALID_ID", "Invalid wallet ID")
		return
	}

	if err := h.walletService.DeleteWallet(id, userID); err != nil {
		utils.Error(c, http.StatusBadRequest, "DELETE_FAILED", err.Error())
		return
	}

	c.Status(http.StatusNoContent)
}
