// Package handler contains Gin HTTP handlers. Each handler is thin:
// it binds input, calls a service, and writes the response.
package handler

import (
	"errors"
	"net/http"
	"tender-monitoring-system/internal/domain"
	"tender-monitoring-system/internal/service"
	"tender-monitoring-system/pkg/response"

	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication endpoints.
type AuthHandler struct {
	svc *service.AuthService
}

// NewAuthHandler constructs an AuthHandler.
func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

// Register godoc
// POST /api/auth/register
func (h *AuthHandler) Register(c *gin.Context) {
	var input domain.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.Register(input)
	if errors.Is(err, service.ErrEmailTaken) {
		response.Conflict(c, err.Error())
		return
	}
	if err != nil {
		response.InternalError(c)
		return
	}
	c.JSON(http.StatusCreated, resp)
}

// Login godoc
// POST /api/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var input domain.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	resp, err := h.svc.Login(input)
	if errors.Is(err, service.ErrInvalidCreds) {
		response.Unauthorized(c, "Invalid email or password")
		return
	}
	if err != nil {
		response.InternalError(c)
		return
	}
	response.OK(c, resp)
}
