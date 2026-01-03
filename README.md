# FFSC Anniversary Management System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)

A comprehensive event management system built for Filipino Fellowship of Santa Cruz (FFSC) to manage their anniversary celebration. This Progressive Web Application (PWA) handles attendee registration, shirt distribution, task management, and real-time data synchronization.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Database Schema](#-database-schema)
- [User Roles & Permissions](#-user-roles--permissions)
- [Key Components](#-key-components)
- [API Services](#-api-services)
- [Real-time Features](#-real-time-features)
- [PWA Features](#-pwa-features)
- [Security](#-security)
- [Development](#-development)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Features

### Core Functionality

- **Event Registration Management**: Check-in attendees with real-time updates
- **Shirt Distribution System**: Track shirt sizes, payments, and distribution status
- **Task Management**: Assign and track tasks with priorities, due dates, and categories
- **User Management**: Role-based access control with admin oversight
- **Dashboard Analytics**: Visual charts and statistics for event insights
- **Mobile-First Design**: Fully responsive with dedicated mobile views

### Advanced Features

- **Real-time Synchronization**: Instant updates across all connected devices via Supabase Realtime
- **Attendance Tracking**: Differentiate between event attendees and shirt-only registrations
- **Recurring Tasks**: Support for daily, weekly, and monthly recurring tasks
- **Bulk Operations**: Batch registration and check-in capabilities
- **Profile Management**: User avatars, profile settings, and role change requests
- **Notifications System**: Task assignments and important updates
- **Export & Print**: Generate printable registration lists

---

## 🏗 Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │    Mobile    │  │     PWA      │      │
│  │   Browser    │  │   Browser    │  │   Installed  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Service Layer (API Services)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication │ Data CRUD │ Real-time │ Storage    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend Layer (Supabase)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │   Realtime   │  │   Storage    │      │
│  │   Database   │  │   Channels   │  │   Bucket     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action** → Component
2. **Component** → API Service Layer
3. **API Service** → Supabase Client
4. **Supabase** → PostgreSQL Database
5. **Database Trigger** → Realtime Broadcast
6. **Realtime** → All Connected Clients
7. **Clients** → Update Local State

---

## 🛠 Tech Stack

### Frontend

- **React 18.x**: UI library with Hooks and Context API
- **React Router v6**: Client-side routing
- **Lucide React**: Modern icon library
- **Recharts**: Data visualization and charts
- **Tailwind CSS**: Utility-first CSS framework

### Backend & Infrastructure

- **Supabase**: Backend-as-a-Service platform
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions via WebSockets
  - Authentication & user management
  - File storage for avatars
- **Service Worker**: PWA offline capabilities

### Development Tools

- **Create React App**: Build tooling
- **ESLint**: Code quality
- **Git**: Version control

---

## 🚀 Getting Started

### Prerequisites

```bash
node >= 16.x
npm >= 8.x
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/iianarmas/ffsc-anniversary-management.git
cd ffsc-anniversary-management
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure Supabase**

Create a Supabase project at [supabase.com](https://supabase.com) and update the credentials in `src/services/supabase.js`:

```javascript
const SUPABASE_URL = "your-project-url";
const SUPABASE_ANON_KEY = "your-anon-key";
```

4. **Set up database schema**

Run the SQL schema from the [Database Schema](#-database-schema) section in your Supabase SQL Editor.

5. **Start development server**

```bash
npm start
```

The application will be available at `http://localhost:3000`

---

## 🗄 Database Schema

### Core Tables

#### `profiles`

User accounts and authentication data

```sql
- id: uuid (primary key, references auth.users)
- email: text (unique)
- full_name: text
- role: enum ('admin', 'committee', 'viewer')
- status: enum ('active', 'suspended', 'deleted')
- avatar_url: text
- created_at: timestamptz
- updated_at: timestamptz
```

#### `people`

Event attendees and participants

```sql
- id: uuid (primary key)
- first_name: text
- last_name: text
- age: integer
- gender: text
- location: text
- contact_number: text
- attendance_status: enum ('attending', 'shirt_only')
- created_by: uuid (references profiles)
- created_at: timestamptz
```

#### `registrations`

Check-in tracking

```sql
- id: uuid (primary key)
- person_id: uuid (references people)
- registered: boolean
- registered_at: timestamptz
- registered_by: uuid (references profiles)
```

#### `shirts`

Shirt distribution management

```sql
- id: uuid (primary key)
- person_id: uuid (references people)
- shirt_size: text
- paid: boolean
- shirt_given: boolean
- has_print: boolean (default true)
```

#### `notes`

Tasks and notes system

```sql
- id: uuid (primary key)
- person_id: uuid (references people)
- note_text: text
- is_task: boolean
- status: enum ('incomplete', 'complete')
- priority: enum ('High', 'Medium', 'Low')
- category: text
- due_date: timestamptz
- assigned_to: text (legacy)
- assigned_to_user: uuid (references profiles)
- created_by: text
- created_by_user: uuid (references profiles)
- recurrence: enum ('none', 'daily', 'weekly', 'monthly')
- recurrence_end_date: timestamptz
- completed_at: timestamptz
- created_at: timestamptz
- updated_at: timestamptz
```

#### `registration_codes`

Access control codes

```sql
- id: uuid (primary key)
- code: text (unique)
- description: text
- is_active: boolean
- created_by: uuid (references profiles)
- created_at: timestamptz
```

#### `role_change_requests`

User role elevation requests

```sql
- id: uuid (primary key)
- user_id: uuid (references profiles)
- requested_role: text
- status: enum ('pending', 'approved', 'rejected')
- rejection_count: integer
- requested_at: timestamptz
- reviewed_at: timestamptz
- reviewed_by: uuid (references profiles)
- last_rejected_at: timestamptz
```

---

## 👥 User Roles & Permissions

### Role Hierarchy

```
┌──────────────────┐
│      Admin       │ ← Full system access
├──────────────────┤
│    Committee     │ ← Registration & task management
├──────────────────┤
│     Viewer       │ ← Read-only access
└──────────────────┘
```

### Permission Matrix

| Feature                  | Admin | Committee | Viewer |
| ------------------------ | ----- | --------- | ------ |
| View Dashboard           | ✅    | ✅        | ✅     |
| View All People          | ✅    | ✅        | ✅     |
| Register/Check-in People | ✅    | ✅        | ❌     |
| Manage Shirts            | ✅    | ✅        | ❌     |
| View Tasks               | ✅    | ✅        | ❌     |
| Create Tasks             | ✅    | ✅        | ❌     |
| Edit Any Task            | ✅    | Own Only  | ❌     |
| Delete Tasks             | ✅    | ❌        | ❌     |
| Manage Users             | ✅    | ❌        | ❌     |
| Manage Access Codes      | ✅    | ❌        | ❌     |
| Export Reports           | ✅    | ❌        | ❌     |

### Role Change Process

1. **Viewer** → Can request **Committee** role
2. **Committee** → Cannot request **Admin** (admin grants only)
3. **Cooldown**: 3 days after rejection
4. **Notification**: Real-time approval/rejection notifications

---

## 🧩 Key Components

### Layout Components

#### `Sidebar.js`

Desktop navigation with role-based menu items

- Home, Registration, Shirts, Tasks, Dashboard views
- User Management (admin only)
- Task badge counter
- Profile menu with avatar

#### `MobileBottomNav.js`

Mobile navigation bar

- Fixed bottom position
- Active view indicator
- Task and notification badges
- Role-based visibility

#### `Header.js`

Top navigation bar (mobile)

- Search functionality
- Notification bell with task alerts
- Role request notifications (admin)
- Profile menu

### Core Views

#### `HomePage.js`

Dashboard landing page

- Hero section with quick stats
- My Tasks widget (upcoming & overdue)
- Recent Activity timeline
- Quick Actions shortcuts
- Calendar widget
- Notifications panel

#### `RegistrationView.js` / `MobileRegistrationView.js`

Attendee check-in management

- Search and filter (age, location, status, attendance)
- Bulk registration/removal
- Real-time registration count
- Notes/tasks indicators per person
- Print functionality
- Capacity tracking (230 max, excludes toddlers)

#### `ShirtManagementView.js` / `MobileShirtManagementView.js`

Shirt distribution tracking

- Size selection (XS to 3XL)
- Payment status toggle
- Distribution status toggle
- Print preference toggle
- Multi-filter search
- Statistics cards

#### `TasksView.js` / `MobileTasksView.js`

Task management dashboard

- Priority-based color coding
- Status filters (incomplete, complete, overdue)
- Category and assignee filters
- Due date filters
- Task completion toggle
- Recurring task support

#### `Dashboard.js`

Analytics and visualizations

- Age Bracket Chart (pie chart)
- Gender Distribution (bar chart)
- Shirt Size Distribution (bar chart)
- Location Breakdown (bar chart)
- Hourly Registration Trend (line chart)
- Registration Summary statistics

### Dialog Components

#### `NotesDialog.js`

Person-specific notes and tasks

- View all notes and tasks for a person
- Create new notes or tasks
- Edit existing entries
- Task-specific fields (priority, due date, category)
- Recurring task configuration
- Delete functionality

#### `WelcomeModal.js`

First-time user onboarding

- Personalized greeting
- Role explanation
- Quick start guide
- Shows once per session

#### `RoleRequestDialog.js`

Role change notifications

- Request approval/rejection alerts
- Admin-initiated role changes
- Auto-dismisses after viewing

### Utility Components

#### `Avatar.js`

User profile picture display

- Initials fallback for no avatar
- Size variants (xs, sm, md, lg, xl)
- Upload and delete functionality
- Supports image URLs

#### `LoadingOverlay.js`

Full-screen loading state

- Animated spinner
- Semi-transparent backdrop
- Blocks interaction during data operations

#### `ConfirmDialog.js` / `SuccessDialog.js` / `ErrorDialog.js`

User feedback dialogs

- Confirmation prompts for destructive actions
- Success messages
- Error handling

---

## 🔌 API Services

### `api.js` - Core API Functions

#### People Management

```javascript
fetchAllPeople(); // Get all people with relations
createPerson(personData, userId); // Create new person
deletePerson(personId); // Delete person and relations
updateAttendanceStatus(id, status); // Update attendance type
```

#### Registration

```javascript
checkInPerson(personId, userId); // Register attendee
removeCheckIn(personId, userId); // Unregister attendee
```

#### Shirt Management

```javascript
updateShirtSize(personId, size); // Update shirt size
toggleShirtPayment(personId, paid); // Toggle payment status
toggleShirtGiven(personId, given); // Toggle distribution status
toggleShirtPrint(personId, print); // Toggle print preference
```

#### Notes & Tasks

```javascript
fetchNotesForPerson(personId)       // Get all notes for person
createNote(personId, text, ...)     // Create note or task
updateNote(noteId, text, ...)       // Update note or task
deleteNote(noteId)                  // Delete note or task
toggleTaskComplete(taskId, status)  // Toggle task completion
fetchAllTasks(filters)              // Get filtered tasks
getTaskStats()                      // Get task statistics
```

#### User Management (Admin)

```javascript
getAllUsers(); // Get all user profiles
updateUserRole(userId, role); // Change user role
updateUserStatus(userId, status); // Activate/suspend user
deleteUser(userId); // Mark user as deleted
```

#### Registration Codes (Admin)

```javascript
getRegistrationCodes()              // Get all codes
createRegistrationCode(...)         // Create new code
toggleRegistrationCodeStatus(...)   // Activate/deactivate code
deleteRegistrationCode(codeId)      // Remove code
```

#### Role Change Requests

```javascript
canRequestRoleChange(userId); // Check eligibility
requestRoleChange(userId); // Submit request
getPendingRoleRequests(); // Get pending (admin)
approveRoleRequest(reqId, adminId); // Approve request (admin)
rejectRoleRequest(reqId, adminId); // Reject request (admin)
```

### `supabase.js` - Authentication & Storage

#### Authentication

```javascript
signIn(email, password); // User login
signUp(email, password, fullName); // User registration
signOut(); // User logout
getCurrentUser(); // Get current auth user
getUserProfile(userId); // Get user profile
verifyRegistrationCode(code); // Validate access code
```

#### Avatar Storage

```javascript
uploadAvatar(userId, file); // Upload profile picture
deleteAvatar(userId); // Remove profile picture
```

---

## 📡 Real-time Features

### Supabase Realtime Channels

The application uses Supabase's real-time subscriptions to keep all clients synchronized:

```javascript
// People table updates
supabase.channel("table-listen-people").on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "people",
  },
  callback
);

// Registration updates
supabase.channel("table-listen-registrations").on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "registrations",
  },
  callback
);

// Shirt updates
supabase.channel("table-listen-shirts").on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "shirts",
  },
  callback
);

// Task updates
supabase.channel("table-listen-tasks").on(
  "postgres_changes",
  {
    event: "*",
    schema: "public",
    table: "notes",
  },
  callback
);
```

### Real-time Use Cases

1. **Multi-device Registration**: Multiple committee members can check-in attendees simultaneously without conflicts
2. **Live Task Updates**: Task assignments appear instantly across all connected devices
3. **Dashboard Synchronization**: Charts and statistics update in real-time as data changes
4. **Role Change Notifications**: Users receive immediate feedback on role requests
5. **Shirt Distribution**: Inventory status updates instantly for all team members

---

## 📱 PWA Features

### Progressive Web App Capabilities

#### Installation

- **Add to Home Screen**: Install on mobile devices like a native app
- **Custom Splash Screen**: Branded loading screen
- **Standalone Mode**: Runs without browser chrome

#### Offline Support

- **Service Worker**: Caches static assets for offline access
- **Graceful Degradation**: Works without network connection
- **Background Sync**: Queues operations when offline (planned feature)

#### Performance

- **Code Splitting**: Lazy-loaded routes for faster initial load
- **Asset Optimization**: Compressed and cached resources
- **Responsive Images**: Optimized for different screen sizes

#### Mobile Experience

- **Touch-Optimized**: Large tap targets, swipe gestures
- **Mobile-First Design**: Dedicated mobile components
- **Bottom Navigation**: Easy thumb-reach navigation
- **No Scrollbar**: Clean mobile interface

### Manifest Configuration

```json
{
  "name": "FFSC Anniversary Management",
  "short_name": "FFSC Event",
  "theme_color": "#001740",
  "background_color": "#ffffff",
  "display": "standalone",
  "start_url": "/"
}
```

---

## 🔒 Security

### Authentication & Authorization

#### Row Level Security (RLS)

All database tables implement Supabase RLS policies:

- Users can only access data permitted by their role
- Database-level security (cannot bypass with direct API calls)
- Automatic user identification via JWT tokens

#### Access Control

```javascript
// Example RLS policy for people table
CREATE POLICY "Viewers can view all people"
ON people FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only committee/admin can modify people"
ON people FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' IN ('admin', 'committee')
);
```

#### Registration Codes

- Required for new user signups
- Admin-controlled activation/deactivation
- Prevents unauthorized registrations

### Data Protection

#### Sensitive Information

- Passwords: Hashed by Supabase Auth (bcrypt)
- Emails: Unique constraint, used only for authentication
- Personal Data: GDPR-compliant data handling

#### API Security

- HTTPS-only in production
- Supabase Anon Key: Safe for client-side use (RLS enforces permissions)
- Service Role Key: Never exposed to client

---

## 💻 Development

### Project Structure

```
ffsc-anniversary-management/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker
│   └── icons/                 # App icons
├── src/
│   ├── assets/
│   │   └── fonts/             # Custom fonts
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   ├── admin/             # Admin-only components
│   │   ├── home/              # Home page widgets
│   │   ├── charts/            # Data visualization
│   │   └── *.js               # Shared components
│   ├── services/
│   │   ├── api.js             # API service layer
│   │   └── supabase.js        # Supabase client
│   ├── utils/
│   │   └── permissions.js     # Role-based access control
│   ├── App.js                 # Root component
│   └── index.js               # Entry point
└── package.json
```

### Component Patterns

#### Hooks Used

- `useState`: Local component state
- `useEffect`: Side effects, subscriptions
- `useMemo`: Performance optimization
- `useContext`: Global state (Auth)
- `useAuth`: Custom hook for user profile

#### State Management

- **Local State**: Component-specific data
- **Context API**: Authentication, user profile
- **Real-time**: Supabase subscriptions
- **No Redux**: Simplified architecture

### Code Style

#### Naming Conventions

- Components: PascalCase (`RegistrationView.js`)
- Functions: camelCase (`fetchAllPeople`)
- Constants: UPPER_SNAKE_CASE (`PERMISSIONS`)
- Files: Matches component name

#### Best Practices

- Functional components with Hooks
- PropTypes or TypeScript for type safety
- Error boundaries for graceful failures
- Loading states for async operations
- Optimistic UI updates

### Environment Variables

```bash
# .env.local (not committed to git)
REACT_APP_SUPABASE_URL=your_url
REACT_APP_SUPABASE_ANON_KEY=your_key
```

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deployment Platforms

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### GitHub Pages

```bash
# Add to package.json
"homepage": "https://yourusername.github.io/repo-name"

# Install gh-pages
npm install --save-dev gh-pages

# Add scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

### Environment Configuration

Ensure environment variables are set in your deployment platform:

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

### Post-Deployment Checklist

- [ ] Test all authentication flows
- [ ] Verify real-time subscriptions work
- [ ] Check PWA installation on mobile
- [ ] Test role-based permissions
- [ ] Validate SSL certificate
- [ ] Configure custom domain (optional)

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Commit with clear messages**
   ```bash
   git commit -m "Add: Feature description"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**

### Commit Message Convention

```
Type: Short description

Detailed explanation (optional)

Types:
- Add: New feature
- Fix: Bug fix
- Update: Changes to existing feature
- Remove: Removed feature
- Docs: Documentation changes
- Style: Code style changes (no functional changes)
- Refactor: Code restructuring
```

### Code Review Process

1. Automated tests must pass
2. Code review by maintainer
3. Changes requested or approved
4. Merge to main branch

---

## 📄 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026 FFSC Anniversary Management

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

### Getting Help

- **Documentation**: This README
- **Issues**: [GitHub Issues](https://github.com/iianarmas/ffsc-anniversary-management/issues)
- **Email**: armas.cav@gmail.com

### Reporting Bugs

When reporting bugs, please include:

1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser/device information
5. Screenshots (if applicable)

---

## 🙏 Acknowledgments

- **Supabase Team**: For the excellent BaaS platform
- **React Team**: For the robust UI library
- **FFSC Community**: For the opportunity to build this system
- **Contributors**: Everyone who has contributed to this project

---

## 📊 Project Statistics

- **Lines of Code**: ~15,000+
- **Components**: 40+
- **API Endpoints**: 60+
- **Database Tables**: 7
- **Real-time Channels**: 6
- **User Roles**: 3
- **Supported Devices**: Desktop, Mobile, Tablet

---

- iian armas

Last Updated: January 2026
