// Package router wires all handlers, middleware and routes into a Gin engine.
package router

import (
	"tender-monitoring-system/internal/config"
	"tender-monitoring-system/internal/domain"
	"tender-monitoring-system/internal/handler"
	"tender-monitoring-system/internal/middleware"
	"tender-monitoring-system/internal/repository"
	"tender-monitoring-system/internal/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// New builds and returns a fully configured Gin engine.
func New() *gin.Engine {
	// ── Dependency graph ──────────────────────────────────────
	// Repositories
	userRepo   := repository.NewUserRepository(config.DB)
	tenderRepo := repository.NewTenderRepository(config.DB)
	auditRepo  := repository.NewAuditRepository(config.DB)

	// Services
	authSvc       := service.NewAuthService(userRepo)
	tenderSvc     := service.NewTenderService(tenderRepo)
	blockchainSvc := service.NewBlockchainService(auditRepo)

	// Handlers
	authH       := handler.NewAuthHandler(authSvc)
	tenderH     := handler.NewTenderHandler(tenderSvc)
	userH       := handler.NewUserHandler(userRepo, tenderSvc)
	blockchainH := handler.NewBlockchainHandler(blockchainSvc)

	// ── Engine ────────────────────────────────────────────────
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Authorization"},
	}))

	// ── Health ────────────────────────────────────────────────
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "tender-monitoring-api"})
	})

	// ── API v1 ────────────────────────────────────────────────
	v1 := r.Group("/api")

	// Auth (public)
	auth := v1.Group("/auth")
	{
		auth.POST("/register", authH.Register)
		auth.POST("/login",    authH.Login)
	}

	// Tenders (public read)
	tenders := v1.Group("/tenders")
	{
		tenders.GET("",    tenderH.List)
		tenders.GET("/:id", tenderH.Get)

		// Government / admin: create tender
		tenders.POST("",
			middleware.Authenticate(),
			middleware.Authorize(domain.RoleGovernment, domain.RoleAdmin),
			tenderH.Create,
		)
		// Contractor: apply
		tenders.POST("/:id/apply",
			middleware.Authenticate(),
			middleware.Authorize(domain.RoleContractor),
			tenderH.Apply,
		)
		// Government / admin: view applications
		tenders.GET("/:id/applications",
			middleware.Authenticate(),
			middleware.Authorize(domain.RoleGovernment, domain.RoleAdmin),
			tenderH.GetApplications,
		)
	}

	// Users (authenticated)
	users := v1.Group("/users", middleware.Authenticate())
	{
		users.GET("/me", userH.Me)
		users.GET("/me/applications",
			middleware.Authorize(domain.RoleContractor),
			userH.MyApplications,
		)
		// Admin only
		users.GET("",
			middleware.Authorize(domain.RoleAdmin),
			userH.ListAll,
		)
		users.PATCH("/:id/status",
			middleware.Authorize(domain.RoleAdmin),
			userH.UpdateStatus,
		)
	}

	// Blockchain (government / admin)
	blockchain := v1.Group("/blockchain",
		middleware.Authenticate(),
		middleware.Authorize(domain.RoleGovernment, domain.RoleAdmin),
	)
	{
		blockchain.GET("/audit",   blockchainH.AuditTrail)
		blockchain.POST("/verify", blockchainH.Verify)
		blockchain.GET("/stats",   blockchainH.Stats)
	}

	return r
}
