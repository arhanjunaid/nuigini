-- Create database if not exists
CREATE DATABASE IF NOT EXISTS nuigini_insurance;
USE nuigini_insurance;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'nuigini_user'@'%' IDENTIFIED BY 'nuigini_password';
GRANT ALL PRIVILEGES ON nuigini_insurance.* TO 'nuigini_user'@'%';
FLUSH PRIVILEGES; 