package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SavingGoal struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Name          string         `gorm:"type:varchar(255);not null" json:"name"`
	TargetAmount  float64        `gorm:"type:decimal(12,2);not null" json:"target_amount"`
	CurrentAmount float64        `gorm:"type:decimal(12,2);default:0.00" json:"current_amount"`
	Color         string         `gorm:"type:varchar(20);not null" json:"color"`
	Icon          string         `gorm:"type:varchar(50)" json:"icon,omitempty"`
	Deadline      *time.Time     `gorm:"type:date" json:"deadline,omitempty"`
	Priority      string         `gorm:"type:varchar(20);default:'Medium';index" json:"priority"` // High, Medium, Low
	Category      string         `gorm:"type:varchar(100)" json:"category,omitempty"`
	Status        string         `gorm:"type:varchar(20);default:'Active';index" json:"status"` // Active, Paused, Completed
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies the table name for the SavingGoal model
func (SavingGoal) TableName() string {
	return "saving_goals"
}

// BeforeCreate hook to generate UUID before creating a goal
func (g *SavingGoal) BeforeCreate(tx *gorm.DB) error {
	if g.ID == uuid.Nil {
		g.ID = uuid.New()
	}
	return nil
}

// ProgressPercentage calculates the progress percentage
func (g *SavingGoal) ProgressPercentage() float64 {
	if g.TargetAmount == 0 {
		return 0
	}
	return (g.CurrentAmount / g.TargetAmount) * 100
}

// Remaining calculates the remaining amount to reach the goal
func (g *SavingGoal) Remaining() float64 {
	return g.TargetAmount - g.CurrentAmount
}

// DaysRemaining calculates days remaining until deadline
func (g *SavingGoal) DaysRemaining() *int {
	if g.Deadline == nil {
		return nil
	}
	days := int(time.Until(*g.Deadline).Hours() / 24)
	return &days
}
