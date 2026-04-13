package service

import (
	"database/sql"
	"errors"
	"strings"
	"tender-monitoring-system/internal/domain"
	"tender-monitoring-system/internal/repository"
)

// Sentinel errors returned by TenderService.
var (
	ErrTenderNotFound   = errors.New("tender not found")
	ErrTenderClosed     = errors.New("tender is not open for applications")
	ErrAlreadyApplied   = errors.New("you have already applied for this tender")
)

// TenderService handles tender business logic.
type TenderService struct {
	tenders repository.TenderRepository
}

// NewTenderService constructs a TenderService.
func NewTenderService(tenders repository.TenderRepository) *TenderService {
	return &TenderService{tenders: tenders}
}

// List returns tenders matching the given filter.
func (s *TenderService) List(f domain.TenderFilter) ([]domain.Tender, error) {
	f.Search = strings.TrimSpace(f.Search)
	return s.tenders.List(f)
}

// GetByID returns a single tender or ErrTenderNotFound.
func (s *TenderService) GetByID(id int) (*domain.Tender, error) {
	t, err := s.tenders.FindByID(id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrTenderNotFound
	}
	return t, err
}

// Create inserts a new tender and returns its ID.
func (s *TenderService) Create(input domain.CreateTenderInput, createdBy int) (int64, error) {
	return s.tenders.Create(input, createdBy)
}

// Apply submits a contractor application for a tender.
func (s *TenderService) Apply(tenderID, userID int, input domain.ApplyInput) error {
	tender, err := s.tenders.FindByID(tenderID)
	if errors.Is(err, sql.ErrNoRows) {
		return ErrTenderNotFound
	}
	if err != nil {
		return err
	}
	if tender.Status != "open" {
		return ErrTenderClosed
	}

	err = s.tenders.Apply(tenderID, userID, input.Proposal, input.BidAmount)
	if err != nil && strings.Contains(err.Error(), "Duplicate entry") {
		return ErrAlreadyApplied
	}
	return err
}

// GetApplications returns all applications for a tender.
func (s *TenderService) GetApplications(tenderID int) ([]domain.Application, error) {
	return s.tenders.GetApplications(tenderID)
}

// GetUserApplications returns all applications submitted by a user.
func (s *TenderService) GetUserApplications(userID int) ([]domain.Application, error) {
	return s.tenders.GetUserApplications(userID)
}
