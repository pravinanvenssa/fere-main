This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) with Role-Based Access Control (RBAC) and MySQL database integration using Prisma.

## Getting Started

### Prerequisites

1. **Docker & Docker Compose**: Make sure you have Docker and Docker Compose installed
2. **Node.js**: Version 16 or higher

### Quick Setup with Docker

The easiest way to get started is using Docker for the MySQL database:

```bash
# Install dependencies
npm install

# Start MySQL container and set up database
npm run setup

# Start the development server
npm run dev
```

### Manual Database Setup

If you prefer to use an existing MySQL installation:

1. **Create a MySQL database**:
   ```sql
   CREATE DATABASE rbac_app;
   ```

2. **Configure environment variables**:
   Update the `.env` file with your MySQL connection details:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/rbac_app"
   ```

3. **Run database migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Seed the database with default data**:
   ```bash
   npm run db:seed
   ```

### Default Login Credentials

After seeding the database, you can use these default credentials:

**Admin User:**
- Email: `admin@example.com`
- Password: `admin123`

**Regular User:**
- Email: `user@example.com`
- Password: `user123`

### Development Server

First, install dependencies and set up the database:

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Database Management Scripts

- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:seed` - Seed database with default data
- `npm run db:reset` - Reset database and re-seed

### API Endpoints

The application provides the following API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token

### Project Structure

```
backend/
├── pages/api/auth/     # Authentication API routes
├── prisma/             # Database schema and migrations
├── utils/              # Utility functions (database connection)
└── .env               # Environment variables
```

## Features

- **Role-Based Access Control (RBAC)**: Users can have multiple roles with specific permissions
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **MySQL Database**: Reliable relational database with Prisma ORM
- **Google OAuth**: Social login integration
- **User Management**: Create, read, update, and delete users
- **Permission System**: Granular permissions for different resources and actions

## Database Schema

The application uses the following main models:

- **User**: User accounts with authentication details
- **Role**: User roles (admin, user, etc.)
- **Permission**: Specific permissions (users:read, users:create, etc.)
- **UserRole**: Many-to-many relationship between users and roles
- **RolePermission**: Many-to-many relationship between roles and permissions

## Docker Services

### MySQL Database Container
- **Access**: localhost:3306
- **Database**: rbac_app
- **User**: rbac_user
- **Password**: rbac_password123

### phpMyAdmin (Database Management)
- **URL**: http://localhost:8080
- **Login**: rbac_user / rbac_password123

### Docker Commands

```bash
# Start MySQL container
npm run docker:up

# Stop MySQL container
npm run docker:down

# View container logs
npm run docker:logs

# Complete setup (start container + migrate + seed)
npm run setup
```
