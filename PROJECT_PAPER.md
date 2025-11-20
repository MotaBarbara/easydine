# EasyDine - Restaurant Reservation Management System

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 Project Objectives
   - 1.2 Motivation
   - 1.3 Project Links

2. [Project Description](#2-project-description)
   - 2.1 Overview
   - 2.2 Main Features

3. [Language and Frameworks](#3-language-and-frameworks)

4. [Internal Functioning of the Application](#4-internal-functioning-of-the-application)
   - 4.1 General Architecture
   - 4.2 Authentication Life Cycle
   - 4.3 Data Management and Persistence
   - 4.4 API Routes and Endpoints
   - 4.5 Reservation Management System
   - 4.6 Security and Authentication

5. [Instructions for Running the Project Locally](#5-instructions-for-running-the-project-locally)

6. [Technologies and Libraries Used](#6-technologies-and-libraries-used)

7. [User Flow](#7-user-flow)
   - Stage 1: Customer Flow (MVP)
   - Stage 2: Restaurant Owner Management
   - Stage 3: Multi-Restaurant Support

8. [Wireframes / Interface Design](#8-wireframes--interface-design)

9. [Project Architecture](#9-project-architecture)
   - 9.1 Folder Structure
   - 9.2 Folder Function

10. [Database Organization](#10-database-organization)
    - 10.1 General Structure
    - 10.2 Existing Tables and Relationships

11. [PR Creation Process](#11-pr-creation-process)

12. [The Biggest Challenges of the Project](#12-the-biggest-challenges-of-the-project)
    - 12.1 Many-to-Many Restaurant Ownership
    - 12.2 Reservation Time Validation
    - 12.3 Restaurant Settings and Business Rules
    - 12.4 Testing with In-Memory Repositories

13. [Conclusion](#13-conclusion)

---

## 1. Introduction

### 1.1 Project Objectives

EasyDine is a full-stack web application designed to streamline restaurant reservation management. The primary objectives of this project are:

- **For Customers**: Provide an intuitive interface to browse restaurants, view availability, and make reservations with minimal friction
- **For Restaurant Owners**: Offer a comprehensive dashboard to manage multiple restaurants, view reservations, configure business hours, and handle special closure rules
- **Technical Excellence**: Demonstrate proficiency in modern full-stack development using TypeScript, Node.js, Fastify, Next.js, and Prisma ORM
- **Architecture**: Implement clean architecture principles with separation of concerns, dependency injection, and testable code

### 1.2 Motivation

The motivation behind EasyDine stems from the need for a modern, efficient restaurant reservation system that addresses common pain points:

- **Complexity**: Many existing systems are overly complex or require expensive third-party services
- **Flexibility**: Restaurant owners need granular control over their availability, including time slots, capacity limits, and closure rules
- **User Experience**: Customers should be able to make reservations quickly without unnecessary steps
- **Scalability**: The system should support restaurant owners managing multiple establishments
- **Learning**: This project serves as a comprehensive learning experience in full-stack development, database design, authentication, and API development

### 1.3 Project Links

- **Repository**: [GitHub Repository URL]
- **Backend API**: `http://localhost:3333`
- **Frontend Application**: `http://localhost:3000`
- **Database**: PostgreSQL on `localhost:5432`

---

## 2. Project Description

### 2.1 Overview

EasyDine is a restaurant reservation management platform built with a modern tech stack. The application follows a client-server architecture where:

- **Backend**: A RESTful API built with Fastify (Node.js framework) that handles business logic, data persistence, and authentication
- **Frontend**: A Next.js application providing a responsive user interface for both customers and restaurant owners
- **Database**: PostgreSQL database managed through Prisma ORM for type-safe database access

The system supports two primary user roles:
1. **Customers**: Browse restaurants, view availability, make reservations, and cancel bookings
2. **Restaurant Owners**: Create and manage restaurants, configure settings, view reservations, and handle multiple restaurant locations

### 2.2 Main Features

#### Customer Features
- **Restaurant Discovery**: Browse available restaurants with visual cards showing name and logo
- **Availability Viewing**: Check real-time availability for specific dates
- **Reservation Booking**: Make reservations with customer details (name, email, group size)
- **Reservation Cancellation**: Cancel reservations via secure token-based links sent via email
- **Past Time Prevention**: System prevents booking reservations for past dates/times

#### Restaurant Owner Features
- **Multi-Restaurant Management**: Owners can create and manage multiple restaurants
- **Restaurant Dashboard**: View all reservations for a specific restaurant with filtering and summaries
- **Restaurant Settings**: Configure comprehensive business rules including:
  - Opening hours with time slots (from, to, max reservations per slot)
  - Weekly closure rules (e.g., closed every Monday lunch)
  - Special date closures (e.g., closed on December 25th evening)
- **Restaurant Customization**: Set restaurant name, logo, and primary brand color
- **Reservation Management**: View, filter, and manage all reservations

#### System Features
- **JWT Authentication**: Secure token-based authentication for owners
- **Email Notifications**: Automated email confirmations with cancellation links
- **Data Validation**: Comprehensive validation on both frontend and backend using Zod schemas
- **Error Handling**: Graceful error handling with meaningful error messages
- **Type Safety**: Full TypeScript implementation for type safety across the stack

---

## 3. Language and Frameworks

### Backend
- **Language**: TypeScript (Node.js runtime)
- **Framework**: Fastify - High-performance web framework for Node.js
- **ORM**: Prisma - Next-generation ORM with type-safe database access
- **Database**: PostgreSQL - Robust relational database system
- **Authentication**: JWT (JSON Web Tokens) via `fastify-jwt`
- **Validation**: Zod - TypeScript-first schema validation
- **Email**: Nodemailer - Email sending functionality
- **Testing**: Vitest - Fast unit test framework

### Frontend
- **Framework**: Next.js 16 - React framework with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 - Utility-first CSS framework
- **Date Handling**: date-fns and date-fns-tz - Date manipulation and timezone handling
- **HTTP Client**: Native fetch API

### Infrastructure
- **Containerization**: Docker Compose for local database setup
- **Package Management**: npm
- **Build Tools**: tsup (backend), Next.js built-in (frontend)

---

## 4. Internal Functioning of the Application

### 4.1 General Architecture

EasyDine follows a **Clean Architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Pages      │  │  Components  │  │   Hooks      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Fastify)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │→ │  Use Cases   │→ │ Repositories │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                          │                               │
│                    Middleware Layer                      │
│              (JWT Auth, Validation, CORS)                │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                 │
│              Managed by Prisma ORM                      │
└─────────────────────────────────────────────────────────┘
```

**Architecture Layers:**

1. **Controllers** (`server/src/http/controllers/`): Handle HTTP requests, validate input, call use cases, format responses
2. **Use Cases** (`server/src/use-cases/`): Contain business logic, orchestrate repository calls, handle domain errors
3. **Repositories** (`server/src/repositories/`): Abstract data access, provide database operations interface
4. **Models** (Prisma Schema): Define database structure and relationships

**Key Design Patterns:**
- **Repository Pattern**: Abstracts data access, allows easy testing with in-memory implementations
- **Dependency Injection**: Use cases receive repositories as constructor parameters
- **Factory Pattern**: Factory functions create use case instances with proper dependencies
- **Middleware Pattern**: Authentication and authorization handled via Fastify middleware

### 4.2 Authentication Life Cycle

#### Registration Flow
1. User submits registration form with name, email, and password
2. Frontend sends `POST /users` request
3. Backend validates input using Zod schema
4. `RegisterUseCase` checks if email already exists
5. Password is hashed using bcryptjs (10 rounds)
6. User record is created in database
7. Response returns user data (without password hash)

#### Login Flow
1. User submits login form with email and password
2. Frontend sends `POST /sessions` request
3. `AuthenticateUseCase` finds user by email
4. Password is verified against stored hash
5. JWT token is generated containing:
   - `sub`: User ID
   - `email`: User email
   - `name`: User name
6. Token is returned to frontend
7. Frontend stores token in memory/localStorage
8. Token is included in `Authorization: Bearer <token>` header for protected routes

#### Protected Route Access
1. Request includes JWT token in Authorization header
2. `verifyJWT` middleware validates token signature
3. Token payload is attached to `request.user`
4. `ensureOwner` middleware (for restaurant-specific routes):
   - Extracts `restaurantId` from URL params
   - Queries database to verify user is in restaurant's `owners` array
   - Returns 403 if user is not an owner
5. Controller receives authenticated request with user context

#### Token Structure
```typescript
{
  sub: string,        // User ID
  email: string,       // User email
  name: string         // User name
}
```

### 4.3 Data Management and Persistence

#### Prisma ORM Integration
- **Schema Definition**: Database schema defined in `server/prisma/schema.prisma`
- **Type Generation**: Prisma generates TypeScript types from schema
- **Migrations**: Database changes managed through Prisma migrations
- **Client**: Singleton Prisma client instance (`server/src/lib/prisma.ts`)

#### Repository Pattern Implementation
Two repository implementations:
1. **Prisma Repositories** (`prisma-*-repository.ts`): Production implementation using Prisma
2. **In-Memory Repositories** (`in-memory/in-memory-*-repository.ts`): Testing implementation using arrays

This pattern allows:
- Easy unit testing without database setup
- Consistent interface across implementations
- Easy swapping of data sources

#### Data Flow Example (Create Reservation)
```
Controller → Use Case → Repository → Prisma → PostgreSQL
     ↓           ↓          ↓          ↓         ↓
  Validate   Business   Abstract   Type-safe  Persist
   Input      Logic      Access     Query     Data
```

### 4.4 API Routes and Endpoints

#### Public Endpoints
- `GET /restaurants` - List all restaurants
- `GET /restaurants/:id` - Get restaurant details
- `GET /restaurants/:id/availability` - Get availability for a date
- `POST /reservations` - Create a reservation (public)
- `GET /reservations/cancel/:token` - Cancel reservation by token
- `POST /users` - Register new user
- `POST /sessions` - Authenticate user

#### Protected Endpoints (Require JWT)
- `GET /me` - Get current user profile
- `GET /me/restaurants` - List restaurants owned by current user
- `POST /restaurants` - Create new restaurant
- `GET /restaurants/:id/reservations` - List reservations (owner only)
- `PUT /restaurants/:id` - Update restaurant (owner only)
- `PATCH /reservations/:id/cancel` - Cancel reservation (authenticated)

#### Route Protection Levels
1. **Public**: No authentication required
2. **Authenticated**: Requires valid JWT (`verifyJWT` middleware)
3. **Owner-Only**: Requires JWT + ownership verification (`ensureOwner` middleware)

### 4.5 Reservation Management System

#### Reservation Creation Flow
1. Customer selects restaurant, date, and time
2. Frontend validates:
   - Date is not in the past
   - Time is not in the past (if date is today)
3. `POST /reservations` request sent with:
   - `restaurantId`, `date`, `time`, `customerName`, `customerEmail`, `groupSize`
4. `CreateReservationUseCase` executes:
   - Validates restaurant exists
   - Checks if date/time is in the past (`isPastDateTime`)
   - Checks if restaurant is closed at that time (`isClosedAt`)
   - Finds matching time slot
   - Calculates current reservations for slot
   - Validates capacity (prevents overbooking)
   - Creates reservation with unique `cancelToken`
5. Email confirmation sent with cancellation link
6. Response returns reservation details

#### Business Rules Validation
- **Past Time Prevention**: `isPastDateTime()` checks both date and time
- **Restaurant Closure**: `isClosedAt()` checks:
  - Weekly closure rules (e.g., closed every Monday)
  - Special date closures (e.g., closed on Dec 25)
  - Time-specific closures (e.g., closed Monday lunch 12:00-15:00)
- **Capacity Management**: Each time slot has `maxReservations` limit
- **Overbooking Prevention**: Sum of `groupSize` for slot cannot exceed `maxReservations`

#### Reservation Cancellation
Two methods:
1. **Token-based** (public): `GET /reservations/cancel/:token` - No authentication needed
2. **Authenticated**: `PATCH /reservations/:id/cancel` - Requires JWT

Both methods:
- Verify reservation exists and is not already cancelled
- Update status to "cancelled"
- Return confirmation

### 4.6 Security and Authentication

#### Password Security
- **Hashing**: Passwords hashed with bcryptjs (10 salt rounds)
- **Never Stored**: Plain passwords never stored or logged
- **Verification**: `bcrypt.compare()` used for login verification

#### JWT Security
- **Secret Key**: Stored in environment variable `JWT_SECRET`
- **Expiration**: Tokens can include expiration (if configured)
- **Signature Verification**: All protected routes verify token signature
- **Payload Validation**: User ID extracted from `sub` claim

#### Authorization
- **Role-Based**: Different access levels (public, authenticated, owner)
- **Resource Ownership**: `ensureOwner` middleware verifies restaurant ownership
- **Many-to-Many Check**: Ownership verified by checking if user ID exists in restaurant's `owners` array

#### Input Validation
- **Zod Schemas**: All inputs validated with Zod schemas
- **Type Safety**: TypeScript ensures type correctness
- **Error Messages**: Validation errors return detailed messages

#### CORS Configuration
- **Origin Restriction**: CORS configured to allow only frontend origin
- **Method Allowlist**: Only necessary HTTP methods allowed
- **Credentials**: Can be configured for cookie-based auth (if needed)

---

## 5. Instructions for Running the Project Locally

### Prerequisites
- Node.js 18+ installed
- Docker and Docker Compose installed
- npm or pnpm package manager

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository
git clone [repository-url]
cd easydine-app

# Install root dependencies (if using workspace)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Set Up Database
```bash
# Start PostgreSQL with Docker Compose
docker compose up -d

# Wait a few seconds for database to initialize
```

### Step 3: Configure Environment Variables

**Server** (`server/.env`):
```env
DATABASE_URL="postgresql://docker:docker@localhost:5432/easydine?schema=public"
JWT_SECRET="your-secret-key-here-change-in-production"
FRONTEND_ORIGIN="http://localhost:3000"
FRONTEND_BASE_URL="http://localhost:3000"
MAIL_FROM='"EasyDine" <no-reply@easydine.test>'
```

**Client** (optional, `client/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3333"
```

### Step 4: Run Database Migrations
```bash
cd server
npx prisma migrate dev
# Or if migrations already exist:
npx prisma migrate deploy
```

### Step 5: Generate Prisma Client
```bash
cd server
npx prisma generate
```

### Step 6: Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run start:dev
# Server runs on http://localhost:3333
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:3000
```

### Step 7: Access the Application
- **Frontend**: Open `http://localhost:3000` in your browser
- **API**: Backend available at `http://localhost:3333`
- **Database**: PostgreSQL on `localhost:5432`

### Running Tests
```bash
cd server
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

### Database Management
```bash
cd server
npx prisma studio    # Open Prisma Studio (GUI for database)
npx prisma migrate dev # Create and apply new migration
```

---

## 6. Technologies and Libraries Used

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `fastify` | ^5.6.1 | Web framework |
| `@fastify/cors` | ^11.1.0 | CORS middleware |
| `fastify-jwt` | ^4.1.3 | JWT authentication |
| `@prisma/client` | 6.17.1 | Prisma ORM client |
| `prisma` | ^6.17.1 | Prisma CLI and tools |
| `bcryptjs` | ^3.0.2 | Password hashing |
| `zod` | ^4.1.12 | Schema validation |
| `nodemailer` | ^7.0.10 | Email sending |
| `dotenv` | ^17.2.3 | Environment variables |
| `vitest` | ^4.0.3 | Testing framework |
| `tsup` | ^8.5.0 | TypeScript bundler |

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.0.3 | React framework |
| `react` | 19.2.0 | UI library |
| `react-dom` | 19.2.0 | React DOM renderer |
| `typescript` | ^5 | Type safety |
| `tailwindcss` | ^4 | CSS framework |
| `date-fns` | ^4.1.0 | Date utilities |
| `date-fns-tz` | ^3.2.0 | Timezone handling |

### Development Tools

| Tool | Purpose |
|------|---------|
| TypeScript | Type-safe development |
| ESLint | Code linting |
| Vitest | Unit testing |
| Docker Compose | Local database setup |
| Prisma Studio | Database GUI |

---

## 7. User Flow

### Stage 1: Customer Flow (MVP)

#### Browse Restaurants
1. User visits homepage (`/`)
2. System fetches all restaurants via `GET /restaurants`
3. Restaurants displayed as cards with name and logo
4. User clicks on a restaurant card

#### View Restaurant Details
1. User navigates to `/restaurants/[id]`
2. System fetches restaurant details via `GET /restaurants/:id`
3. Restaurant information displayed (name, logo, primary color)
4. Booking form rendered with date and time inputs

#### Check Availability
1. User selects a date in booking form
2. Frontend calls `GET /restaurants/:id/availability?date=YYYY-MM-DD`
3. Backend calculates available time slots based on:
   - Restaurant opening hours
   - Existing reservations
   - Capacity limits
4. Available times displayed to user

#### Make Reservation
1. User fills booking form:
   - Date (validated: not in past)
   - Time (validated: not in past if today)
   - Customer name
   - Customer email
   - Group size
2. Form submission calls `POST /reservations`
3. Backend validates:
   - Past time check
   - Restaurant closure check
   - Capacity check
4. Reservation created, confirmation email sent
5. User redirected to confirmation page

#### Cancel Reservation
1. User receives email with cancellation link
2. Link format: `/reservations/cancel/[token]`
3. User clicks link, system calls `GET /reservations/cancel/:token`
4. Reservation cancelled, confirmation shown

### Stage 2: Restaurant Owner Management

#### Owner Registration and Login
1. Owner visits `/register`
2. Fills registration form (name, email, password)
3. Account created via `POST /users`
4. Owner logs in via `/login` with `POST /sessions`
5. JWT token received and stored

#### Create Restaurant
1. Owner navigates to `/owner`
2. If no restaurants, redirected to `/owner/restaurant/new`
3. Owner fills restaurant creation form:
   - Name (required, unique)
   - Logo URL (optional)
   - Primary color (optional)
4. Form submission calls `POST /restaurants`
5. Restaurant created and connected to owner via many-to-many relationship
6. Owner redirected to restaurant dashboard

#### View Restaurant Dashboard
1. Owner navigates to `/owner/[restaurantId]`
2. System fetches:
   - Restaurant details: `GET /restaurants/:id`
   - Reservations: `GET /restaurants/:id/reservations`
3. Dashboard displays:
   - Restaurant name and info
   - Reservations list (upcoming)
   - Reservations summary (count, total guests)

#### Configure Restaurant Settings
1. Owner navigates to `/owner/[restaurantId]/settings`
2. System fetches restaurant via `GET /restaurants/:id`
3. Settings form pre-filled with current values
4. Owner can configure:
   - **Basic Info**: Name, logo, primary color
   - **Time Slots**: Add/edit slots with from, to, maxReservations
   - **Weekly Closures**: Add rules like "Closed every Monday lunch"
   - **Special Dates**: Add specific date closures
5. Form submission calls `PUT /restaurants/:id`
6. Settings saved, confirmation shown

### Stage 3: Multi-Restaurant Support

#### View All Restaurants
1. Owner logs in and navigates to `/owner`
2. System calls `GET /me/restaurants`
3. All restaurants owned by user displayed as list
4. Each restaurant card shows name and logo

#### Switch Between Restaurants
1. Owner clicks on a restaurant card
2. Navigates to `/owner/[restaurantId]`
3. Dashboard shows data for selected restaurant
4. Owner can switch restaurants anytime via `/owner` page

#### Manage Multiple Locations
- Each restaurant has independent:
  - Settings (opening hours, closures)
  - Reservations
  - Branding (logo, color)
- Owner can manage all from single account

---

## 8. Wireframes / Interface Design

### Homepage (`/`)
```
┌─────────────────────────────────────────┐
│  EasyDine                               │
│  Pick a restaurant and book your table  │
├─────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐│
│  │ 🍕      │  │ 🍔      │  │ 🍜      ││
│  │ Name    │  │ Name    │  │ Name    ││
│  │ Tap to  │  │ Tap to  │  │ Tap to  ││
│  │ view    │  │ view    │  │ view    ││
│  └─────────┘  └─────────┘  └─────────┘│
└─────────────────────────────────────────┘
```

### Restaurant Booking Page (`/restaurants/[id]`)
```
┌─────────────────────────────────────────┐
│  ← Back    Restaurant Name              │
│  [Logo]                                  │
├─────────────────────────────────────────┤
│  Booking Form                            │
│  ┌─────────────────────────────────────┐ │
│  │ Date: [📅 2024-12-25]              │ │
│  │ Time: [🕐 19:00]                    │ │
│  │ Name: [John Doe]                    │ │
│  │ Email: [john@example.com]           │ │
│  │ Guests: [2]                         │ │
│  │                                     │ │
│  │        [Book Table]                 │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Owner Dashboard (`/owner/[restaurantId]`)
```
┌─────────────────────────────────────────┐
│  My Restaurants  [Restaurant Name]     │
├─────────────────────────────────────────┤
│  Reservations Summary                   │
│  ┌──────────┐  ┌──────────┐          │
│  │    12    │  │    24    │          │
│  │ Upcoming │  │  Guests  │          │
│  └──────────┘  └──────────┘          │
├─────────────────────────────────────────┤
│  Upcoming Reservations                  │
│  ┌─────────────────────────────────────┐ │
│  │ John Doe                            │ │
│  │ Wed, 19 Nov at 7:00 PM     2 guests│ │
│  ├─────────────────────────────────────┤ │
│  │ Jane Smith                          │ │
│  │ Thu, 20 Nov at 8:00 PM     4 guests│ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Restaurant Settings (`/owner/[restaurantId]/settings`)
```
┌─────────────────────────────────────────┐
│  Restaurant Settings                     │
├─────────────────────────────────────────┤
│  Basic Information                        │
│  Name: [Restaurant Name]                 │
│  Logo: [URL input]                       │
│  Color: [#FF5733]                        │
├─────────────────────────────────────────┤
│  Opening Hours / Time Slots              │
│  ┌─────────────────────────────────────┐ │
│  │ From: 18:00  To: 22:00              │ │
│  │ Max Reservations: 10               │ │
│  │                    [Remove]        │ │
│  └─────────────────────────────────────┘ │
│  [+ Add Slot]                            │
├─────────────────────────────────────────┤
│  Weekly Closure Rules                    │
│  [Add rule: Monday, 12:00-15:00]         │
│  Preview: "Closed every Monday lunch"   │
├─────────────────────────────────────────┤
│  Special Closed Dates                    │
│  [Add date: 2024-12-25, 18:00-23:59]   │
│  Preview: "Closed 25 Dec (evening)"      │
├─────────────────────────────────────────┤
│           [Save Settings]                │
└─────────────────────────────────────────┘
```

---

## 9. Project Architecture

### 9.1 Folder Structure

```
easydine-app/
├── client/                          # Next.js frontend application
│   ├── app/                         # Next.js App Router
│   │   ├── components/              # Reusable React components
│   │   │   ├── reservation-card.tsx
│   │   │   ├── reservations-list.tsx
│   │   │   └── reservations-summary.tsx
│   │   ├── owner/                   # Owner-specific pages
│   │   │   ├── [restaurantId]/      # Dynamic restaurant routes
│   │   │   │   ├── page.tsx         # Restaurant dashboard
│   │   │   │   └── settings/
│   │   │   ├── components/          # Owner components
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   └── page.tsx             # Restaurant list
│   │   ├── restaurants/              # Public restaurant pages
│   │   │   └── [id]/
│   │   │       ├── booking-form.tsx
│   │   │       └── page.tsx
│   │   ├── login/                    # Authentication pages
│   │   ├── register/
│   │   └── reservations/             # Reservation pages
│   ├── lib/                          # Utility libraries
│   │   ├── api.ts                    # API client functions
│   │   ├── auth.ts                   # Auth utilities
│   │   └── auth-api.ts               # Auth API calls
│   └── types/                        # TypeScript type definitions
│
├── server/                           # Fastify backend application
│   ├── prisma/                       # Prisma configuration
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # Database migrations
│   ├── src/
│   │   ├── http/                     # HTTP layer
│   │   │   ├── controllers/         # Request handlers
│   │   │   ├── middlewares/          # Auth, validation middleware
│   │   │   ├── plugins/              # Fastify plugins
│   │   │   ├── routes.ts             # Route definitions
│   │   │   └── app.ts                # Fastify app setup
│   │   ├── use-cases/                # Business logic
│   │   │   ├── authenticate.ts
│   │   │   ├── create-reservation.ts
│   │   │   ├── create-restaurant.ts
│   │   │   ├── errors/               # Domain errors
│   │   │   └── factories/           # Use case factories
│   │   ├── repositories/             # Data access layer
│   │   │   ├── prisma-*-repository.ts # Prisma implementations
│   │   │   └── in-memory/           # Test implementations
│   │   ├── utils/                    # Utility functions
│   │   │   └── reservation-time.ts   # Time validation logic
│   │   ├── types/                    # TypeScript types
│   │   └── lib/                      # Core libraries
│   │       ├── prisma.ts             # Prisma client
│   │       └── mail.ts               # Email configuration
│   └── generated/                   # Generated Prisma client
│
├── compose.yml                       # Docker Compose config
└── package.json                      # Root package.json
```

### 9.2 Folder Function

#### Frontend (`client/`)

**`app/`**: Next.js App Router directory
- Each folder represents a route
- `page.tsx` files are route components
- `[id]` or `[restaurantId]` are dynamic route segments

**`app/components/`**: Shared UI components
- Reusable across multiple pages
- Examples: `reservation-card.tsx`, `reservations-list.tsx`

**`app/owner/`**: Restaurant owner interface
- `page.tsx`: List of all restaurants owned by user
- `[restaurantId]/page.tsx`: Dashboard for specific restaurant
- `[restaurantId]/settings/`: Restaurant configuration page
- `components/`: Owner-specific components
- `hooks/`: Custom hooks for data fetching (e.g., `useDashboardData`)

**`lib/`**: Utility functions and API clients
- `api.ts`: Generic API request functions
- `auth.ts`: Authentication helpers (token management)
- `auth-api.ts`: Authentication-specific API calls

**`types/`**: TypeScript type definitions
- Shared types between frontend and backend
- Restaurant, Reservation types

#### Backend (`server/src/`)

**`http/controllers/`**: Request handlers
- Receive HTTP requests
- Validate input with Zod
- Call use cases
- Format and return responses
- Examples: `create-reservation.ts`, `authenticate.ts`

**`http/middlewares/`**: Request middleware
- `verify-jwt.ts`: JWT token validation
- `ensure-owner.ts`: Restaurant ownership verification
- Run before controllers

**`use-cases/`**: Business logic layer
- Contain core application logic
- Independent of HTTP framework
- Use repositories for data access
- Throw domain-specific errors
- Examples:
  - `create-reservation.ts`: Reservation creation logic
  - `authenticate.ts`: Authentication logic
  - `create-restaurant.ts`: Restaurant creation logic

**`use-cases/factories/`**: Dependency injection
- Create use case instances with dependencies
- Examples: `make-create-reservation-use-case.ts`

**`repositories/`**: Data access abstraction
- Interface definitions: `*-repository.ts`
- Prisma implementations: `prisma-*-repository.ts`
- In-memory implementations: `in-memory/in-memory-*-repository.ts`
- Allows easy testing and swapping data sources

**`utils/`**: Utility functions
- Pure functions, no side effects
- Examples: `reservation-time.ts` (time validation, closure checks)

**`types/`**: TypeScript type definitions
- Domain types: `restaurant-settings.ts`
- Framework types: `fastify-jwt.d.ts`

**`lib/`**: Core libraries
- `prisma.ts`: Prisma client singleton
- `mail.ts`: Email service configuration

---

## 10. Database Organization

### 10.1 General Structure

The database uses **PostgreSQL** and is managed through **Prisma ORM**. The schema is defined in `server/prisma/schema.prisma` and uses:

- **UUIDs** for primary keys (generated automatically)
- **Timestamps** for created dates
- **JSON** fields for flexible data (restaurant settings)
- **Relationships** defined through Prisma relations

### 10.2 Existing Tables and Relationships

#### User Table
```prisma
model User {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique
  passwordHash String       @map("password_hash")
  createdAt    DateTime     @default(now()) @map("created_at")
  restaurants  Restaurant[]  // Many-to-many relationship
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: User's full name
- `email`: Unique email address (used for login)
- `passwordHash`: Bcrypt-hashed password
- `createdAt`: Account creation timestamp
- `restaurants`: Many-to-many relationship with Restaurant

**Indexes:**
- Unique index on `email` for fast lookups

#### Restaurant Table
```prisma
model Restaurant {
  id           String        @id @default(uuid())
  name         String
  logo         String?
  primaryColor String?
  settings     Json?
  reservations Reservation[]
  owners       User[]        // Many-to-many relationship
  createdAt    DateTime      @default(now()) @map("created_at")
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: Restaurant name (must be unique)
- `logo`: Optional logo URL
- `primaryColor`: Optional brand color (hex code)
- `settings`: JSON field containing:
  - `slots`: Array of time slots with `from`, `to`, `maxReservations`
  - `closedWeekly`: Array of weekly closure rules
  - `closedDates`: Array of special date closures
- `reservations`: One-to-many relationship with Reservation
- `owners`: Many-to-many relationship with User
- `createdAt`: Restaurant creation timestamp

**Relationships:**
- **Many-to-Many with User**: A restaurant can have multiple owners, a user can own multiple restaurants
- **One-to-Many with Reservation**: A restaurant has many reservations

#### Reservation Table
```prisma
model Reservation {
  id            String     @id @default(uuid())
  restaurantId  String
  date          DateTime
  time          String     // Format: "HH:MM"
  customerName  String
  customerEmail String
  groupSize     Int
  status        String     // "confirmed", "cancelled"
  createdAt     DateTime   @default(now()) @map("created_at")
  cancelToken   String     @unique @default(uuid())
  restaurant    Restaurant @relation(fields: [restaurantId], references: [id])
}
```

**Fields:**
- `id`: Unique identifier (UUID)
- `restaurantId`: Foreign key to Restaurant
- `date`: Reservation date (DateTime)
- `time`: Reservation time (string format "HH:MM")
- `customerName`: Customer's name
- `customerEmail`: Customer's email
- `groupSize`: Number of guests
- `status`: Reservation status ("confirmed" or "cancelled")
- `createdAt`: Reservation creation timestamp
- `cancelToken`: Unique token for cancellation link

**Relationships:**
- **Many-to-One with Restaurant**: Each reservation belongs to one restaurant

**Indexes:**
- Unique index on `cancelToken` for secure cancellation

#### Many-to-Many Relationship (User ↔ Restaurant)

Prisma automatically creates an implicit join table `_RestaurantToUser`:

```
_RestaurantToUser
├── A (Restaurant.id)
└── B (User.id)
```

This allows:
- A user to own multiple restaurants
- A restaurant to have multiple owners
- Easy querying: `restaurant.owners` or `user.restaurants`

### Database Migrations

Migrations are stored in `server/prisma/migrations/`:

1. **Initial Migration**: Creates User, Restaurant, Reservation tables
2. **Update Restaurant**: Adds/removes fields as needed
3. **Add Cancel Token**: Adds `cancelToken` field to Reservation
4. **Many-to-Many Relationship**: Migrates from one-to-many to many-to-many for restaurant ownership

### Data Flow Example

**Creating a Reservation:**
```
1. User selects restaurant, date, time
2. Frontend → POST /reservations
3. Controller validates input
4. Use Case checks business rules
5. Repository creates Reservation record
6. Prisma executes: INSERT INTO Reservation ...
7. PostgreSQL persists data
8. Response returned with reservation data
```

**Querying Owner's Restaurants:**
```
1. Owner → GET /me/restaurants
2. Middleware verifies JWT
3. Controller calls Use Case
4. Repository queries: 
   Restaurant.findMany({
     where: { owners: { some: { id: userId } } }
   })
5. Prisma generates SQL with JOIN
6. PostgreSQL returns restaurants
7. Response formatted and returned
```

---

## 11. PR Creation Process

### Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/restaurant-settings
   ```

2. **Make Changes**
   - Write code following architecture patterns
   - Add tests for new functionality
   - Update documentation if needed

3. **Run Tests**
   ```bash
   cd server
   npm test
   ```

4. **Check Linting**
   ```bash
   npm run lint
   ```

5. **Create Migration** (if database changes)
   ```bash
   npx prisma migrate dev --name description
   ```

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add restaurant settings configuration"
   ```

7. **Push and Create PR**
   ```bash
   git push origin feature/restaurant-settings
   # Create PR on GitHub/GitLab
   ```

### PR Checklist

- [ ] Code follows project architecture patterns
- [ ] Tests written and passing
- [ ] No linting errors
- [ ] Database migrations created (if needed)
- [ ] Documentation updated (if needed)
- [ ] Manual testing completed
- [ ] PR description explains changes

### Code Review Focus Areas

1. **Architecture**: Does it follow Clean Architecture principles?
2. **Testing**: Are there adequate tests?
3. **Error Handling**: Are errors handled gracefully?
4. **Security**: Are there any security concerns?
5. **Performance**: Any performance issues?
6. **Type Safety**: Proper TypeScript usage?

---

## 12. The Biggest Challenges of the Project

### 12.1 Many-to-Many Restaurant Ownership

**Challenge**: Initially, the system used a one-to-many relationship (one user, one restaurant). When requirements changed to support multiple restaurants per owner, this required a significant schema migration.

**Solution**:
1. **Schema Update**: Changed from `User.restaurantId` to many-to-many relationship
   ```prisma
   // Before
   model User {
     restaurantId String?
   }
   
   // After
   model User {
     restaurants Restaurant[]
   }
   model Restaurant {
     owners User[]
   }
   ```

2. **Migration Strategy**: Created migration to:
   - Create implicit join table `_RestaurantToUser`
   - Migrate existing `restaurantId` data to join table
   - Remove `restaurantId` column

3. **Code Updates**:
   - Updated `CreateRestaurantUseCase` to use `owners: { connect: { id } }`
   - Updated `listOwnerRestaurants` to query via `owners` relationship
   - Updated `ensureOwner` middleware to check `owners` array
   - Created migration script to fix existing data

4. **Testing**: Updated all tests to work with new relationship structure

**Lessons Learned**:
- Plan for scalability from the start
- Many-to-many relationships are common in real-world applications
- Prisma's implicit join tables simplify many-to-many implementation

### 12.2 Reservation Time Validation

**Challenge**: Preventing reservations for past dates/times required careful date-time handling, especially considering timezones and edge cases (e.g., booking for today at a time that has already passed).

**Solution**:
1. **Backend Validation**: Created `isPastDateTime()` function
   ```typescript
   export function isPastDateTime(date: Date, time: string) {
     const now = new Date();
     // Check if date is in the past
     if (isPastDay(date)) return true;
     // If today, check if time has passed
     if (isToday(date)) {
       const reservationTime = combineDateAndTime(date, time);
       return reservationTime < now;
     }
     return false;
   }
   ```

2. **Frontend Validation**: Added client-side checks:
   - `min` attribute on date input (prevents past dates)
   - Dynamic `min` attribute on time input (if today, prevents past times)
   - Pre-submission validation check

3. **UTC Handling**: Used UTC for all date comparisons to avoid timezone issues

**Lessons Learned**:
- Date/time validation is complex and requires careful testing
- Client-side validation improves UX but backend validation is essential
- UTC is crucial for consistent date comparisons

### 12.3 Restaurant Settings and Business Rules

**Challenge**: Restaurant settings needed to support complex business rules:
- Time slots with capacity limits
- Weekly closure rules (e.g., "closed every Monday")
- Time-specific closures (e.g., "closed Monday lunch 12:00-15:00")
- Special date closures (e.g., "closed Dec 25 evening")

**Solution**:
1. **Flexible Schema**: Used JSON field for settings to allow flexible structure
   ```typescript
   interface RestaurantSettings {
     slots?: Array<{
       from: string;
       to: string;
       maxReservations: number;
     }>;
     closedWeekly?: Array<{
       weekday: number; // 0-6
       from?: string;
       to?: string;
     }>;
     closedDates?: Array<{
       date: string; // YYYY-MM-DD
       from?: string;
       to?: string;
     }>;
   }
   ```

2. **Validation Logic**: Created `isClosedAt()` function to check all closure rules
   ```typescript
   export function isClosedAt(settings, date, time): boolean {
     // Check special dates
     // Check weekly rules
     // Check time ranges
   }
   ```

3. **User-Friendly Preview**: Frontend shows human-readable previews:
   - "Closed every Monday lunch"
   - "Closed 25 Dec (evening)"

**Lessons Learned**:
- JSON fields provide flexibility but require careful validation
- Complex business rules need well-tested utility functions
- User experience matters: show rules in human-readable format

### 12.4 Testing with In-Memory Repositories

**Challenge**: Writing unit tests that don't require a database connection, while maintaining the same interface as production code.

**Solution**:
1. **Repository Pattern**: Created interface that both Prisma and in-memory implementations follow
   ```typescript
   interface RestaurantsRepository {
     findById(id: string): Promise<Restaurant | null>;
     create(data: RestaurantCreateInput): Promise<Restaurant>;
     // ...
   }
   ```

2. **In-Memory Implementation**: Created test repositories using arrays
   ```typescript
   class InMemoryRestaurantsRepository {
     public items: Restaurant[] = [];
     
     async findById(id: string) {
       return this.items.find(r => r.id === id) ?? null;
     }
     // ...
   }
   ```

3. **Dependency Injection**: Use cases receive repositories as constructor parameters
   ```typescript
   class CreateRestaurantUseCase {
     constructor(
       private restaurantsRepo: RestaurantsRepository,
       private usersRepo: UsersRepository
     ) {}
   }
   ```

4. **Test Setup**: Tests create in-memory repositories and inject them
   ```typescript
   const restaurantsRepo = new InMemoryRestaurantsRepository();
   const usersRepo = new InMemoryUsersRepository();
   const sut = new CreateRestaurantUseCase(restaurantsRepo, usersRepo);
   ```

**Lessons Learned**:
- Repository pattern enables easy testing
- In-memory implementations must match production behavior
- Dependency injection makes code testable and flexible

### Additional Challenges

**Email Configuration**: Setting up Nodemailer for development and production environments required careful configuration of SMTP settings and fallback mechanisms.

**CORS Configuration**: Ensuring proper CORS setup to allow frontend-backend communication while maintaining security.

**Type Safety**: Maintaining full TypeScript type safety across the stack, especially with Prisma-generated types and API responses.

---

## 13. Conclusion

EasyDine represents a comprehensive full-stack web application that demonstrates modern software development practices. The project successfully implements:

### Technical Achievements

1. **Clean Architecture**: Clear separation of concerns with controllers, use cases, and repositories
2. **Type Safety**: Full TypeScript implementation across frontend and backend
3. **Testability**: Comprehensive test suite using in-memory repositories
4. **Scalability**: Many-to-many relationships support multi-restaurant ownership
5. **Security**: JWT authentication, password hashing, input validation
6. **User Experience**: Intuitive interfaces for both customers and restaurant owners

### Key Learnings

- **Database Design**: Understanding when to use one-to-many vs. many-to-many relationships
- **Date/Time Handling**: The complexity of timezone-aware date operations
- **Business Logic**: Implementing complex business rules (restaurant closures, capacity management)
- **Testing**: Writing maintainable tests using dependency injection and repository pattern
- **API Design**: Creating RESTful APIs with proper error handling and validation

### Future Enhancements

Potential improvements for future iterations:

1. **Real-time Updates**: WebSocket integration for live reservation updates
2. **Payment Integration**: Stripe/PayPal integration for reservation deposits
3. **SMS Notifications**: Twilio integration for SMS confirmations
4. **Analytics Dashboard**: Restaurant performance metrics and reports
5. **Customer Accounts**: User accounts for customers to view booking history
6. **Waitlist System**: Queue system for fully booked time slots
7. **Multi-language Support**: Internationalization for global reach
8. **Mobile App**: React Native application for mobile users

### Project Impact

EasyDine serves as a practical demonstration of:
- Full-stack TypeScript development
- Modern web frameworks (Next.js, Fastify)
- Database design and ORM usage (Prisma)
- Authentication and authorization
- Testing strategies
- Clean code principles

The project provides a solid foundation for understanding enterprise-level application development and can serve as a portfolio piece demonstrating proficiency in modern web development technologies and best practices.

---

**Project Status**: ✅ Complete and Functional

**Technologies Mastered**: TypeScript, Node.js, Fastify, Next.js, Prisma, PostgreSQL, JWT, Testing, Docker

**Architecture Pattern**: Clean Architecture with Repository Pattern

**Total Development Time**: [Your estimate]

**Lines of Code**: [Approximate count]

---

*This document serves as comprehensive documentation for the EasyDine restaurant reservation management system, suitable for academic submission and technical reference.*

