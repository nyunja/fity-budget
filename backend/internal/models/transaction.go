package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Transaction struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	WalletID        *uuid.UUID     `gorm:"type:uuid;index" json:"wallet_id,omitempty"`
	Amount          float64        `gorm:"type:decimal(12,2);not null" json:"amount"`
	Name            string         `gorm:"column:name;type:varchar(255);not null" json:"description"`
	Method          string         `gorm:"type:varchar(100);not null" json:"method"`
	Category        string         `gorm:"type:varchar(100);not null;index" json:"category"`
	Status          string         `gorm:"type:varchar(20);default:'Completed';index" json:"status"` // Completed, Pending, Failed
	Notes           string         `gorm:"type:text" json:"notes,omitempty"`
	ReceiptURL      string         `gorm:"type:varchar(500)" json:"receipt_url,omitempty"`
	TransactionDate time.Time      `gorm:"not null;index" json:"transaction_date"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User   User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Wallet *Wallet `gorm:"foreignKey:WalletID" json:"wallet,omitempty"`
}

// TableName specifies the table name for the Transaction model
func (Transaction) TableName() string {
	return "transactions"
}

// BeforeCreate hook to generate UUID before creating a transaction
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	// Set transaction date to now if not provided
	if t.TransactionDate.IsZero() {
		t.TransactionDate = time.Now()
	}
	return nil
}
