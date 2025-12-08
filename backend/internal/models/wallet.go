package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Wallet struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Name          string         `gorm:"type:varchar(255);not null" json:"name"`
	Type          string         `gorm:"type:varchar(50);not null;index" json:"type"` // Mobile Money, Bank, Cash, Credit, Savings
	Balance       float64        `gorm:"type:decimal(12,2);default:0.00" json:"balance"`
	Currency      string         `gorm:"type:varchar(10);default:'KES'" json:"currency"`
	Color         string         `gorm:"type:varchar(20);not null" json:"color"`
	AccountNumber string         `gorm:"type:varchar(100)" json:"account_number,omitempty"`
	IsDefault     bool           `gorm:"default:false;index" json:"is_default"`
	LastSynced    *time.Time     `json:"last_synced,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User         User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:WalletID" json:"transactions,omitempty"`
}

// TableName specifies the table name for the Wallet model
func (Wallet) TableName() string {
	return "wallets"
}

// BeforeCreate hook to generate UUID before creating a wallet
func (w *Wallet) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}
