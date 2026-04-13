package domain

import "time"

// Tender represents a government procurement tender.
type Tender struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	Budget      float64   `json:"budget"`
	Deadline    string    `json:"deadline"`
	Location    string    `json:"location"`
	Province    string    `json:"province"`
	Status      string    `json:"status"`
	CreatedBy   *int      `json:"created_by,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// CreateTenderInput is the validated payload for creating a tender.
type CreateTenderInput struct {
	Title       string  `json:"title"    binding:"required,min=5,max=255"`
	Description string  `json:"description"`
	Category    string  `json:"category" binding:"required,oneof=construction it healthcare energy education transport other"`
	Budget      float64 `json:"budget"   binding:"required,gt=0"`
	Deadline    string  `json:"deadline" binding:"required"`
	Location    string  `json:"location"`
	Province    string  `json:"province"`
}

// TenderFilter holds optional query parameters for listing tenders.
type TenderFilter struct {
	Status   string
	Category string
	Search   string
}

// Application represents a contractor's bid on a tender.
type Application struct {
	ID          int       `json:"id"`
	TenderID    int       `json:"tender_id"`
	UserID      int       `json:"user_id"`
	Proposal    string    `json:"proposal"`
	BidAmount   float64   `json:"bid_amount"`
	Status      string    `json:"status"`
	SubmittedAt time.Time `json:"submitted_at"`
	// Joined fields (populated by repository)
	TenderTitle    string  `json:"tender_title,omitempty"`
	Category       string  `json:"category,omitempty"`
	Budget         float64 `json:"budget,omitempty"`
	Deadline       string  `json:"deadline,omitempty"`
	ApplicantName  string  `json:"applicant_name,omitempty"`
	ApplicantEmail string  `json:"applicant_email,omitempty"`
}

// ApplyInput is the validated payload for submitting a tender application.
type ApplyInput struct {
	Proposal  string  `json:"proposal"   binding:"required"`
	BidAmount float64 `json:"bid_amount" binding:"required,gt=0"`
}

// AuditEntry is a single immutable record in the audit trail.
type AuditEntry struct {
	ID        int       `json:"id"`
	UserID    *int      `json:"user_id,omitempty"`
	Action    string    `json:"action"`
	Entity    string    `json:"entity,omitempty"`
	EntityID  *int      `json:"entity_id,omitempty"`
	Details   string    `json:"details,omitempty"`
	IPAddress string    `json:"ip_address,omitempty"`
	Hash      string    `json:"hash,omitempty"`
	CreatedAt time.Time `json:"created_at"`
}
