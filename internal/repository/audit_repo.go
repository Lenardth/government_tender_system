package repository

import (
	"database/sql"
	"log"
	"tender-monitoring-system/internal/domain"
)

// AuditRepository defines the data access contract for the audit log.
type AuditRepository interface {
	Write(userID *int, action, entity string, entityID *int, details, ip string)
	List(limit int) ([]domain.AuditEntry, error)
	FindByID(id int) (*domain.AuditEntry, error)
	Stats() (map[string]int, error)
}

type auditRepo struct{ db *sql.DB }

// NewAuditRepository returns an AuditRepository backed by the given DB pool.
func NewAuditRepository(db *sql.DB) AuditRepository { return &auditRepo{db} }

// Write inserts an audit record asynchronously (fire-and-forget).
func (r *auditRepo) Write(userID *int, action, entity string, entityID *int, details, ip string) {
	go func() {
		_, err := r.db.Exec(
			`INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip_address)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			userID, action, entity, entityID, details, ip,
		)
		if err != nil {
			log.Printf("audit: write failed: %v", err)
		}
	}()
}

func (r *auditRepo) List(limit int) ([]domain.AuditEntry, error) {
	rows, err := r.db.Query(
		`SELECT id, user_id, action, COALESCE(entity,''), entity_id,
		        COALESCE(details,''), COALESCE(ip_address,''), created_at
		 FROM audit_log
		 ORDER BY created_at DESC
		 LIMIT ?`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := []domain.AuditEntry{}
	for rows.Next() {
		var e domain.AuditEntry
		if err := rows.Scan(&e.ID, &e.UserID, &e.Action, &e.Entity,
			&e.EntityID, &e.Details, &e.IPAddress, &e.CreatedAt); err != nil {
			continue
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

func (r *auditRepo) FindByID(id int) (*domain.AuditEntry, error) {
	e := &domain.AuditEntry{}
	err := r.db.QueryRow(
		`SELECT id, user_id, action, COALESCE(entity,''), entity_id,
		        COALESCE(details,''), COALESCE(ip_address,''), created_at
		 FROM audit_log WHERE id = ?`, id,
	).Scan(&e.ID, &e.UserID, &e.Action, &e.Entity,
		&e.EntityID, &e.Details, &e.IPAddress, &e.CreatedAt)
	if err != nil {
		return nil, err
	}
	return e, nil
}

func (r *auditRepo) Stats() (map[string]int, error) {
	stats := map[string]int{}
	rows := []struct {
		query string
		key   string
	}{
		{"SELECT COUNT(*) FROM audit_log", "verified_records"},
		{"SELECT COUNT(*) FROM tenders", "total_tenders"},
		{"SELECT COUNT(*) FROM applications", "total_applications"},
		{"SELECT COUNT(*) FROM users", "total_users"},
	}
	for _, q := range rows {
		var n int
		if err := r.db.QueryRow(q.query).Scan(&n); err != nil {
			return nil, err
		}
		stats[q.key] = n
	}
	return stats, nil
}
