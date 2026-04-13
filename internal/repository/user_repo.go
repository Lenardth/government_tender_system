// Package repository handles all direct database interactions.
package repository

import (
	"database/sql"
	"tender-monitoring-system/internal/domain"
)

// UserRepository defines the data access contract for users.
type UserRepository interface {
	FindByEmail(email string) (*domain.User, error)
	FindByID(id int) (*domain.PublicUser, error)
	Create(name, email, hashedPassword, role string) (int64, error)
	ListAll() ([]domain.PublicUser, error)
	SetActive(id int, active bool) error
}

type userRepo struct{ db *sql.DB }

// NewUserRepository returns a UserRepository backed by the given DB pool.
func NewUserRepository(db *sql.DB) UserRepository { return &userRepo{db} }

func (r *userRepo) FindByEmail(email string) (*domain.User, error) {
	u := &domain.User{}
	err := r.db.QueryRow(
		`SELECT id, name, email, password, role, is_active, created_at, updated_at
		 FROM users WHERE email = ? AND is_active = 1`,
		email,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.IsActive, &u.CreatedAt, &u.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *userRepo) FindByID(id int) (*domain.PublicUser, error) {
	u := &domain.PublicUser{}
	err := r.db.QueryRow(
		`SELECT id, name, email, role, is_active, created_at
		 FROM users WHERE id = ?`,
		id,
	).Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.IsActive, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return u, nil
}

func (r *userRepo) Create(name, email, hashedPassword, role string) (int64, error) {
	res, err := r.db.Exec(
		`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
		name, email, hashedPassword, role,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *userRepo) ListAll() ([]domain.PublicUser, error) {
	rows, err := r.db.Query(
		`SELECT id, name, email, role, is_active, created_at
		 FROM users ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := []domain.PublicUser{}
	for rows.Next() {
		var u domain.PublicUser
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.IsActive, &u.CreatedAt); err != nil {
			continue
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

func (r *userRepo) SetActive(id int, active bool) error {
	_, err := r.db.Exec(`UPDATE users SET is_active = ? WHERE id = ?`, active, id)
	return err
}
