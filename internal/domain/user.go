// Package domain contains pure business types with no external dependencies.
package domain

import "time"

// Role constants used across the application.
const (
	RoleContractor = "contractor"
	RoleInvestor   = "investor"
	RoleGovernment = "government"
	RoleAdmin      = "admin"
)

// User is the full database representation of a system user.
type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"-"` // never serialised
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// PublicUser is the safe, client-facing subset of a User.
type PublicUser struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Role      string    `json:"role"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

// RegisterInput is the validated payload for user registration.
type RegisterInput struct {
	Name     string `json:"name"     binding:"required,min=2,max=100"`
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Role     string `json:"role"     binding:"required,oneof=contractor investor government"`
}

// LoginInput is the validated payload for user login.
type LoginInput struct {
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// AuthResponse is returned after a successful login or registration.
type AuthResponse struct {
	Token string     `json:"token"`
	User  PublicUser `json:"user"`
}
