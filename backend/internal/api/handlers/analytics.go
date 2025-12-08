package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/nyunja/fity-budget-backend/internal/api/middleware"
	"github.com/nyunja/fity-budget-backend/internal/services"
	"github.com/nyunja/fity-budget-backend/internal/utils"
)

type AnalyticsHandler struct {
	analyticsService services.AnalyticsService
}

func NewAnalyticsHandler(analyticsService services.AnalyticsService) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsService: analyticsService}
}

// GetDashboardStats gets financial statistics for the dashboard
// GET /api/v1/analytics/dashboard
func (h *AnalyticsHandler) GetDashboardStats(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	summary, err := h.analyticsService.GetDashboardSummary(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "DASHBOARD_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"dashboard": summary,
	})
}

// GetMoneyFlow gets income and expense flow over time
// GET /api/v1/analytics/money-flow
func (h *AnalyticsHandler) GetMoneyFlow(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	// Get period parameter (default: 6months)
	period := c.DefaultQuery("period", "6months")

	// Convert period to number of months
	months := 6
	switch period {
	case "7days":
		months = 0 // Special case for weekly view
	case "1month":
		months = 1
	case "6months":
		months = 6
	case "1year":
		months = 12
	}

	var report interface{}
	if period == "7days" || period == "1month" {
		// Use income vs expense for short periods
		incomeExpense, err := h.analyticsService.GetIncomeVsExpense(userID, period)
		if err != nil {
			utils.Error(c, http.StatusInternalServerError, "MONEY_FLOW_FAILED", err.Error())
			return
		}
		report = incomeExpense
	} else {
		// Use monthly trends for longer periods
		trends, err := h.analyticsService.GetMonthlyTrends(userID, months)
		if err != nil {
			utils.Error(c, http.StatusInternalServerError, "MONEY_FLOW_FAILED", err.Error())
			return
		}
		report = trends
	}

	utils.Success(c, http.StatusOK, gin.H{
		"data": report,
	})
}

// GetSpendingAnalysis gets spending breakdown by category
// GET /api/v1/analytics/spending
func (h *AnalyticsHandler) GetSpendingAnalysis(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	// Get period parameter (default: 1month)
	period := c.DefaultQuery("period", "1month")

	// Calculate date range based on period
	now := time.Now()
	var startDate time.Time

	switch period {
	case "7days":
		startDate = now.AddDate(0, 0, -7)
	case "1month":
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	case "3months":
		startDate = now.AddDate(0, -3, 0)
	case "6months":
		startDate = now.AddDate(0, -6, 0)
	case "1year":
		startDate = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
	default:
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}

	categories, err := h.analyticsService.GetSpendingByCategory(userID, startDate, now)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "SPENDING_ANALYSIS_FAILED", err.Error())
		return
	}

	// Calculate total spending
	totalSpending := 0.0
	for _, cat := range categories {
		totalSpending += cat.Amount
	}

	utils.Success(c, http.StatusOK, gin.H{
		"total_spending": totalSpending,
		"by_category":    categories,
	})
}

// GetInsights gets AI-generated financial insights
// GET /api/v1/analytics/insights
func (h *AnalyticsHandler) GetInsights(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	// Get financial health score which includes recommendations
	healthScore, err := h.analyticsService.GetFinancialHealthScore(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "INSIGHTS_FAILED", err.Error())
		return
	}

	// Generate insight message based on health score
	var insightMessage string
	if healthScore.Score >= 80 {
		insightMessage = "Excellent job! Your finances are in great shape. Keep up the good work with budgeting and saving."
	} else if healthScore.Score >= 60 {
		insightMessage = "You're doing well! There are a few areas where you can improve to achieve better financial health."
	} else if healthScore.Score >= 40 {
		insightMessage = "Your finances need some attention. Focus on the recommendations below to improve your financial health."
	} else {
		insightMessage = "Your financial health needs significant improvement. Start by implementing the recommendations below."
	}

	// Add specific insights based on metrics
	if len(healthScore.Recommendations) > 0 {
		insightMessage += " " + healthScore.Recommendations[0]
	}

	utils.Success(c, http.StatusOK, gin.H{
		"insight":      insightMessage,
		"generated_at": time.Now(),
		"health_score": healthScore,
	})
}

// GetTrends gets monthly trend data
// GET /api/v1/analytics/trends
func (h *AnalyticsHandler) GetTrends(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	// Get months parameter (default: 6)
	monthsStr := c.DefaultQuery("months", "6")
	months, err := strconv.Atoi(monthsStr)
	if err != nil || months < 1 {
		months = 6
	}
	if months > 24 {
		months = 24 // Cap at 2 years
	}

	trends, err := h.analyticsService.GetMonthlyTrends(userID, months)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "TRENDS_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"trends": trends,
	})
}

// GetFinancialHealth gets overall financial health score
// GET /api/v1/analytics/health
func (h *AnalyticsHandler) GetFinancialHealth(c *gin.Context) {
	userID, err := middleware.GetUserID(c)
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "UNAUTHORIZED", err.Error())
		return
	}

	healthScore, err := h.analyticsService.GetFinancialHealthScore(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "HEALTH_SCORE_FAILED", err.Error())
		return
	}

	utils.Success(c, http.StatusOK, gin.H{
		"health_score": healthScore,
	})
}
