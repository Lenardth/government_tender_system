// Package response provides standardised JSON helpers for Gin handlers.
package response

import "github.com/gin-gonic/gin"

// OK sends HTTP 200 with a JSON body.
func OK(c *gin.Context, data any) { c.JSON(200, data) }

// Created sends HTTP 201 with a JSON body.
func Created(c *gin.Context, data any) { c.JSON(201, data) }

// BadRequest sends HTTP 400 and aborts the chain.
func BadRequest(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(400, gin.H{"message": msg})
}

// Unauthorized sends HTTP 401 and aborts the chain.
func Unauthorized(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(401, gin.H{"message": msg})
}

// Forbidden sends HTTP 403 and aborts the chain.
func Forbidden(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(403, gin.H{"message": msg})
}

// NotFound sends HTTP 404 and aborts the chain.
func NotFound(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(404, gin.H{"message": msg})
}

// Conflict sends HTTP 409 and aborts the chain.
func Conflict(c *gin.Context, msg string) {
	c.AbortWithStatusJSON(409, gin.H{"message": msg})
}

// InternalError sends HTTP 500 and aborts the chain.
func InternalError(c *gin.Context) {
	c.AbortWithStatusJSON(500, gin.H{"message": "Internal server error"})
}
