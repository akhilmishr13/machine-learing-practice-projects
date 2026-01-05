# Journal App - Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Features Implemented](#features-implemented)
6. [Implementation Details](#implementation-details)
7. [Setup & Deployment](#setup--deployment)
8. [API Documentation](#api-documentation)

---

## Project Overview

**Journal App** is a full-stack digital journaling application that enables users to:
- Track daily habits with streak visualization
- Write and manage journal entries
- Create creative journal entries with canvas-based drawing
- View calendar events and journal entries
- Manage habits and user profile

The project consists of three main components:
1. **Backend API** (FastAPI) - RESTful API server
2. **Web Application** (React + TypeScript) - Modern web interface
3. **Mobile Application** (React Native) - Native mobile apps (iOS/Android)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────┬───────────────────┬───────────────────┤
│  Web App (React)    │  iOS App (RN)     │  Android App (RN) │
│  http://localhost:3000 │                   │                   │
└──────────┬──────────┴──────────┬────────┴──────────┬────────┘
           │                     │                    │
           └─────────────────────┼────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Backend API (FastAPI)  │
                    │   http://localhost:8000  │
                    │   /api/v1               │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   SQLite Database       │
                    │   journalapp.db         │
                    └─────────────────────────┘
```

### Architecture Patterns

#### Backend Architecture
- **RESTful API Design**: Stateless API following REST principles
- **Layered Architecture**:
  - **API Layer**: FastAPI routers handling HTTP requests
  - **Service Layer**: Business logic (embedded in endpoints)
  - **Data Layer**: SQLAlchemy ORM models and database operations
- **Dependency Injection**: FastAPI's dependency system for authentication and database sessions
- **Authentication**: JWT-based authentication with bearer tokens

#### Frontend Architecture
- **Component-Based Architecture**: React functional components
- **State Management**: Zustand stores for global state
- **Service Layer**: API service abstraction for backend communication
- **Routing**: React Router for client-side routing
- **Type Safety**: TypeScript for type checking

### Data Flow

1. **User Authentication Flow**:
   ```
   User → Login/Register → Backend (JWT Token) → Store Token → Authenticated Requests
   ```

2. **Data Fetching Flow**:
   ```
   Component → Store → API Service → Backend API → Database → Response → Store → Component
   ```

3. **Data Persistence Flow**:
   ```
   User Action → Component → Store → API Service → Backend API → Database → Response → Store Update → UI Update
   ```

---

## Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.13 | Programming language |
| **FastAPI** | 0.109.0+ | Web framework |
| **Uvicorn** | 0.27.0+ | ASGI server |
| **SQLAlchemy** | 2.0.25+ | ORM for database operations |
| **Alembic** | 1.13.1+ | Database migrations |
| **Pydantic** | (Built-in) | Data validation |
| **python-jose** | 3.3.0+ | JWT token handling |
| **bcrypt** | (via passlib) | Password hashing |
| **SQLite** | (Built-in) | Database |
| **pytest** | 7.4.4+ | Testing framework |

### Frontend (Web App)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **Vite** | 5.0.8 | Build tool and dev server |
| **Tailwind CSS** | 3.4.1 | Utility-first CSS framework |
| **Zustand** | 4.5.7 | State management |
| **React Router** | 6.20.0 | Client-side routing |
| **Fabric.js** | 5.3.0 | Canvas manipulation for drawing |
| **date-fns** | 3.0.0 | Date utility functions |
| **Axios** | 1.6.2 | HTTP client (available but using fetch) |

### Mobile App (React Native)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Native** | 0.73.6 | Mobile framework |
| **TypeScript** | 5.3.3 | Type-safe JavaScript |
| **NativeWind** | Latest | Tailwind CSS for React Native |
| **React Navigation** | Latest | Navigation library |
| **Zustand** | Latest | State management |
| **Fabric.js** | (Native alternative) | Canvas drawing |

---

## Project Structure

### Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry point
│   ├── database.py                # Database connection and session management
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Application configuration (settings, CORS, etc.)
│   │   └── security.py            # Authentication utilities (JWT, password hashing)
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py                # Base SQLAlchemy model
│   │   ├── user.py                # User model (authentication)
│   │   ├── habit.py               # Habit model
│   │   ├── habit_check.py         # Habit check/tracking model
│   │   ├── journal_entry.py       # Journal entry model
│   │   └── event.py               # Calendar event model
│   │
│   └── api/
│       ├── __init__.py
│       └── v1/
│           ├── __init__.py        # API router aggregation
│           └── endpoints/
│               ├── __init__.py
│               ├── auth.py         # Authentication endpoints (register, login, logout)
│               ├── habits.py       # Habit management endpoints
│               ├── journal.py      # Journal entry endpoints
│               ├── calendar.py     # Calendar event endpoints
│               └── sync.py         # External sync endpoints (Notion, Google Calendar)
│
├── requirements.txt               # Python dependencies
├── .env.example                  # Environment variables template
├── journalapp.db                 # SQLite database file
└── README.md                     # Backend documentation
```

### Web App Structure

```
webapp/
├── src/
│   ├── main.tsx                   # Application entry point
│   ├── App.tsx                    # Main app component with routing
│   ├── index.css                  # Global styles and Tailwind directives
│   │
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Authentication screen
│   │   ├── TodayScreen.tsx        # Daily overview screen
│   │   ├── CalendarScreen.tsx     # Calendar view screen
│   │   ├── CreativeJournalScreen.tsx  # Canvas-based journal screen
│   │   └── ProfileScreen.tsx      # User profile and habit management
│   │
│   ├── stores/
│   │   ├── authStore.ts           # Authentication state (Zustand)
│   │   ├── habitStore.ts          # Habit management state
│   │   └── journalStore.ts        # Journal entry state
│   │
│   ├── services/
│   │   └── api.ts                 # API service (HTTP requests)
│   │
│   └── types/
│       └── index.ts               # TypeScript type definitions
│
├── index.html                     # HTML entry point
├── vite.config.ts                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Node.js dependencies
└── README.md                      # Web app documentation
```

---

## Features Implemented

### 1. User Authentication System

**Backend Implementation**:
- User registration with email, username, and password
- Password hashing using bcrypt
- JWT token generation and validation
- Protected routes with authentication middleware
- User profile management

**Frontend Implementation**:
- Login/Register screens
- Token storage in localStorage (with Zustand persistence)
- Protected routes (redirect to login if not authenticated)
- Auto-authentication check on app load
- Logout functionality

**Key Files**:
- `backend/app/models/user.py` - User data model
- `backend/app/core/security.py` - Security utilities
- `backend/app/api/v1/endpoints/auth.py` - Auth endpoints
- `webapp/src/stores/authStore.ts` - Auth state management
- `webapp/src/screens/LoginScreen.tsx` - Login UI

### 2. Habit Tracking System

**Features**:
- Create, update, and delete habits
- Color-coded habit visualization
- Daily habit check-in/tracking
- Streak calculation (current and longest)
- Habit activation/deactivation

**Key Files**:
- `backend/app/models/habit.py` - Habit model
- `backend/app/models/habit_check.py` - Habit check model
- `backend/app/api/v1/endpoints/habits.py` - Habit endpoints
- `webapp/src/stores/habitStore.ts` - Habit state management
- `webapp/src/screens/ProfileScreen.tsx` - Habit management UI
- `webapp/src/screens/TodayScreen.tsx` - Daily habit tracking UI

### 3. Journal Entry System

**Features**:
- Daily text journal entries
- Canvas-based creative journal entries
- Drawing with pen tool
- Sticker/emoji addition
- Photo/image upload
- Text overlay
- Entry retrieval by date

**Key Files**:
- `backend/app/models/journal_entry.py` - Journal entry model
- `backend/app/api/v1/endpoints/journal.py` - Journal endpoints
- `webapp/src/stores/journalStore.ts` - Journal state management
- `webapp/src/screens/TodayScreen.tsx` - Daily log input
- `webapp/src/screens/CreativeJournalScreen.tsx` - Canvas journal

### 4. Calendar System

**Features**:
- View calendar in month/week/day formats
- Create and manage calendar events
- Color-coded events
- Integration with journal entries
- Event date filtering

**Key Files**:
- `backend/app/models/event.py` - Event model
- `backend/app/api/v1/endpoints/calendar.py` - Calendar endpoints
- `webapp/src/screens/CalendarScreen.tsx` - Calendar UI

### 5. Responsive Design & Mobile Optimization

**Features**:
- Fully responsive layout (mobile, tablet, desktop)
- Touch-optimized interactions
- Mobile-friendly canvas drawing
- Safe area support for notched devices
- Responsive typography and spacing

**Key Technologies**:
- Tailwind CSS responsive utilities
- CSS touch-action properties
- Viewport meta tags
- Canvas touch event handling

### 6. External Access

**Features**:
- Local network access (same WiFi)
- Configurable CORS settings
- Host configuration for external connections
- IP address detection script

**Configuration**:
- Vite dev server: `host: '0.0.0.0'`
- Backend CORS: Configurable origins
- Network access guide and scripts

---

## Implementation Details

### Authentication Flow

1. **Registration**:
   ```
   User Input → Frontend Validation → POST /api/v1/auth/register
   → Backend Validation → Password Hashing → User Creation → JWT Token Generation
   → Return Token + User Data → Store in Zustand → Redirect to Home
   ```

2. **Login**:
   ```
   User Credentials → POST /api/v1/auth/login-json
   → Backend Validation → Password Verification → JWT Token Generation
   → Return Token + User Data → Store in Zustand → Redirect to Home
   ```

3. **Protected Routes**:
   ```
   Route Access → Check Auth Token → Validate Token → Get User → Allow Access
   (If invalid) → Redirect to Login
   ```

### Database Schema

**Users Table**:
- `id` (String, Primary Key)
- `email` (String, Unique)
- `username` (String, Unique)
- `hashed_password` (String)
- `full_name` (String, Optional)
- `is_active` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Habits Table**:
- `id` (String, Primary Key)
- `user_id` (String, Foreign Key)
- `name` (String)
- `color` (String)
- `icon` (String, Optional)
- `category` (String, Optional)
- `is_active` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Habit Checks Table**:
- `id` (String, Primary Key)
- `user_id` (String, Foreign Key)
- `habit_id` (String, Foreign Key)
- `date` (Date)
- `completed` (Boolean)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Journal Entries Table**:
- `id` (String, Primary Key)
- `user_id` (String, Foreign Key)
- `date` (Date)
- `text` (Text, Optional)
- `layers` (JSON) - Canvas layers data
- `background` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Events Table**:
- `id` (String, Primary Key)
- `user_id` (String, Foreign Key)
- `title` (String)
- `description` (Text, Optional)
- `date` (DateTime)
- `start_time` (DateTime, Optional)
- `end_time` (DateTime, Optional)
- `color` (String)
- `synced_calendars` (JSON, Optional)
- `notion_page_id` (String, Optional)
- `created_at` (DateTime)
- `updated_at` (DateTime)

### State Management (Zustand)

**Auth Store** (`authStore.ts`):
- User information
- Authentication token
- Login/logout functions
- Token persistence (localStorage)

**Habit Store** (`habitStore.ts`):
- List of habits
- Habit CRUD operations
- Habit checks
- Streak calculations

**Journal Store** (`journalStore.ts`):
- Journal entries
- Current entry
- Canvas layers
- Entry CRUD operations

### API Service Layer

Centralized API service (`api.ts`) that:
- Handles all HTTP requests
- Automatically injects JWT tokens
- Provides type-safe request/response handling
- Centralizes error handling

---

## Setup & Deployment

### Prerequisites

- **Python** 3.13+
- **Node.js** 18+
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# (Optional) Copy environment template
cp env.template .env

# Run the server
python -m app.main
```

The backend will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Web App Setup

```bash
# Navigate to webapp directory
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

The web app will be available at http://localhost:3000

### Access from Other Devices

1. Find your local IP address:
   ```bash
   cd webapp
   ./get-local-ip.sh
   ```

2. Access from other devices on the same network:
   ```
   http://YOUR_IP:3000
   ```

3. Ensure backend is running on port 8000

---

## API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login (OAuth2 form)
- `POST /api/v1/auth/login-json` - Login (JSON)
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Habit Endpoints

- `GET /api/v1/habits/habits` - Get all habits
- `POST /api/v1/habits/habits` - Create habit
- `GET /api/v1/habits/habits/{id}` - Get habit
- `PUT /api/v1/habits/habits/{id}` - Update habit
- `DELETE /api/v1/habits/habits/{id}` - Delete habit
- `POST /api/v1/habits/habits/checks` - Create/update habit check
- `GET /api/v1/habits/habits/checks/date/{date}` - Get checks for date
- `GET /api/v1/habits/habits/{id}/streak` - Get habit streak

### Journal Endpoints

- `GET /api/v1/journal/entries` - Get all entries
- `POST /api/v1/journal/entries` - Create entry
- `GET /api/v1/journal/entries/{date}` - Get entry by date
- `PUT /api/v1/journal/entries/{date}` - Update entry
- `DELETE /api/v1/journal/entries/{date}` - Delete entry
- `POST /api/v1/journal/entries/{date}/daily-log` - Update daily log text

### Calendar Endpoints

- `GET /api/v1/calendar/events` - Get all events
- `POST /api/v1/calendar/events` - Create event
- `GET /api/v1/calendar/events/{id}` - Get event
- `PUT /api/v1/calendar/events/{id}` - Update event
- `DELETE /api/v1/calendar/events/{id}` - Delete event
- `GET /api/v1/calendar/events/date/{date}` - Get events for date

For detailed API documentation, visit http://localhost:8000/docs when the backend is running.

---

## Key Design Decisions

### Why FastAPI?
- Fast performance (async/await support)
- Automatic API documentation
- Type validation with Pydantic
- Easy to use and maintain

### Why React + TypeScript?
- Strong typing with TypeScript
- Component reusability
- Large ecosystem
- Good performance

### Why Zustand?
- Lightweight state management
- Simple API
- Built-in persistence support
- No boilerplate code

### Why SQLite?
- Easy setup (no server required)
- Good for development
- Can be upgraded to PostgreSQL/MySQL for production

### Why Vite?
- Fast development server
- Fast builds
- Excellent developer experience
- Modern tooling

---

## Future Enhancements

1. **Backend**:
   - PostgreSQL/MySQL support
   - Database migrations with Alembic
   - File upload handling
   - Email notifications
   - Password reset functionality

2. **Frontend**:
   - Offline support (PWA)
   - Real-time updates (WebSockets)
   - Advanced canvas features
   - Export/import functionality
   - Dark mode

3. **Mobile App**:
   - Push notifications
   - Offline sync
   - Native camera integration
   - Native sharing

4. **Features**:
   - Social features (sharing journals)
   - Templates for journal entries
   - Advanced analytics
   - Goal tracking
   - Mood tracking

---

## Conclusion

This project demonstrates a complete full-stack application with:
- **Modern Architecture**: RESTful API with React frontend
- **Authentication**: Secure JWT-based authentication
- **Data Persistence**: SQLite database with SQLAlchemy ORM
- **Responsive Design**: Mobile-first responsive UI
- **Type Safety**: TypeScript throughout
- **State Management**: Centralized state with Zustand
- **Developer Experience**: Fast development with Vite and FastAPI

The application is production-ready with proper authentication, data isolation, and a modern, responsive user interface.

