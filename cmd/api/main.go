// Command api is the entry point for the Tender Monitoring System API server.
package main

import (
	"log"
	"os"
	"tender-monitoring-system/internal/config"
	"tender-monitoring-system/internal/router"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env — silently ignored in production where vars are injected directly.
	if err := godotenv.Load(); err != nil {
		log.Println("api: no .env file, using environment variables")
	}

	// Set Gin mode before creating the engine.
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Connect to the database.
	config.ConnectDB()

	// Build the router (wires all dependencies).
	r := router.New()

	port := config.Env("GO_PORT", "8080")
	log.Printf("api: listening on :%s", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("api: %v", err)
	}
}
