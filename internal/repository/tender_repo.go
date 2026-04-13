package repository

import (
	"database/sql"
	"fmt"
	"tender-monitoring-system/internal/domain"
)

// TenderRepository defines the data access contract for tenders.
type TenderRepository interface {
	List(f domain.TenderFilter) ([]domain.Tender, error)
	FindByID(id int) (*domain.Tender, error)
	Create(input domain.CreateTenderInput, createdBy int) (int64, error)
	Apply(tenderID, userID int, proposal string, bidAmount float64) error
	GetApplications(tenderID int) ([]domain.Application, error)
	GetUserApplications(userID int) ([]domain.Application, error)
}

type tenderRepo struct{ db *sql.DB }

// NewTenderRepository returns a TenderRepository backed by the given DB pool.
func NewTenderRepository(db *sql.DB) TenderRepository { return &tenderRepo{db} }

func (r *tenderRepo) List(f domain.TenderFilter) ([]domain.Tender, error) {
	query := `SELECT id, title, description, category, budget, deadline,
	                 location, province, status, created_at
	          FROM tenders WHERE 1=1`
	args := []any{}

	if f.Status != "" {
		query += " AND status = ?"
		args = append(args, f.Status)
	}
	if f.Category != "" {
		query += " AND category = ?"
		args = append(args, f.Category)
	}
	if f.Search != "" {
		query += " AND (title LIKE ? OR description LIKE ?)"
		like := fmt.Sprintf("%%%s%%", f.Search)
		args = append(args, like, like)
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tenders := []domain.Tender{}
	for rows.Next() {
		var t domain.Tender
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Category,
			&t.Budget, &t.Deadline, &t.Location, &t.Province, &t.Status, &t.CreatedAt); err != nil {
			continue
		}
		tenders = append(tenders, t)
	}
	return tenders, rows.Err()
}

func (r *tenderRepo) FindByID(id int) (*domain.Tender, error) {
	t := &domain.Tender{}
	err := r.db.QueryRow(
		`SELECT id, title, description, category, budget, deadline,
		        location, province, status, created_at
		 FROM tenders WHERE id = ?`, id,
	).Scan(&t.ID, &t.Title, &t.Description, &t.Category,
		&t.Budget, &t.Deadline, &t.Location, &t.Province, &t.Status, &t.CreatedAt)
	if err != nil {
		return nil, err
	}
	return t, nil
}

func (r *tenderRepo) Create(input domain.CreateTenderInput, createdBy int) (int64, error) {
	res, err := r.db.Exec(
		`INSERT INTO tenders
		 (title, description, category, budget, deadline, location, province, created_by)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		input.Title, input.Description, input.Category, input.Budget,
		input.Deadline, input.Location, input.Province, createdBy,
	)
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (r *tenderRepo) Apply(tenderID, userID int, proposal string, bidAmount float64) error {
	_, err := r.db.Exec(
		`INSERT INTO applications (tender_id, user_id, proposal, bid_amount)
		 VALUES (?, ?, ?, ?)`,
		tenderID, userID, proposal, bidAmount,
	)
	return err
}

func (r *tenderRepo) GetApplications(tenderID int) ([]domain.Application, error) {
	rows, err := r.db.Query(
		`SELECT a.id, a.tender_id, a.user_id, a.proposal, a.bid_amount,
		        a.status, a.submitted_at, u.name, u.email
		 FROM applications a
		 JOIN users u ON a.user_id = u.id
		 WHERE a.tender_id = ?
		 ORDER BY a.submitted_at DESC`,
		tenderID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	apps := []domain.Application{}
	for rows.Next() {
		var a domain.Application
		if err := rows.Scan(&a.ID, &a.TenderID, &a.UserID, &a.Proposal, &a.BidAmount,
			&a.Status, &a.SubmittedAt, &a.ApplicantName, &a.ApplicantEmail); err != nil {
			continue
		}
		apps = append(apps, a)
	}
	return apps, rows.Err()
}

func (r *tenderRepo) GetUserApplications(userID int) ([]domain.Application, error) {
	rows, err := r.db.Query(
		`SELECT a.id, a.tender_id, a.proposal, a.bid_amount, a.status, a.submitted_at,
		        t.title, t.category, t.budget, t.deadline
		 FROM applications a
		 JOIN tenders t ON a.tender_id = t.id
		 WHERE a.user_id = ?
		 ORDER BY a.submitted_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	apps := []domain.Application{}
	for rows.Next() {
		var a domain.Application
		if err := rows.Scan(&a.ID, &a.TenderID, &a.Proposal, &a.BidAmount,
			&a.Status, &a.SubmittedAt, &a.TenderTitle, &a.Category, &a.Budget, &a.Deadline); err != nil {
			continue
		}
		a.UserID = userID
		apps = append(apps, a)
	}
	return apps, rows.Err()
}
