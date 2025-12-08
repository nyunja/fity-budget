package mocks

import (
	"time"

	"github.com/google/uuid"
	"github.com/nyunja/fity-budget-backend/internal/services"
)

// MockAnalyticsService is a mock implementation of AnalyticsService
type MockAnalyticsService struct {
	GetDashboardSummaryFunc      func(userID uuid.UUID) (*services.DashboardSummary, error)
	GetSpendingByCategoryFunc    func(userID uuid.UUID, startDate, endDate time.Time) ([]*services.CategorySpending, error)
	GetIncomeVsExpenseFunc       func(userID uuid.UUID, period string) (*services.IncomeVsExpenseReport, error)
	GetMonthlyTrendsFunc         func(userID uuid.UUID, months int) (*services.MonthlyTrends, error)
	GetFinancialHealthScoreFunc  func(userID uuid.UUID) (*services.FinancialHealthScore, error)
}

func (m *MockAnalyticsService) GetDashboardSummary(userID uuid.UUID) (*services.DashboardSummary, error) {
	if m.GetDashboardSummaryFunc != nil {
		return m.GetDashboardSummaryFunc(userID)
	}
	return nil, nil
}

func (m *MockAnalyticsService) GetSpendingByCategory(userID uuid.UUID, startDate, endDate time.Time) ([]*services.CategorySpending, error) {
	if m.GetSpendingByCategoryFunc != nil {
		return m.GetSpendingByCategoryFunc(userID, startDate, endDate)
	}
	return nil, nil
}

func (m *MockAnalyticsService) GetIncomeVsExpense(userID uuid.UUID, period string) (*services.IncomeVsExpenseReport, error) {
	if m.GetIncomeVsExpenseFunc != nil {
		return m.GetIncomeVsExpenseFunc(userID, period)
	}
	return nil, nil
}

func (m *MockAnalyticsService) GetMonthlyTrends(userID uuid.UUID, months int) (*services.MonthlyTrends, error) {
	if m.GetMonthlyTrendsFunc != nil {
		return m.GetMonthlyTrendsFunc(userID, months)
	}
	return nil, nil
}

func (m *MockAnalyticsService) GetFinancialHealthScore(userID uuid.UUID) (*services.FinancialHealthScore, error) {
	if m.GetFinancialHealthScoreFunc != nil {
		return m.GetFinancialHealthScoreFunc(userID)
	}
	return nil, nil
}
