# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an Angular frontend application with authentication and role-based access control (RBAC) functionality. The application is designed to work with a Next.js backend API.

## Key Features
- User authentication (login/logout)
- Role-based access control (RBAC)
- Protected routes with route guards
- User management dashboard
- Responsive design with modern UI components
- Internationalization (I18N) support for French and English

## Development Guidelines
- Use Angular standalone components
- Follow Angular style guide and best practices
- Use TypeScript with strict mode
- Implement reactive forms for user input
- Use Angular Material for UI components
- Follow SOLID principles and clean code practices
- Implement proper error handling and loading states
- Use observables for asynchronous operations
- Follow security best practices for authentication
- Implement Angular I18N for French and English support
- Use Angular translation pipes and services
- Structure translation files properly (locale-specific)

## Project Structure
- `/src/app/core` - Core services, guards, interceptors
- `/src/app/shared` - Shared components, pipes, directives
- `/src/app/features` - Feature modules (auth, dashboard, admin)
- `/src/app/models` - TypeScript interfaces and models
- `/src/environments` - Environment configuration
- `/src/locale` - Translation files for French and English

## Authentication Flow
- JWT token-based authentication
- Token storage in httpOnly cookies or localStorage
- Automatic token refresh
- Role-based route protection
- Logout on token expiration

## RBAC Implementation
- Role-based navigation menu
- Component-level permission checks
- Route guards for different user roles
- Dynamic content based on user permissions
