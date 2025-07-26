# MySQL Docker Setup for RBAC Application

This directory contains Docker configuration for running MySQL in a container.

## Quick Start

1. **Start the MySQL container**:
   ```bash
   docker-compose up -d
   ```

2. **Check if containers are running**:
   ```bash
   docker-compose ps
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed the database**:
   ```bash
   npm run db:seed
   ```

## Services

### MySQL Database
- **Container**: `rbac_mysql`
- **Port**: `3306` (host) → `3306` (container)
- **Database**: `rbac_app`
- **User**: `rbac_user`
- **Password**: `rbac_password123`
- **Root Password**: `rootpassword123`

### phpMyAdmin (Database Management)
- **Container**: `rbac_phpmyadmin`
- **URL**: http://localhost:8080
- **Login**: `rbac_user` / `rbac_password123`

## Useful Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs mysql
docker-compose logs phpmyadmin
```

### Connect to MySQL directly
```bash
docker exec -it rbac_mysql mysql -u rbac_user -p rbac_app
```

### Remove everything (including data)
```bash
docker-compose down -v
```

## Data Persistence

MySQL data is stored in a Docker volume named `mysql_data`. This ensures data persists between container restarts.

## Initial Setup Scripts

The `mysql-init/` directory contains SQL scripts that run when the container is first created:
- `01-init.sql`: Initial database setup and user privileges

## Environment Variables

The application's `.env` file is configured to connect to this Docker MySQL instance:
```
DATABASE_URL="mysql://rbac_user:rbac_password123@localhost:3306/rbac_app"
```
