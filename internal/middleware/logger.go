package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger logs method, path, status, latency and client IP for every request.
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		log.Printf("%-6s %-40s %d  %s  %s",
			c.Request.Method,
			c.Request.URL.Path,
			c.Writer.Status(),
			time.Since(start).Round(time.Millisecond),
			c.ClientIP(),
		)
	}
}
