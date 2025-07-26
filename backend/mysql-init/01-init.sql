-- Initial database setup
CREATE DATABASE IF NOT EXISTS rbac_app;

-- Grant privileges to the rbac_user
GRANT ALL PRIVILEGES ON rbac_app.* TO 'rbac_user'@'%';
FLUSH PRIVILEGES;

-- Set timezone
SET GLOBAL time_zone = '+00:00';
