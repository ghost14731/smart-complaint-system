#!/bin/bash

# Database Setup Script for Smart Complaint Management System
# This script helps set up MySQL database and user for the application

echo "Smart Complaint Management System - Database Setup"
echo "=================================================="

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL first."
    echo "   Ubuntu/Debian: sudo apt install mysql-server"
    echo "   CentOS/RHEL: sudo yum install mysql-server"
    exit 1
fi

# Get database credentials
read -p "Enter MySQL root password: " -s ROOT_PASSWORD
echo
read -p "Enter database name [scms_db]: " DB_NAME
DB_NAME=${DB_NAME:-scms_db}
read -p "Enter database username [scms_user]: " DB_USER
DB_USER=${DB_USER:-scms_user}
read -p "Enter database password: " -s DB_PASSWORD
echo

# Create database and user
echo "🔧 Setting up database..."

mysql -u root -p"$ROOT_PASSWORD" -e "
CREATE DATABASE IF NOT EXISTS $DB_NAME;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully!"
else
    echo "❌ Failed to create database/user. Please check your MySQL root password."
    exit 1
fi

# Run the database setup script
echo "📝 Running database schema and sample data setup..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database-setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
else
    echo "❌ Failed to run database setup script."
    exit 1
fi

# Update application.properties
echo "⚙️  Updating application.properties..."
sed -i "s|spring.datasource.url=.*|spring.datasource.url=jdbc:mysql://localhost:3306/$DB_NAME|" application.properties
sed -i "s|spring.datasource.username=.*|spring.datasource.username=$DB_USER|" application.properties
sed -i "s|spring.datasource.password=.*|spring.datasource.password=$DB_PASSWORD|" application.properties

echo ""
echo "🎉 Database setup completed!"
echo ""
echo "Database Configuration:"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: [HIDDEN]"
echo ""
echo "Sample Accounts:"
echo "  Admin: admin@scms.com / password"
echo "  Staff: john.staff@scms.com / password"
echo "  User:  alice@example.com / password"
echo ""
echo "Next steps:"
echo "1. Run: mvn spring-boot:run"
echo "2. Open: http://localhost:8080"
echo "3. Login with one of the sample accounts above"