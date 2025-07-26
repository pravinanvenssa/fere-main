# Angular Frontend with Authentication & RBAC

This is a modern Angular frontend application with authentication and role-based access control (RBAC) functionality, designed to work with a Next.js backend API. The application supports internationalization (I18N) for French and English languages.

## Features

- ✅ **User Authentication** - JWT token-based login/logout system
- ✅ **Role-Based Access Control (RBAC)** - Protected routes and component-level permissions
- ✅ **Internationalization (I18N)** - Support for French and English languages
- ✅ **Modern UI** - Angular Material components with responsive design
- ✅ **Route Guards** - Authentication and permission-based route protection
- ✅ **Standalone Components** - Modern Angular architecture
- ✅ **TypeScript** - Fully typed with strict mode enabled
- ✅ **HTTP Interceptors** - Automatic token attachment and refresh

## Tech Stack

- **Angular 18+** - Frontend framework with standalone components
- **Angular Material** - UI component library
- **RxJS** - Reactive programming for state management
- **TypeScript** - Type-safe development
- **SCSS** - Enhanced styling with variables and mixins
- **JWT** - JSON Web Token for authentication

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend API

Update the API URL in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api', // Your Next.js backend URL
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'fr']
};
```

### 3. Start Development Server

```bash
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200/`

### 4. Build for Production

```bash
npm run build
# or
ng build --configuration production
```
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
