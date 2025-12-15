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

// ListWallets godoc
// @Summary List wallets
// @Description Get all wallet accounts for the authenticated user
// @Tags wallets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=object{wallets=[]models.Wallet}}
// @Failure 401 {object} utils.Response
// @Failure 500 {object} utils.Response
// @Router /wallets [get]
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

// GetWallet godoc
// @Summary Get wallet
// @Description Get a single wallet by ID
// @Tags wallets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Wallet ID"
// @Success 200 {object} utils.Response{data=object{wallet=models.Wallet}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Failure 404 {object} utils.Response
// @Router /wallets/{id} [get]
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

// CreateWallet godoc
// @Summary Create wallet
// @Description Create a new wallet account
// @Tags wallets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateWalletRequest true "Wallet data"
// @Success 201 {object} utils.Response{data=object{wallet=models.Wallet}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /wallets [post]
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

// UpdateWallet godoc
// @Summary Update wallet
// @Description Update a wallet account (can set as default)
// @Tags wallets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Wallet ID"
// @Param request body UpdateWalletRequest true "Wallet update data"
// @Success 200 {object} utils.Response{data=object{wallet=models.Wallet}}
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /wallets/{id} [put]
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

// DeleteWallet godoc
// @Summary Delete wallet
// @Description Delete a wallet account
// @Tags wallets
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Wallet ID"
// @Success 204 "No Content"
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /wallets/{id} [delete]
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
