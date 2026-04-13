package handler

import (
	"errors"
	"tender-monitoring-system/internal/service"
	"tender-monitoring-system/pkg/response"

	"github.com/gin-gonic/gin"
)

// BlockchainHandler handles blockchain audit endpoints.
type BlockchainHandler struct {
	svc *service.BlockchainService
}

// NewBlockchainHandler constructs a BlockchainHandler.
func NewBlockchainHandler(svc *service.BlockchainService) *BlockchainHandler {
	return &BlockchainHandler{svc: svc}
}

// AuditTrail godoc
// GET /api/blockchain/audit
func (h *BlockchainHandler) AuditTrail(c *gin.Context) {
	entries, err := h.svc.AuditTrail(100)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, entries)
}

// Verify godoc
// POST /api/blockchain/verify
func (h *BlockchainHandler) Verify(c *gin.Context) {
	var body struct {
		Hash     string `json:"hash"      binding:"required"`
		RecordID int    `json:"record_id" binding:"required,gt=0"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	result, err := h.svc.Verify(body.RecordID, body.Hash)
	if errors.Is(err, service.ErrRecordNotFound) {
		response.NotFound(c, "Audit record not found")
		return
	}
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, result)
}

// Stats godoc
// GET /api/blockchain/stats
func (h *BlockchainHandler) Stats(c *gin.Context) {
	stats, err := h.svc.Stats()
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, stats)
}
