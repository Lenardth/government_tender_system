package handler

import (
	"database/sql"
	"errors"
	"tender-monitoring-system/internal/middleware"
	"tender-monitoring-system/internal/repository"
	"tender-monitoring-system/internal/service"
	"tender-monitoring-system/pkg/response"

	"github.com/gin-gonic/gin"
)

// UserHandler handles user profile and management endpoints.
type UserHandler struct {
	users   repository.UserRepository
	tenders *service.TenderService
}

// NewUserHandler constructs a UserHandler.
func NewUserHandler(users repository.UserRepository, tenders *service.TenderService) *UserHandler {
	return &UserHandler{users: users, tenders: tenders}
}

// Me godoc
// GET /api/users/me
func (h *UserHandler) Me(c *gin.Context) {
	claims := middleware.GetClaims(c)
	user, err := h.users.FindByID(claims.ID)
	if errors.Is(err, sql.ErrNoRows) {
		response.NotFound(c, "User not found")
		return
	}
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, user)
}

// MyApplications godoc
// GET /api/users/me/applications  (contractor)
func (h *UserHandler) MyApplications(c *gin.Context) {
	claims := middleware.GetClaims(c)
	apps, err := h.tenders.GetUserApplications(claims.ID)
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, apps)
}

// ListAll godoc
// GET /api/users  (admin)
func (h *UserHandler) ListAll(c *gin.Context) {
	users, err := h.users.ListAll()
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, users)
}

// UpdateStatus godoc
// PATCH /api/users/:id/status  (admin)
func (h *UserHandler) UpdateStatus(c *gin.Context) {
	id, err := parseID(c, "id")
	if err != nil {
		return
	}
	var body struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		response.BadRequest(c, "is_active (bool) is required")
		return
	}
	if err := h.users.SetActive(id, body.IsActive); err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, gin.H{"message": "User status updated"})
}
