package handler

import (
	"errors"
	"net/http"
	"strconv"
	"tender-monitoring-system/internal/domain"
	"tender-monitoring-system/internal/middleware"
	"tender-monitoring-system/internal/service"
	"tender-monitoring-system/pkg/response"

	"github.com/gin-gonic/gin"
)

// TenderHandler handles tender endpoints.
type TenderHandler struct {
	svc *service.TenderService
}

// NewTenderHandler constructs a TenderHandler.
func NewTenderHandler(svc *service.TenderService) *TenderHandler {
	return &TenderHandler{svc: svc}
}

// List godoc
// GET /api/tenders
func (h *TenderHandler) List(c *gin.Context) {
	filter := domain.TenderFilter{
		Status:   c.DefaultQuery("status", "open"),
		Category: c.Query("category"),
		Search:   c.Query("search"),
	}
	tenders, err := h.svc.List(filter)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, tenders)
}

// Get godoc
// GET /api/tenders/:id
func (h *TenderHandler) Get(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	tender, err := h.svc.GetByID(id)
	if errors.Is(err, service.ErrTenderNotFound) {
		response.NotFound(c, "Tender not found")
		return
	}
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, tender)
}

// Create godoc
// POST /api/tenders  (government / admin)
func (h *TenderHandler) Create(c *gin.Context) {
	var input domain.CreateTenderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	claims := middleware.GetClaims(c)
	id, err := h.svc.Create(input, claims.ID)
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusCreated, gin.H{"id": id, "message": "Tender created"})
}

// Apply godoc
// POST /api/tenders/:id/apply  (contractor)
func (h *TenderHandler) Apply(c *gin.Context) {
	tenderID, err := parseID(c, "id")
	if err != nil {
		return
	}
	var input domain.ApplyInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}
	claims := middleware.GetClaims(c)
	err = h.svc.Apply(tenderID, claims.ID, input)
	switch {
	case errors.Is(err, service.ErrTenderNotFound):
		response.NotFound(c, err.Error())
	case errors.Is(err, service.ErrTenderClosed):
		response.BadRequest(c, err.Error())
	case errors.Is(err, service.ErrAlreadyApplied):
		response.Conflict(c, err.Error())
	case err != nil:
		response.InternalError(c)
	default:
		c.JSON(http.StatusCreated, gin.H{"message": "Application submitted successfully"})
	}
}

// GetApplications godoc
// GET /api/tenders/:id/applications  (government / admin)
func (h *TenderHandler) GetApplications(c *gin.Context) {
	tenderID, err := parseID(c, "id")
	if err != nil {
		return
	}
	apps, err := h.svc.GetApplications(tenderID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, apps)
}

// parseID extracts and validates an integer path parameter.
func parseID(c *gin.Context, param string) (int, error) {
	id, err := strconv.Atoi(c.Param(param))
	if err != nil {
		response.BadRequest(c, "Invalid ID")
		return 0, err
	}
	return id, nil
}
