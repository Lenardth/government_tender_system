package service

import (
	"crypto/sha256"
	"errors"
	"fmt"
	"tender-monitoring-system/internal/domain"
	"tender-monitoring-system/internal/repository"
	"time"
)

// ErrRecordNotFound is returned when an audit record does not exist.
var ErrRecordNotFound = errors.New("record not found")

// BlockchainService handles audit trail and hash verification logic.
type BlockchainService struct {
	audit repository.AuditRepository
}

// NewBlockchainService constructs a BlockchainService.
func NewBlockchainService(audit repository.AuditRepository) *BlockchainService {
	return &BlockchainService{audit: audit}
}

// AuditTrail returns the most recent audit entries with computed hashes.
func (s *BlockchainService) AuditTrail(limit int) ([]domain.AuditEntry, error) {
	entries, err := s.audit.List(limit)
	if err != nil {
		return nil, err
	}
	for i := range entries {
		entries[i].Hash = ComputeHash(entries[i])
	}
	return entries, nil
}

// Verify checks whether the provided hash matches the stored record.
func (s *BlockchainService) Verify(recordID int, providedHash string) (map[string]any, error) {
	entry, err := s.audit.FindByID(recordID)
	if err != nil {
		return nil, ErrRecordNotFound
	}
	expected := ComputeHash(*entry)
	return map[string]any{
		"verified":      expected == providedHash,
		"expected_hash": expected,
		"provided_hash": providedHash,
		"record":        entry,
		"verified_at":   time.Now().UTC(),
	}, nil
}

// Stats returns aggregate system statistics.
func (s *BlockchainService) Stats() (map[string]any, error) {
	counts, err := s.audit.Stats()
	if err != nil {
		return nil, err
	}
	result := map[string]any{
		"network_nodes":  5,
		"last_block_time": time.Now().UTC(),
	}
	for k, v := range counts {
		result[k] = v
	}
	return result, nil
}

// ComputeHash generates a deterministic SHA-256 hash for an audit entry.
func ComputeHash(e domain.AuditEntry) string {
	raw := fmt.Sprintf("%d|%s|%s|%s|%s",
		e.ID, e.Action, e.Entity, e.Details,
		e.CreatedAt.UTC().Format(time.RFC3339),
	)
	return fmt.Sprintf("%x", sha256.Sum256([]byte(raw)))
}
