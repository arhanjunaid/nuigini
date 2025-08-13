-- Nuigini Insurance Database Initialization Script
-- This script creates all necessary tables for the microservices architecture

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS nuigini_insurance;
USE nuigini_insurance;

-- Drop existing tables if they exist (for clean initialization)
DROP TABLE IF EXISTS `PolicyRiskItems`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `reserves`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `claims`;
DROP TABLE IF EXISTS `coverages`;
DROP TABLE IF EXISTS `policies`;
DROP TABLE IF EXISTS `quotes`;
DROP TABLE IF EXISTS `risk_items`;
DROP TABLE IF EXISTS `addresses`;
DROP TABLE IF EXISTS `parties`;
DROP TABLE IF EXISTS `cessions`;
DROP TABLE IF EXISTS `treaties`;
DROP TABLE IF EXISTS `rating_tables`;
DROP TABLE IF EXISTS `uw_rules`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `leads`;

-- Create roles table
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `permissions` json COMMENT 'JSON object with resource:actions mapping',
  `is_active` tinyint(1) DEFAULT '1',
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create users table
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone` varchar(20),
  `date_of_birth` date,
  `role_id` int,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_foreign_idx` (`role_id`),
  CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create leads table
CREATE TABLE `leads` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20),
  `company` varchar(100),
  `source` varchar(50),
  `status` enum('new','contacted','qualified','converted','lost') DEFAULT 'new',
  `notes` text,
  `assigned_to` int,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `leads_assigned_to_foreign_idx` (`assigned_to`),
  CONSTRAINT `leads_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create addresses table
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `street_address` varchar(255) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `address_type` enum('home','business','mailing') DEFAULT 'home',
  `is_primary` tinyint(1) DEFAULT '0',
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create parties table
CREATE TABLE `parties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('individual','company') NOT NULL,
  `first_name` varchar(50),
  `last_name` varchar(50),
  `company_name` varchar(100),
  `email` varchar(100),
  `phone` varchar(20),
  `date_of_birth` date,
  `tax_id` varchar(50),
  `address_id` int,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `parties_address_id_foreign_idx` (`address_id`),
  CONSTRAINT `parties_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create quotes table
CREATE TABLE `quotes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quote_number` varchar(50) NOT NULL,
  `customer_id` int NOT NULL,
  `product_type` varchar(50) NOT NULL,
  `coverage_amount` decimal(15,2) NOT NULL,
  `premium_amount` decimal(10,2) NOT NULL,
  `status` enum('draft','pending','approved','rejected','expired') DEFAULT 'draft',
  `valid_until` datetime,
  `underwriter_id` int,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `quotes_quote_number_unique` (`quote_number`),
  KEY `quotes_customer_id_foreign_idx` (`customer_id`),
  KEY `quotes_underwriter_id_foreign_idx` (`underwriter_id`),
  CONSTRAINT `quotes_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `parties` (`id`),
  CONSTRAINT `quotes_underwriter_id_fkey` FOREIGN KEY (`underwriter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create risk_items table
CREATE TABLE `risk_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quote_id` int NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` text,
  `value` decimal(15,2),
  `address_id` int,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `risk_items_quote_id_foreign_idx` (`quote_id`),
  KEY `risk_items_address_id_foreign_idx` (`address_id`),
  CONSTRAINT `risk_items_quote_id_fkey` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `risk_items_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create policies table
CREATE TABLE `policies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policy_number` varchar(50) NOT NULL,
  `quote_id` int NOT NULL,
  `customer_id` int NOT NULL,
  `product_type` varchar(50) NOT NULL,
  `coverage_amount` decimal(15,2) NOT NULL,
  `premium_amount` decimal(10,2) NOT NULL,
  `status` enum('active','cancelled','expired','suspended') DEFAULT 'active',
  `effective_date` date NOT NULL,
  `expiry_date` date NOT NULL,
  `underwriter_id` int,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `policies_policy_number_unique` (`policy_number`),
  KEY `policies_quote_id_foreign_idx` (`quote_id`),
  KEY `policies_customer_id_foreign_idx` (`customer_id`),
  KEY `policies_underwriter_id_foreign_idx` (`underwriter_id`),
  CONSTRAINT `policies_quote_id_fkey` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`),
  CONSTRAINT `policies_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `parties` (`id`),
  CONSTRAINT `policies_underwriter_id_fkey` FOREIGN KEY (`underwriter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create coverages table
CREATE TABLE `coverages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quote_id` int NOT NULL,
  `policy_id` int,
  `type` varchar(50) NOT NULL,
  `description` text,
  `limit_amount` decimal(15,2) NOT NULL,
  `deductible_amount` decimal(10,2) DEFAULT '0.00',
  `premium_amount` decimal(10,2) NOT NULL,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `coverages_quote_id_foreign_idx` (`quote_id`),
  KEY `coverages_policy_id_foreign_idx` (`policy_id`),
  CONSTRAINT `coverages_quote_id_fkey` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `coverages_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create claims table
CREATE TABLE `claims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `claim_number` varchar(50) NOT NULL,
  `policy_id` int NOT NULL,
  `claimant_id` int NOT NULL,
  `incident_date` date NOT NULL,
  `reported_date` date NOT NULL,
  `description` text NOT NULL,
  `estimated_loss` decimal(15,2),
  `status` enum('reported','investigating','approved','paid','denied','closed') DEFAULT 'reported',
  `assigned_adjuster` int,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `claims_claim_number_unique` (`claim_number`),
  KEY `claims_policy_id_foreign_idx` (`policy_id`),
  KEY `claims_claimant_id_foreign_idx` (`claimant_id`),
  KEY `claims_assigned_adjuster_foreign_idx` (`assigned_adjuster`),
  CONSTRAINT `claims_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`),
  CONSTRAINT `claims_claimant_id_fkey` FOREIGN KEY (`claimant_id`) REFERENCES `parties` (`id`),
  CONSTRAINT `claims_assigned_adjuster_fkey` FOREIGN KEY (`assigned_adjuster`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create reserves table
CREATE TABLE `reserves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `claim_id` int NOT NULL,
  `type` enum('case','expense','indemnity') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text,
  `approved_by` int,
  `approved_date` datetime,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reserves_claim_id_foreign_idx` (`claim_id`),
  KEY `reserves_approved_by_foreign_idx` (`approved_by`),
  CONSTRAINT `reserves_claim_id_fkey` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reserves_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create payments table
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `policy_id` int,
  `claim_id` int,
  `payee_id` int NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` enum('premium','claim','refund') NOT NULL,
  `method` enum('credit_card','bank_transfer','check','cash') NOT NULL,
  `status` enum('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
  `transaction_id` varchar(100),
  `processed_date` datetime,
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_policy_id_foreign_idx` (`policy_id`),
  KEY `payments_claim_id_foreign_idx` (`claim_id`),
  KEY `payments_payee_id_foreign_idx` (`payee_id`),
  CONSTRAINT `payments_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_claim_id_fkey` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_payee_id_fkey` FOREIGN KEY (`payee_id`) REFERENCES `parties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create treaties table
CREATE TABLE `treaties` (
  `id` int NOT NULL AUTO_INCREMENT,
  `treaty_number` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('quota_share','surplus','excess_of_loss') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `capacity` decimal(15,2) NOT NULL,
  `retention` decimal(15,2) NOT NULL,
  `status` enum('active','inactive','expired') DEFAULT 'active',
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `treaties_treaty_number_unique` (`treaty_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create cessions table
CREATE TABLE `cessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `treaty_id` int NOT NULL,
  `policy_id` int,
  `claim_id` int,
  `amount` decimal(15,2) NOT NULL,
  `percentage` decimal(5,2) NOT NULL,
  `status` enum('pending','approved','paid','rejected') DEFAULT 'pending',
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `cessions_treaty_id_foreign_idx` (`treaty_id`),
  KEY `cessions_policy_id_foreign_idx` (`policy_id`),
  KEY `cessions_claim_id_foreign_idx` (`claim_id`),
  CONSTRAINT `cessions_treaty_id_fkey` FOREIGN KEY (`treaty_id`) REFERENCES `treaties` (`id`),
  CONSTRAINT `cessions_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `cessions_claim_id_fkey` FOREIGN KEY (`claim_id`) REFERENCES `claims` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create rating_tables table
CREATE TABLE `rating_tables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `product_type` varchar(50) NOT NULL,
  `factors` json NOT NULL COMMENT 'JSON object with rating factors and values',
  `effective_date` date NOT NULL,
  `expiry_date` date,
  `is_active` tinyint(1) DEFAULT '1',
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create uw_rules table
CREATE TABLE `uw_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `product_type` varchar(50) NOT NULL,
  `conditions` json NOT NULL COMMENT 'JSON object with underwriting conditions',
  `actions` json NOT NULL COMMENT 'JSON object with actions to take',
  `priority` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `metadata` json,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create PolicyRiskItems junction table
CREATE TABLE `PolicyRiskItems` (
  `policy_id` int NOT NULL,
  `risk_item_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`policy_id`, `risk_item_id`),
  KEY `PolicyRiskItems_policy_id_foreign_idx` (`policy_id`),
  KEY `PolicyRiskItems_risk_item_id_foreign_idx` (`risk_item_id`),
  CONSTRAINT `PolicyRiskItems_policy_id_fkey` FOREIGN KEY (`policy_id`) REFERENCES `policies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `PolicyRiskItems_risk_item_id_fkey` FOREIGN KEY (`risk_item_id`) REFERENCES `risk_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create audit_logs table
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `actor_id` int,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` int,
  `details` json,
  `ip_address` varchar(45),
  `user_agent` text,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_actor_id_foreign_idx` (`actor_id`),
  CONSTRAINT `audit_logs_actor_id_fkey` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default roles
INSERT INTO `roles` (`name`, `description`, `permissions`, `is_active`, `created_at`, `updated_at`) VALUES
('ADMIN', 'System administrator', '{"*": ["*"]}', 1, NOW(), NOW()),
('USER', 'Standard user', '{"quotes": ["read", "create"]}', 1, NOW(), NOW()),
('UNDERWRITER', 'Underwriter', '{"quotes": ["read", "approve", "reject"], "policies": ["read", "create", "update"]}', 1, NOW(), NOW()),
('ADJUSTER', 'Claims adjuster', '{"claims": ["read", "create", "update"], "reserves": ["read", "create", "update"]}', 1, NOW(), NOW());

-- Insert default admin user (password: admin123)
INSERT INTO `users` (`username`, `email`, `password`, `first_name`, `last_name`, `role_id`, `is_active`, `created_at`, `updated_at`) VALUES
('admin', 'admin@nuigini.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3ZxQQxq3Hy', 'System', 'Administrator', 1, 1, NOW(), NOW());

-- Insert sample rating table
INSERT INTO `rating_tables` (`name`, `product_type`, `factors`, `effective_date`, `is_active`, `created_at`, `updated_at`) VALUES
('Standard Auto', 'auto', '{"base_rate": 500, "age_factor": {"18-25": 1.5, "26-35": 1.2, "36-50": 1.0, "51+": 1.1}, "driving_record": {"clean": 0.8, "minor": 1.0, "major": 1.5}}', '2024-01-01', 1, NOW(), NOW());

-- Insert sample UW rules
INSERT INTO `uw_rules` (`name`, `product_type`, `conditions`, `actions`, `priority`, `is_active`, `created_at`, `updated_at`) VALUES
('High Risk Driver', 'auto', '{"age": {"operator": "<", "value": 25}, "driving_record": {"operator": "in", "value": ["major", "multiple"]}}', '{"action": "refer", "level": "senior_uw", "message": "High risk driver requires senior underwriter review"}', 1, 1, NOW(), NOW());

COMMIT;
