-- ============================================================
-- Tender Monitoring System — Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS tender_system;
USE tender_system;

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role        ENUM('contractor','investor','government','admin') NOT NULL DEFAULT 'contractor',
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role  (role)
);

-- ── Tenders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255)  NOT NULL,
    description TEXT,
    category    ENUM('construction','it','healthcare','energy','education','transport','other') NOT NULL,
    budget      DECIMAL(15,2) NOT NULL,
    deadline    DATE          NOT NULL,
    location    VARCHAR(150),
    province    VARCHAR(100),
    status      ENUM('open','closed','awarded','cancelled') NOT NULL DEFAULT 'open',
    created_by  INT,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status   (status),
    INDEX idx_category (category)
);

-- ── Applications ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    tender_id    INT           NOT NULL,
    user_id      INT           NOT NULL,
    proposal     TEXT,
    bid_amount   DECIMAL(15,2),
    status       ENUM('pending','reviewed','accepted','rejected') NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tender_id) REFERENCES tenders(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
    UNIQUE KEY uq_application (tender_id, user_id)
);

-- ── Audit Log (blockchain-style immutable trail) ──────────────
CREATE TABLE IF NOT EXISTS audit_log (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT,
    action      VARCHAR(100)  NOT NULL,
    entity      VARCHAR(50),
    entity_id   INT,
    details     TEXT,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_action    (action),
    INDEX idx_entity    (entity, entity_id),
    INDEX idx_created   (created_at)
);
