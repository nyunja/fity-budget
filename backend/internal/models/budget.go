package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Budget struct {
	ID             uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Category       string         `gorm:"type:varchar(100);not null;index" json:"category"`
	LimitAmount    float64        `gorm:"type:decimal(12,2);not null" json:"limit_amount"`
	Color          string         `gorm:"type:varchar(20);not null" json:"color"`
	Icon           string         `gorm:"type:varchar(50)" json:"icon,omitempty"`
	IsRollover     bool           `gorm:"default:false" json:"is_rollover"`
	Type           string         `gorm:"type:varchar(20);default:'Variable'" json:"type"` // Fixed, Variable
	AlertThreshold int            `gorm:"default:80" json:"alert_threshold"`               // Percentage (0-100)
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies the table name for the Budget model
func (Budget) TableName() string {
	return "budgets"
}

// BeforeCreate hook to generate UUID before creating a budget
func (b *Budget) BeforeCreate(tx *gorm.DB) error {
	if b.ID == uuid.Nil {
		b.ID = uuid.New()
	}
	return nil
}
