# P.A.R.K. Admin Application

A comprehensive exam management and administration system for P.A.R.K. language examinations. This application streamlines the process of scheduling exams, managing availability of examiners and invigilators, and handling exam-related resources.

## Tech Stack

- **Frontend**: Vue.js 3 with Composition API
- **UI Framework**: Quasar Framework
- **State Management**: Pinia
- **TypeScript**: For type safety
- **Routing**: Vue Router
- **HTTP Client**: Axios for API communication
- **Authentication**: JWT-based authentication with refresh tokens

## Development Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd park-admin
   ```

2. Install dependencies
   ```bash
   npm install
   # or with yarn
   yarn
   ```

3. Configure the backend URL
   Edit `src/config.ts` to point to your backend URL:
   ```typescript
   export default {
     backendUrl: 'http://localhost:4000', // For local development
     // backendUrl: '/api', // For production
   }
   ```

4. Start the development server
   ```bash
   npm run dev
   # or with yarn
   yarn dev
   ```

## Project Structure

```
src/
├── assets/           # Static assets
├── boot/             # Quasar boot files (including Axios setup)
├── components/       # Vue components
│   ├── Admin/        # Admin components
│   ├── Auth_nav/     # Authentication components
│   ├── Availability/ # Availability management
│   ├── Exams/        # Exam-related components
│   ├── FileRead/     # File upload/reading components
│   └── Users/        # User management components
├── composables/      # Reusable composable functions
├── css/              # Global CSS/SCSS styles
├── db/               # Type definitions
├── helpers/          # Helper utilities
├── layouts/          # Layout components
├── pages/            # Page components
│   └── admin/        # Admin pages
├── router/           # Vue Router configuration
├── stores/           # Pinia store modules
└── utils/            # Utility services
    └── services/     # Reusable services
├── App.vue           # Root component
├── config.ts         # Application configuration
```

## Key Features

- **User Management**: Multi-role support with secure authentication (Office, Supervisor, Invigilator, Examiner, Developer)
- **Exam Management**: Create, schedule, assign staff, track preparation and completion status
- **Availability System**: Users indicate availability (Yes, AM, PM, No) for specific dates by center
- **Substitution System**: Staff can request and apply for substitutions with approval workflow
- **Venue Management**: Database of exam locations and venues with Google Maps integration
- **Notification System**: In-app notifications for important events, availability responses, and substitution requests, email notifications
- **Admin Panel**: User administration, exam configuration, and system settings

## Core Components

### Stores

- `authStore.ts`: Authentication logic, token management, and 2FA verification
- `userStore.ts`: User profile, avatar, and exam assignments
- `examStore.ts`: Exam CRUD operations, file management, and staff assignments
- `examDayStore.ts`: Management of exam days and availability periods
- `availabilityStore.ts`: User availability responses and notifications
- `substitutionStore.ts`: Substitution requests and applications
- `adminStore.ts`: Administrative functions including user/role management
- `postStore.ts`: Announcements and center-wide notifications

### Important Services & Helpers

- `apiService.ts`: Centralized API request handling with error management
- `loadingService.ts`: Global loading indicators
- `notificationService.ts`: Standardized notifications
- `FormatRole.ts`, `FormatTime.ts`: Consistent data formatting
- `Color.ts`: UI color mapping for roles and exam statuses

## Authentication Flow

- Login requires email and password (`LoginForm.vue`)
- Successful login sends a verification code to the user's email
- 2FA verification via the verification code (`VerifyForm.vue`)
- JWT token stored in localStorage and refreshed automatically

## Role-Based Access

- Route guards are configured in `router/routes.ts`
- User roles determine available navigation items and permissions
- Office and Developer roles have access to admin functions
- Exam access is restricted to assigned staff or admin users

## Working with Exams

Exams have several important states:
- **Created**: Initial state, fully editable
- **Prepared**: Staff assignments are locked, notifications sent to staff
- **Completed**: Exam has taken place, only reporting is possible

Staff confirmations are tracked to ensure attendance.

## Development Guidelines

### Adding New Features

1. Define new types in `db/types.ts` if necessary
2. Implement store actions for API interactions
3. Create UI components following existing patterns
4. Add routes if needed
5. Update relevant documentation

### API Integration

- All API requests should go through the store modules
- Use appropriate loading states and error handling
- Follow the established patterns in existing stores

### Styling Guidelines

- Use Quasar components for UI elements
- Custom styling should use SCSS variables from `css/quasar.variables.scss`
- Global styles should be placed in `css/app.scss`
- Component-specific styles should use scoped SCSS

## Build and Deployment

### Building for Production

```bash
- Clone the repository - back-end and front-end
- Install the dependencies

Quasar build

sudo cp -r dist/spa/* /var/www/html/

sudo chown -R www-data:www-data /var/www/html/

sudo chmod -R 755 /var/www/html/

sudo systemctl restart nginx

194.182.77.166
```

For production deployment:
1. Change the `backendUrl` in `config.ts` to point to the production API
2. Configure the server to handle Vue Router's history mode
3. Ensure proper caching headers for static assets

## Known Issues and Roadmap

- File upload improvements needed for larger files
- Calendar view performance can lag with many events
- Future plans include:
  - Better mobile responsiveness
  - Offline support
  - Improved reporting features
  - Integration with additional calendar systems

## Version History

The application includes a version history component that documents changes across versions. Current version: 0.1.5.

## Contact

For questions or support, contact the development team.

---

© 2025 P.A.R.K. Exams Centre
