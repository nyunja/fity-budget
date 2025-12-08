package services

import (
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/models"
	"github.com/nyunja/fity-budget-backend/internal/repository"
)

// AnalyticsService defines the interface for analytics and reporting operations
type AnalyticsService interface {
	GetDashboardSummary(userID uuid.UUID) (*DashboardSummary, error)
	GetSpendingByCategory(userID uuid.UUID, startDate, endDate time.Time) ([]*CategorySpending, error)
	GetIncomeVsExpense(userID uuid.UUID, period string) (*IncomeVsExpenseReport, error)
	GetMonthlyTrends(userID uuid.UUID, months int) (*MonthlyTrends, error)
	GetFinancialHealthScore(userID uuid.UUID) (*FinancialHealthScore, error)
}

type analyticsService struct {
	transactionRepo repository.TransactionRepository
	walletRepo      repository.WalletRepository
	budgetRepo      repository.BudgetRepository
	goalRepo        repository.GoalRepository
}

// DashboardSummary represents the main dashboard overview
type DashboardSummary struct {
	TotalBalance       float64                `json:"total_balance"`
	TotalIncome        float64                `json:"total_income"`
	TotalExpense       float64                `json:"total_expense"`
	NetSavings         float64                `json:"net_savings"`
	ActiveGoalsCount   int                    `json:"active_goals_count"`
	TotalGoalsProgress float64                `json:"total_goals_progress"`
	BudgetAlerts       int                    `json:"budget_alerts"`
	RecentTransactions int                    `json:"recent_transactions"`
	TopCategories      []*CategorySpending    `json:"top_categories"`
	MonthComparison    *MonthComparisonData   `json:"month_comparison"`
}

// CategorySpending represents spending data for a category
type CategorySpending struct {
	Category    string  `json:"category"`
	Amount      float64 `json:"amount"`
	Count       int     `json:"count"`
	Percentage  float64 `json:"percentage"`
	BudgetLimit float64 `json:"budget_limit,omitempty"`
}

// IncomeVsExpenseReport represents income vs expense data
type IncomeVsExpenseReport struct {
	Period       string               `json:"period"`
	TotalIncome  float64              `json:"total_income"`
	TotalExpense float64              `json:"total_expense"`
	NetAmount    float64              `json:"net_amount"`
	SavingsRate  float64              `json:"savings_rate"`
	DataPoints   []*IncomeExpenseData `json:"data_points"`
}

// IncomeExpenseData represents a single data point
type IncomeExpenseData struct {
	Date    string  `json:"date"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

// MonthlyTrends represents monthly trend data
type MonthlyTrends struct {
	Months         []string         `json:"months"`
	IncomeData     []float64        `json:"income_data"`
	ExpenseData    []float64        `json:"expense_data"`
	SavingsData    []float64        `json:"savings_data"`
	AverageIncome  float64          `json:"average_income"`
	AverageExpense float64          `json:"average_expense"`
	TrendDirection string           `json:"trend_direction"`
}

// MonthComparisonData represents comparison between current and previous month
type MonthComparisonData struct {
	CurrentMonthIncome   float64 `json:"current_month_income"`
	CurrentMonthExpense  float64 `json:"current_month_expense"`
	PreviousMonthIncome  float64 `json:"previous_month_income"`
	PreviousMonthExpense float64 `json:"previous_month_expense"`
	IncomeChange         float64 `json:"income_change"`
	ExpenseChange        float64 `json:"expense_change"`
}

// FinancialHealthScore represents overall financial health metrics
type FinancialHealthScore struct {
	Score              int     `json:"score"`
	Rating             string  `json:"rating"`
	SavingsRatio       float64 `json:"savings_ratio"`
	BudgetCompliance   float64 `json:"budget_compliance"`
	GoalProgress       float64 `json:"goal_progress"`
	DebtToIncome       float64 `json:"debt_to_income"`
	EmergencyFundRatio float64 `json:"emergency_fund_ratio"`
	Recommendations    []string `json:"recommendations"`
}

func NewAnalyticsService(
	transactionRepo repository.TransactionRepository,
	walletRepo repository.WalletRepository,
	budgetRepo repository.BudgetRepository,
	goalRepo repository.GoalRepository,
) AnalyticsService {
	return &analyticsService{
		transactionRepo: transactionRepo,
		walletRepo:      walletRepo,
		budgetRepo:      budgetRepo,
		goalRepo:        goalRepo,
	}
}

// GetDashboardSummary retrieves the main dashboard summary
func (s *analyticsService) GetDashboardSummary(userID uuid.UUID) (*DashboardSummary, error) {
	summary := &DashboardSummary{}

	// Get total balance from all wallets
	wallets, err := s.walletRepo.FindByUserID(userID)
	if err != nil {
		return nil, err
	}
	for _, wallet := range wallets {
		summary.TotalBalance += wallet.Balance
	}

	// Get current month's transactions
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endOfMonth := startOfMonth.AddDate(0, 1, 0)

	transactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	categoryMap := make(map[string]*CategorySpending)

	for _, txn := range transactions {
		if txn.Status == "Completed" {
			// Current month stats
			if txn.TransactionDate.After(startOfMonth) && txn.TransactionDate.Before(endOfMonth) {
				// Note: Transaction model doesn't have Type field to distinguish income/expense
				// All transactions are counted as expenses for now
				summary.TotalExpense += txn.Amount

				// Track category spending
				if _, exists := categoryMap[txn.Category]; !exists {
					categoryMap[txn.Category] = &CategorySpending{
						Category: txn.Category,
					}
				}
				categoryMap[txn.Category].Amount += txn.Amount
				categoryMap[txn.Category].Count++
				summary.RecentTransactions++
			}
		}
	}

	summary.NetSavings = summary.TotalIncome - summary.TotalExpense

	// Convert category map to slice and calculate percentages
	var topCategories []*CategorySpending
	for _, cat := range categoryMap {
		if summary.TotalExpense > 0 {
			cat.Percentage = (cat.Amount / summary.TotalExpense) * 100
		}
		topCategories = append(topCategories, cat)
	}
	// Sort by amount (in real implementation, use proper sorting)
	summary.TopCategories = topCategories

	// Get goals data
	goals, err := s.goalRepo.FindByUserID(userID)
	if err == nil {
		var totalTarget, totalCurrent float64
		for _, goal := range goals {
			if goal.Status != "Completed" {
				summary.ActiveGoalsCount++
			}
			totalTarget += goal.TargetAmount
			totalCurrent += goal.CurrentAmount
		}
		if totalTarget > 0 {
			summary.TotalGoalsProgress = (totalCurrent / totalTarget) * 100
		}
	}

	// Get budget alerts
	budgets, err := s.budgetRepo.FindByUserID(userID)
	if err == nil {
		for _, budget := range budgets {
			// Check if budget is over limit
			spent := float64(0)
			for cat, catData := range categoryMap {
				if cat == budget.Category {
					spent = catData.Amount
					break
				}
			}
			if spent > budget.LimitAmount || (spent/budget.LimitAmount*100) >= float64(budget.AlertThreshold) {
				summary.BudgetAlerts++
			}
		}
	}

	// Get month comparison
	summary.MonthComparison = s.getMonthComparison(userID, transactions, startOfMonth)

	return summary, nil
}

// GetSpendingByCategory retrieves spending breakdown by category
func (s *analyticsService) GetSpendingByCategory(userID uuid.UUID, startDate, endDate time.Time) ([]*CategorySpending, error) {
	transactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	categoryMap := make(map[string]*CategorySpending)
	totalExpense := float64(0)

	for _, txn := range transactions {
		if txn.Status == "Completed" &&
			txn.TransactionDate.After(startDate) &&
			txn.TransactionDate.Before(endDate) {

			if _, exists := categoryMap[txn.Category]; !exists {
				categoryMap[txn.Category] = &CategorySpending{
					Category: txn.Category,
				}
			}
			categoryMap[txn.Category].Amount += txn.Amount
			categoryMap[txn.Category].Count++
			totalExpense += txn.Amount
		}
	}

	// Get budget limits for categories
	budgets, _ := s.budgetRepo.FindByUserID(userID)
	budgetMap := make(map[string]float64)
	for _, budget := range budgets {
		budgetMap[budget.Category] = budget.LimitAmount
	}

	// Convert to slice and calculate percentages
	var categories []*CategorySpending
	for _, cat := range categoryMap {
		if totalExpense > 0 {
			cat.Percentage = (cat.Amount / totalExpense) * 100
		}
		if limit, exists := budgetMap[cat.Category]; exists {
			cat.BudgetLimit = limit
		}
		categories = append(categories, cat)
	}

	return categories, nil
}

// GetIncomeVsExpense retrieves income vs expense report for a period
func (s *analyticsService) GetIncomeVsExpense(userID uuid.UUID, period string) (*IncomeVsExpenseReport, error) {
	report := &IncomeVsExpenseReport{
		Period: period,
	}

	transactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	var startDate time.Time

	switch period {
	case "week":
		startDate = now.AddDate(0, 0, -7)
	case "month":
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	case "year":
		startDate = time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())
	default:
		startDate = time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	}

	dailyMap := make(map[string]*IncomeExpenseData)

	for _, txn := range transactions {
		if txn.Status == "Completed" && txn.TransactionDate.After(startDate) {
			dateKey := txn.TransactionDate.Format("2006-01-02")

			if _, exists := dailyMap[dateKey]; !exists {
				dailyMap[dateKey] = &IncomeExpenseData{
					Date: dateKey,
				}
			}

			// Note: Transaction model doesn't have Type field
			// All transactions counted as expenses
			report.TotalExpense += txn.Amount
			dailyMap[dateKey].Expense += txn.Amount
		}
	}

	report.NetAmount = report.TotalIncome - report.TotalExpense
	if report.TotalIncome > 0 {
		report.SavingsRate = (report.NetAmount / report.TotalIncome) * 100
	}

	// Convert map to slice
	for _, data := range dailyMap {
		report.DataPoints = append(report.DataPoints, data)
	}

	return report, nil
}

// GetMonthlyTrends retrieves monthly trend data
func (s *analyticsService) GetMonthlyTrends(userID uuid.UUID, months int) (*MonthlyTrends, error) {
	if months <= 0 {
		months = 6
	}

	trends := &MonthlyTrends{
		Months:      make([]string, 0),
		IncomeData:  make([]float64, 0),
		ExpenseData: make([]float64, 0),
		SavingsData: make([]float64, 0),
	}

	transactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	monthlyMap := make(map[string]*struct {
		income  float64
		expense float64
	})

	// Calculate for each month
	for i := months - 1; i >= 0; i-- {
		targetMonth := now.AddDate(0, -i, 0)
		monthKey := targetMonth.Format("2006-01")
		monthLabel := targetMonth.Format("Jan 2006")

		trends.Months = append(trends.Months, monthLabel)
		monthlyMap[monthKey] = &struct {
			income  float64
			expense float64
		}{}
	}

	// Aggregate transactions by month
	for _, txn := range transactions {
		if txn.Status == "Completed" {
			monthKey := txn.TransactionDate.Format("2006-01")
			if data, exists := monthlyMap[monthKey]; exists {
				// Note: Transaction model doesn't have Type field
				// All transactions counted as expenses
				data.expense += txn.Amount
			}
		}
	}

	// Build the arrays in order
	totalIncome := float64(0)
	totalExpense := float64(0)

	for i := months - 1; i >= 0; i-- {
		targetMonth := now.AddDate(0, -i, 0)
		monthKey := targetMonth.Format("2006-01")

		if data, exists := monthlyMap[monthKey]; exists {
			trends.IncomeData = append(trends.IncomeData, data.income)
			trends.ExpenseData = append(trends.ExpenseData, data.expense)
			trends.SavingsData = append(trends.SavingsData, data.income-data.expense)

			totalIncome += data.income
			totalExpense += data.expense
		} else {
			trends.IncomeData = append(trends.IncomeData, 0)
			trends.ExpenseData = append(trends.ExpenseData, 0)
			trends.SavingsData = append(trends.SavingsData, 0)
		}
	}

	if months > 0 {
		trends.AverageIncome = totalIncome / float64(months)
		trends.AverageExpense = totalExpense / float64(months)
	}

	// Determine trend direction
	if len(trends.SavingsData) >= 2 {
		recent := trends.SavingsData[len(trends.SavingsData)-1]
		previous := trends.SavingsData[len(trends.SavingsData)-2]
		if recent > previous {
			trends.TrendDirection = "up"
		} else if recent < previous {
			trends.TrendDirection = "down"
		} else {
			trends.TrendDirection = "stable"
		}
	}

	return trends, nil
}

// GetFinancialHealthScore calculates overall financial health score
func (s *analyticsService) GetFinancialHealthScore(userID uuid.UUID) (*FinancialHealthScore, error) {
	score := &FinancialHealthScore{
		Recommendations: make([]string, 0),
	}

	// Get current month transactions
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	transactions, err := s.transactionRepo.FindByUserID(userID, 10000, 0)
	if err != nil {
		return nil, err
	}

	monthlyIncome := float64(0)
	monthlyExpense := float64(0)

	for _, txn := range transactions {
		if txn.Status == "Completed" && txn.TransactionDate.After(startOfMonth) {
			// Note: Transaction model doesn't have Type field
			// All transactions counted as expenses
			monthlyExpense += txn.Amount
		}
	}

	// Calculate savings ratio
	if monthlyIncome > 0 {
		score.SavingsRatio = ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100
	}

	// Calculate budget compliance
	budgets, _ := s.budgetRepo.FindByUserID(userID)
	if len(budgets) > 0 {
		compliantCount := 0
		for _, budget := range budgets {
			spent := float64(0)
			for _, txn := range transactions {
				if txn.Category == budget.Category &&
					txn.Status == "Completed" && txn.TransactionDate.After(startOfMonth) {
					spent += txn.Amount
				}
			}
			if spent <= budget.LimitAmount {
				compliantCount++
			}
		}
		score.BudgetCompliance = (float64(compliantCount) / float64(len(budgets))) * 100
	}

	// Calculate goal progress
	goals, _ := s.goalRepo.FindByUserID(userID)
	if len(goals) > 0 {
		totalTarget := float64(0)
		totalCurrent := float64(0)
		for _, goal := range goals {
			totalTarget += goal.TargetAmount
			totalCurrent += goal.CurrentAmount
		}
		if totalTarget > 0 {
			score.GoalProgress = (totalCurrent / totalTarget) * 100
		}
	}

	// Get emergency fund (total wallet balance)
	wallets, _ := s.walletRepo.FindByUserID(userID)
	totalBalance := float64(0)
	for _, wallet := range wallets {
		totalBalance += wallet.Balance
	}

	// Emergency fund should be 3-6 months of expenses
	if monthlyExpense > 0 {
		score.EmergencyFundRatio = totalBalance / (monthlyExpense * 3)
	}

	// Calculate overall score (0-100)
	scorePoints := 0

	// Savings ratio (30 points)
	if score.SavingsRatio >= 20 {
		scorePoints += 30
	} else if score.SavingsRatio >= 10 {
		scorePoints += 20
	} else if score.SavingsRatio >= 5 {
		scorePoints += 10
	}

	// Budget compliance (25 points)
	if score.BudgetCompliance >= 80 {
		scorePoints += 25
	} else if score.BudgetCompliance >= 60 {
		scorePoints += 15
	} else if score.BudgetCompliance >= 40 {
		scorePoints += 10
	}

	// Goal progress (20 points)
	if score.GoalProgress >= 75 {
		scorePoints += 20
	} else if score.GoalProgress >= 50 {
		scorePoints += 15
	} else if score.GoalProgress >= 25 {
		scorePoints += 10
	}

	// Emergency fund (25 points)
	if score.EmergencyFundRatio >= 1.0 {
		scorePoints += 25
	} else if score.EmergencyFundRatio >= 0.5 {
		scorePoints += 15
	} else if score.EmergencyFundRatio >= 0.25 {
		scorePoints += 10
	}

	score.Score = scorePoints

	// Determine rating
	if score.Score >= 80 {
		score.Rating = "Excellent"
	} else if score.Score >= 60 {
		score.Rating = "Good"
	} else if score.Score >= 40 {
		score.Rating = "Fair"
	} else {
		score.Rating = "Needs Improvement"
	}

	// Generate recommendations
	if score.SavingsRatio < 10 {
		score.Recommendations = append(score.Recommendations, "Try to save at least 10-20% of your income")
	}
	if score.BudgetCompliance < 80 {
		score.Recommendations = append(score.Recommendations, "Review your budgets and track spending more carefully")
	}
	if score.EmergencyFundRatio < 1.0 {
		score.Recommendations = append(score.Recommendations, "Build an emergency fund covering 3-6 months of expenses")
	}
	if score.GoalProgress < 50 && len(goals) > 0 {
		score.Recommendations = append(score.Recommendations, "Increase contributions to your savings goals")
	}

	return score, nil
}

// Helper function to get month comparison data
func (s *analyticsService) getMonthComparison(userID uuid.UUID, transactions []*models.Transaction, startOfMonth time.Time) *MonthComparisonData {
	comparison := &MonthComparisonData{}

	endOfMonth := startOfMonth.AddDate(0, 1, 0)
	startOfPrevMonth := startOfMonth.AddDate(0, -1, 0)

	for _, txn := range transactions {
		if txn.Status == "Completed" {
			// Current month
			if txn.TransactionDate.After(startOfMonth) && txn.TransactionDate.Before(endOfMonth) {
				// Note: Transaction model doesn't have Type field
				// All transactions counted as expenses
				comparison.CurrentMonthExpense += txn.Amount
			}
			// Previous month
			if txn.TransactionDate.After(startOfPrevMonth) && txn.TransactionDate.Before(startOfMonth) {
				// Note: Transaction model doesn't have Type field
				// All transactions counted as expenses
				comparison.PreviousMonthExpense += txn.Amount
			}
		}
	}

	// Calculate percentage changes
	if comparison.PreviousMonthIncome > 0 {
		comparison.IncomeChange = ((comparison.CurrentMonthIncome - comparison.PreviousMonthIncome) / comparison.PreviousMonthIncome) * 100
	}
	if comparison.PreviousMonthExpense > 0 {
		comparison.ExpenseChange = ((comparison.CurrentMonthExpense - comparison.PreviousMonthExpense) / comparison.PreviousMonthExpense) * 100
	}

	return comparison
}
