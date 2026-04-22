-- Database Setup Script for Smart Complaint Management System
-- Run this script to create the database and initial data

-- Create database
CREATE DATABASE IF NOT EXISTS scms_db;
USE scms_db;

-- Create users table
CREATE TABLE IF NOT EXISTS user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN', 'STAFF') NOT NULL
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS complaint (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    user_id BIGINT,
    assigned_staff_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (assigned_staff_id) REFERENCES user(id)
);

-- Insert sample data for testing

-- Create admin user
INSERT INTO user (name, email, password, role) VALUES
('Admin User', 'admin@scms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN')
ON DUPLICATE KEY UPDATE email=email;

-- Create staff users
INSERT INTO user (name, email, password, role) VALUES
('John Staff', 'john.staff@scms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF'),
('Jane Staff', 'jane.staff@scms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF'),
('Bob Staff', 'bob.staff@scms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STAFF')
ON DUPLICATE KEY UPDATE email=email;

-- Create regular users
INSERT INTO user (name, email, password, role) VALUES
('Alice Johnson', 'alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('Bob Smith', 'bob@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('Charlie Brown', 'charlie@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample complaints
INSERT INTO complaint (title, description, category, status, user_id, assigned_staff_id, created_at) VALUES
('Broken Elevator', 'The elevator in building A is not working for the past 2 days', 'Maintenance', 'ASSIGNED', 4, 2, NOW() - INTERVAL 2 DAY),
('Food Quality Issue', 'The cafeteria food has been consistently poor quality this week', 'Food', 'IN_PROGRESS', 5, 3, NOW() - INTERVAL 1 DAY),
('Safety Hazard', 'There is a broken glass door in the main entrance that poses a safety risk', 'Safety', 'PENDING', 6, NULL, NOW() - INTERVAL 6 HOUR),
('WiFi Connectivity', 'Internet connection is very slow in the conference room', 'Maintenance', 'RESOLVED', 4, 2, NOW() - INTERVAL 3 DAY),
('Parking Issue', 'Unauthorized vehicles are parking in reserved spots', 'Safety', 'PENDING', 5, NULL, NOW() - INTERVAL 12 HOUR),
('Air Conditioning', 'The AC in room 201 is not working properly', 'Maintenance', 'ASSIGNED', 6, 3, NOW() - INTERVAL 4 HOUR)
ON DUPLICATE KEY UPDATE title=title;

-- Show created data
SELECT 'Users created:' as info, COUNT(*) as count FROM user
UNION ALL
SELECT 'Complaints created:', COUNT(*) FROM complaint;