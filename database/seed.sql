-- ============================================================
-- Seed Data (passwords are bcrypt hashes of "Password123!")
-- ============================================================
USE tender_system;

INSERT INTO users (name, email, password, role) VALUES
('Admin User',       'admin@tendersystem.gov.za',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('John Contractor',  'contractor@example.com',          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'contractor'),
('Sarah Investor',   'investor@example.com',            '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'investor'),
('Gov Official',     'government@tendersystem.gov.za',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'government');

INSERT INTO tenders (title, description, category, budget, deadline, location, province, status, created_by) VALUES
('Cape Town Road Infrastructure', 'Development of road infrastructure in Cape Town metropolitan area.', 'construction', 25000000.00, '2025-09-30', 'Cape Town', 'Western Cape', 'open', 4),
('Durban Port Expansion',         'Expansion of Durban port facilities to increase cargo handling capacity.', 'construction', 50000000.00, '2025-10-15', 'Durban', 'KwaZulu-Natal', 'open', 4),
('Johannesburg Solar Initiative', 'Installation of solar panels on government buildings in Johannesburg.', 'energy', 15000000.00, '2025-08-10', 'Johannesburg', 'Gauteng', 'open', 4),
('National Healthcare Database',  'Development of a centralized healthcare database system for public hospitals.', 'it', 12000000.00, '2025-07-20', 'Pretoria', 'Gauteng', 'open', 4),
('East London Hospital Renovation','Comprehensive renovation of East London General Hospital.', 'healthcare', 30000000.00, '2025-11-01', 'East London', 'Eastern Cape', 'open', 4);
