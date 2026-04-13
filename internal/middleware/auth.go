// Package middleware provides Gin middleware for authentication and authorisation.
package middleware

import (
	"strings"
	"tender-monitoring-system/internal/config"
	"tender-monitoring-system/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

const claimsKey = "claims"

// Claims holds the JWT payload stored in the Gin context.
type Claims struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`
	jwt.RegisteredClaims
}

// Authenticate validates the Bearer token and stores claims in the Gin context.
func Authenticate() gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if !strings.HasPrefix(header, "Bearer ") {
			response.Unauthorized(c, "No token provided")
			return
		}
		tokenStr := strings.TrimPrefix(header, "Bearer ")

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return config.JWTSecret(), nil
		})
		if err != nil || !token.Valid {
			response.Unauthorized(c, "Invalid or expired token")
			return
		}

		c.Set(claimsKey, claims)
		c.Next()
	}
}

// Authorize restricts a route to the given roles.
func Authorize(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		claims := GetClaims(c)
		if claims == nil {
			response.Unauthorized(c, "Unauthorized")
			return
		}
		for _, r := range roles {
			if claims.Role == r {
				c.Next()
				return
			}
		}
		response.Forbidden(c, "Access denied")
	}
}

// GetClaims extracts JWT claims from the Gin context.
// Returns nil if the user is not authenticated.
func GetClaims(c *gin.Context) *Claims {
	v, exists := c.Get(claimsKey)
	if !exists {
		return nil
	}
	claims, _ := v.(*Claims)
	return claims
}
