// Package service contains business logic, sitting between handlers and repositories.
package service

import (
	"database/sql"
	"errors"
	"strings"
	"tender-monitoring-system/internal/config"
	"tender-monitoring-system/internal/domain"
	"tender-monitoring-system/internal/repository"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Sentinel errors returned by AuthService.
var (
	ErrEmailTaken      = errors.New("email already registered")
	ErrInvalidCreds    = errors.New("invalid credentials")
	ErrUserNotFound    = errors.New("user not found")
)

// AuthService handles registration and login business logic.
type AuthService struct {
	users repository.UserRepository
}

// NewAuthService constructs an AuthService.
func NewAuthService(users repository.UserRepository) *AuthService {
	return &AuthService{users: users}
}

// Register creates a new user and returns a signed JWT.
func (s *AuthService) Register(input domain.RegisterInput) (*domain.AuthResponse, error) {
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Name  = strings.TrimSpace(input.Name)

	// Duplicate check
	existing, err := s.users.FindByEmail(input.Email)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return nil, err
	}
	if existing != nil {
		return nil, ErrEmailTaken
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	id, err := s.users.Create(input.Name, input.Email, string(hash), input.Role)
	if err != nil {
		return nil, err
	}

	token, err := signToken(int(id), input.Name, input.Email, input.Role)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{
		Token: token,
		User: domain.PublicUser{
			ID: int(id), Name: input.Name, Email: input.Email,
			Role: input.Role, IsActive: true, CreatedAt: time.Now(),
		},
	}, nil
}

// Login validates credentials and returns a signed JWT.
func (s *AuthService) Login(input domain.LoginInput) (*domain.AuthResponse, error) {
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	user, err := s.users.FindByEmail(input.Email)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrInvalidCreds
	}
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, ErrInvalidCreds
	}

	token, err := signToken(user.ID, user.Name, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{
		Token: token,
		User: domain.PublicUser{
			ID: user.ID, Name: user.Name, Email: user.Email,
			Role: user.Role, IsActive: user.IsActive, CreatedAt: user.CreatedAt,
		},
	}, nil
}

// signToken creates a signed HS256 JWT for the given user.
func signToken(id int, name, email, role string) (string, error) {
	claims := jwt.MapClaims{
		"id":    id,
		"name":  name,
		"email": email,
		"role":  role,
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(7 * 24 * time.Hour).Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString(config.JWTSecret())
}
