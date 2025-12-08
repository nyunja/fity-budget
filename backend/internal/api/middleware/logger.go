package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// LoggerMiddleware logs HTTP requests with timing information
func LoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method
		clientIP := c.ClientIP()

		// Process request
		c.Next()

		// Calculate request duration
		duration := time.Since(start)
		statusCode := c.Writer.Status()

		// Get user ID if available
		userID := "anonymous"
		if uid, exists := c.Get("userID"); exists {
			if uuidVal, ok := uid.(uuid.UUID); ok {
				userID = uuidVal.String()
			}
		}

		// Log the request
		log.Printf("[%s] %s %s | Status: %d | Duration: %v | IP: %s | User: %s",
			method,
			path,
			c.Request.Proto,
			statusCode,
			duration,
			clientIP,
			userID,
		)

		// Log errors if any
		if len(c.Errors) > 0 {
			log.Printf("Errors: %v", c.Errors.String())
		}
	}
}
