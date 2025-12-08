package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	Email        string         `gorm:"type:varchar(255);not null;uniqueIndex" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"` // "-" means don't include in JSON
	IsOnboarded  bool           `gorm:"default:false" json:"is_onboarded"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Transactions []Transaction `gorm:"foreignKey:UserID" json:"transactions,omitempty"`
	Goals        []SavingGoal  `gorm:"foreignKey:UserID" json:"goals,omitempty"`
	Budgets      []Budget      `gorm:"foreignKey:UserID" json:"budgets,omitempty"`
	Wallets      []Wallet      `gorm:"foreignKey:UserID" json:"wallets,omitempty"`
}

// TableName specifies the table name for the User model
func (User) TableName() string {
	return "users"
}

// BeforeCreate hook to generate UUID before creating a user
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}
