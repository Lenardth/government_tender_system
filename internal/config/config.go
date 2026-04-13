// Package config loads environment variables and exposes typed configuration.
package config

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

// DB is the shared, process-wide connection pool.
var DB *sql.DB

// ConnectDB opens and validates the MySQL connection pool.
// It fatally exits if the database is unreachable.
func ConnectDB() {
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:3306)/%s?parseTime=true&loc=UTC&charset=utf8mb4",
		Env("DB_USER", "root"),
		Env("DB_PASSWORD", ""),
		Env("DB_HOST", "localhost"),
		Env("DB_NAME", "tender_system"),
	)

	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("config: db open: %v", err)
	}

	DB.SetMaxOpenConns(25)
	DB.SetMaxIdleConns(10)
	DB.SetConnMaxLifetime(5 * time.Minute)

	if err = DB.Ping(); err != nil {
		log.Fatalf("config: db ping: %v", err)
	}
	log.Println("config: database connected")
}

// JWTSecret returns the JWT signing key from the environment.
func JWTSecret() []byte {
	if s := os.Getenv("JWT_SECRET"); s != "" {
		return []byte(s)
	}
	return []byte("tender-system-secret-change-in-production")
}

// Env returns the value of an environment variable or a fallback.
func Env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
