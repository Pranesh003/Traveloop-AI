<div align="center">

# ✈️ Traveloop AI

### *Your Intelligent Personal Travel Agent — Powered by Google Gemini*

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br />

> **Traveloop AI** is a full-stack, AI-powered travel planning platform that leverages Google Gemini to generate complete trip itineraries, packing lists, budget breakdowns, and real-time travel chat — all within a stunning glassmorphic dark UI.

<br />

![Traveloop AI Banner](https://via.placeholder.com/1200x400/0f0f1a/6d28d9?text=Traveloop+AI+%E2%9C%88%EF%B8%8F+Your+Personal+AI+Travel+Agent)

</div>

---

## 📑 Table of Contents

1. [✨ Features](#-features)
2. [🏗️ System Architecture](#-system-architecture)
3. [🔄 Data Flow Diagrams](#-data-flow-diagrams)
4. [📁 Project Structure](#-project-structure)
5. [🚀 Quick Start](#-quick-start)
6. [🔧 Environment Setup](#-environment-setup)
7. [🌐 API Reference](#-api-reference)
8. [🛡️ Role & Permission System](#-role--permission-system)
9. [🤖 AI Features Deep Dive](#-ai-features-deep-dive)
10. [🎨 UI Design System](#-ui-design-system)
11. [🗺️ Page Routes](#-page-routes)
12. [🔮 Roadmap](#-roadmap)
13. [🤝 Contributing](#-contributing)

---

## ✨ Features

### 🤖 AI-Powered Planning
| Feature | Description |
|---|---|
| **Location-Aware AI Planner** | Automatically detects user location using browser geolocation APIs (with reverse-geocoding city fallback) to calculate realistic starting points, distances, and budgets (e.g. Coimbatore to Ooty budget tuning) |
| **AI Trip Planner** | Describe any trip in plain English → get a full day-by-day itinerary with hotels, meals, and costs |
| **AI Chat Agent** | Conversational travel assistant powered by Gemini 2.5 Flash |
| **Smart Packing Lists** | AI-generated checklists tailored to destination, weather, and travel style |
| **Budget Predictor** | Intelligent cost estimation broken down by flights, hotels, food, activities |
| **Destination Discovery** | AI recommends 6+ destinations based on your query and preferences |
| **Route Optimizer** | AI orders multi-stop trips for minimum travel time and cost |

### 🗺️ Trip Management
- **Create Trips** — Multi-step wizard (Basics → Destinations → Preferences)
- **My Trips Dashboard** — Visual cards with progress tracking, status badges, and filters
- **Itinerary Builder** — Drag-and-drop day planner with activities, maps, and timeline view
- **Trip Details** — Comprehensive view with budget spending, weather, and packing
- **Travel Journal** — Rich text notes and memories for each trip
- **Calendar View** — Monthly visual overview of all planned travel

### 🛠️ Admin Platform (Role-Gated)
| Module | Admin | Super Admin |
|---|---|---|
| User Management | View | Full CRUD + Role Changes |
| Destinations | Full CRUD | Full CRUD |
| Activities | Full CRUD | Full CRUD |
| Travel Packages | Full CRUD | Full CRUD |
| Plans/Subscriptions | Full CRUD | Full CRUD |
| Community Moderation | Full CRUD | Full CRUD |
| Support Tickets | View + Resolve | Full Control |
| Broadcast Notifications | Send | Send |
| Analytics Dashboard | View | View |
| AI Configuration | — | Full Control |
| Platform Settings | — | Full Control |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          TRAVELOOP AI — SYSTEM OVERVIEW             │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────┐     ┌───────────────────────────────┐
  │         FRONTEND (React + Vite)  │     │     BACKEND (Node.js/Express) │
  │          localhost:5173          │     │        localhost:5000         │
  │                                  │     │                               │
  │  ┌────────────┐  ┌─────────────┐│     │  ┌──────────────────────────┐ │
  │  │  React 19  │  │ React Router││     │  │   Express API Routes     │ │
  │  │  Components│  │ (SPA Routes)││     │  │  Destinations, Users,    │ │
  │  └────────────┘  └─────────────┘│     │  │  Activities, Packages,  │ │
  │                                  │     │  │  Plans, Reports,        │ │
  │  ┌────────────┐  ┌─────────────┐│     │  │  Tickets, Broadcasts    │ │
  │  │ AuthContext│  │ Permission  ││     │  └──────────────────────────┘ │
  │  │ (JWT/Local)│  │ Guard System││     │              │                 │
  │  └────────────┘  └─────────────┘│     │  ┌──────────────────────────┐ │
  │                                  │     │  │      Prisma ORM          │ │
  │  ┌─────────────────────────────┐│     │  └──────────────────────────┘ │
  │  │         AI Services         ││     │              │                 │
  │  │  aiService.js               ││     │  ┌──────────────────────────┐ │
  │  │  ├── generateTripPlan()     ││     │  │    PostgreSQL Database   │ │
  │  │  ├── chatWithAI()           ││     │  └──────────────────────────┘ │
  │  │  ├── generatePackingList()  ││     └───────────────────────────────┘
  │  │  ├── discoverDestinations() ││     
  │  │  ├── predictBudget()        ││     ┌───────────────────────────────┐
  │  │  └── optimizeRoute()        ││     │    EXTERNAL SERVICES          │
  │  └─────────────────────────────┘│     │                               │
  │                                  │     │  Google Gemini 2.5 Flash API  │
  │  ┌─────────────────────────────┐│────▶│  OpenWeatherMap API            │
  │  │     apiService.js           ││     └───────────────────────────────┘
  │  │  CRUD Factory for all       ││
  │  │  backend modules            ││
  │  └─────────────────────────────┘│
  └──────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. AI Trip Generation Flow

```
User Input ──────────────────────────────────────────────────────────────
    │
    ▼
┌───────────────────────┐
│  AiPlanner.jsx        │  User types: "7-day Japan trip for ₹1.5L"
│  (Trip Prompt Form)   │
└──────────┬────────────┘
           │ generateTripPlan(prompt)
           ▼
┌───────────────────────┐
│   aiService.js        │  Builds structured Gemini prompt with
│   callGemini()        │  JSON schema for itinerary format
└──────────┬────────────┘
           │ HTTP POST
           ▼
┌───────────────────────┐
│  Google Gemini API    │  gemini-2.5-flash model
│  (External Service)   │  Returns JSON itinerary
└──────────┬────────────┘
           │ JSON Response
           ▼
┌───────────────────────┐
│  safeParseJSON()      │  Parse & validate response
│  (Fallback to Mock)   │  Falls back to smart mock data if API fails
└──────────┬────────────┘
           │ Structured Trip Object
           ▼
┌───────────────────────┐
│  AiPlanner.jsx        │  Renders: Itinerary tabs, Budget pie chart,
│  (Results Display)    │  Packing list, Map view, Export button
└──────────┬────────────┘
           │ User clicks "Save Trip"
           ▼
┌───────────────────────┐
│  localStorage         │  Saved as tl_ai_trips[]
│  + MyTrips.jsx        │  Appears in My Trips dashboard
└───────────────────────┘
```

### 2. Admin Role-Based Access Flow

```
User Navigates to Admin URL
         │
         ▼
┌─────────────────────────────┐
│   ProtectedRoute (App.jsx)  │
│   Checks: useAuth() hook    │
└────────────┬────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
 user === null   user exists
    │                 │
    ▼                 ▼
 /login        hasPermission(requiredPermission)?
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
   No                   Yes
    │                     │
    ▼                     ▼
/dashboard          Render Admin Page
  (redirect)              │
                          ▼
              ┌───────────────────────┐
              │ Role-Based UI Render: │
              │                       │
              │ SUPER_ADMIN:          │
              │  ├─ All CRUD          │
              │  ├─ Role editing      │
              │  └─ Settings          │
              │                       │
              │ ADMIN:                │
              │  ├─ View/Edit         │
              │  └─ No role changes   │
              │                       │
              │ USER:                 │
              │  └─ (redirected)      │
              └───────────────────────┘
```

### 3. Backend REST API Flow

```
React Frontend                Node.js/Express Backend        PostgreSQL Database
     │                               │                              │
     │  GET /api/destinations        │                              │
     │──────────────────────────────▶│                              │
     │                               │  SELECT * FROM destinations  │
     │                               │─────────────────────────────▶│
     │                               │  Result set                  │
     │                               │◀─────────────────────────────│
     │  JSON Array Response          │                              │
     │◀──────────────────────────────│                              │
     │                               │                              │
     │  POST /api/destinations       │                              │
     │  Body: {city, country, ...}   │                              │
     │──────────────────────────────▶│                              │
     │                               │  INSERT INTO destinations    │
     │                               │─────────────────────────────▶│
     │                               │  Generated ID                │
     │                               │◀─────────────────────────────│
     │  JSON: Created Object         │                              │
     │◀──────────────────────────────│                              │
     │                               │                              │
     │  PUT /api/destinations/{id}   │                              │
     │──────────────────────────────▶│                              │
     │                               │  UPDATE destinations SET ... │
     │                               │─────────────────────────────▶│
     │  JSON: Updated Object         │                              │
     │◀──────────────────────────────│                              │
     │                               │                              │
     │  DELETE /api/destinations/{id}│                              │
     │──────────────────────────────▶│                              │
     │                               │  DELETE FROM destinations    │
     │                               │─────────────────────────────▶│
     │  204 No Content               │                              │
     │◀──────────────────────────────│                              │
```

### 4. Authentication Flow

```
                    ┌──────────────────────────────────────────────────┐
                    │             Login.jsx (Login Page)                │
                    │  Email + Password Form                            │
                    └──────────────────────┬───────────────────────────┘
                                           │ handleLogin()
                                           ▼
                    ┌──────────────────────────────────────────────────┐
                    │             AuthContext.jsx                       │
                    │  Validates against users array                    │
                    │  Assigns role: super_admin | admin | user         │
                    └──────────────────────┬───────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────────┐
                    │             Permission Matrix                     │
                    │                                                   │
                    │  Role: SUPER_ADMIN (pranesh@traveloop.ai)        │
                    │  ─────────────────────────────────               │
                    │  ✓ MANAGE_PLATFORM     ✓ MANAGE_AI               │
                    │  ✓ MANAGE_USERS        ✓ MANAGE_SUBSCRIPTIONS    │
                    │  ✓ MANAGE_DESTINATIONS ✓ VIEW_ANALYTICS          │
                    │  ✓ MANAGE_PACKAGES     ✓ MANAGE_SUPPORT          │
                    │                                                   │
                    │  Role: ADMIN                                      │
                    │  ─────────────────                                │
                    │  ✓ MANAGE_DESTINATIONS ✓ MODERATE_COMMUNITY      │
                    │  ✓ MANAGE_ACTIVITIES   ✓ MANAGE_SUPPORT          │
                    │  ✓ MANAGE_PACKAGES     ✓ VIEW_ANALYTICS          │
                    │                                                   │
                    │  Role: USER                                       │
                    │  ─────────────                                    │
                    │  ✓ All user-facing pages only                     │
                    └──────────────────────────────────────────────────┘
                                           │ User object stored in
                                           │ localStorage + React Context
                                           ▼
                    ┌──────────────────────────────────────────────────┐
                    │  Protected route guards enforce role at each URL  │
                    └──────────────────────────────────────────────────┘
```

### 5. Complete User Journey

```
LANDING PAGE (/)
      │
      ▼
    LOGIN (/login)
      │
      ├──[User Role]──────────────────────────────────────────────────────────┐
      │                                                                        │
      ▼ DASHBOARD (/dashboard)                                                 │
      │   ├─ Weather widget (OpenWeatherMap)                                   │
      │   ├─ AI Prompt bar → /ai-planner                                      │
      │   ├─ Recent trips grid                                                 │
      │   └─ Travel inspiration from Backend DB                               │
      │                                                                        │
      ├─── AI PLANNER (/ai-planner)                                           │
      │     ├─ Text prompt input                                               │
      │     ├─ Gemini API call → JSON itinerary                               │
      │     ├─ Day-by-day accordion view                                       │
      │     ├─ Budget breakdown chart                                          │
      │     ├─ Smart packing list                                              │
      │     └─ Save → localStorage (appears in My Trips)                      │
      │                                                                        │
      ├─── MY TRIPS (/my-trips)                                               │
      │     ├─ All trips grid (AI + manual + demo)                            │
      │     ├─ Filter: All / Upcoming / Completed / Planning                  │
      │     └─ Click → Itinerary Builder (/builder/:id)                      │
      │                                                                        │
      ├─── CREATE TRIP (/create-trip)                                         │
      │     ├─ Step 1: Basics (title, dates, budget)                         │
      │     ├─ Step 2: Destinations (multi-city)                             │
      │     └─ Step 3: Preferences (style, companions)                       │
      │                                                                        │
      ├─── EXPLORE (/explore)                                                 │
      │     ├─ Live destinations from Spring Boot API                         │
      │     ├─ Category filters                                               │
      │     └─ AI Destination Discovery                                       │
      │                                                                        │
      ├─── AI CHAT (/ai-chat)                                                 │
      │     └─ Real-time Gemini conversation                                  │
      │                                                                        │
      ├─── CALENDAR (/calendar)                                               │
      │     └─ Monthly trip overview                                          │
      │                                                                        │
      └─── PROFILE (/profile)                                                 │
                                                                              │
      ├──[Admin Role]──────────────────────────────────────────────────────────┤
      │                                                                        │
      └─── ADMIN PANEL (/admin)                                               │
            ├─ Analytics Dashboard                                            │
            ├─ User Management (/admin/users)                                │
            ├─ Destinations (/admin/destinations)                            │
            ├─ Activities (/admin/activities)                                │
            ├─ Packages (/admin/packages)                                    │
            ├─ Subscriptions (/admin/subscriptions)                         │
            ├─ Community Moderation (/admin/community)                      │
            ├─ Support Tickets (/admin/support)                             │
            ├─ Broadcast Notifications (/admin/notifications)               │
            ├─ AI Configuration (/admin/ai) [Super Admin only]              │
            └─ Platform Settings (/admin/super) [Super Admin only]          │
                                                                              │
      ├──[Super Admin Role]────────────────────────────────────────────────────┘
            Inherits ALL admin permissions + platform-level controls
```

---

## 📁 Project Structure

```
traveloop-2.0/
│
├── 📄 .env.example              # Template for environment variables
├── 📄 .gitignore
├── 📄 package.json              # Frontend dependencies (React, Vite, Recharts)
├── 📄 vite.config.js
├── 📄 index.html
│
├── 📁 src/                      # ─── FRONTEND ───────────────────────────────
│   ├── 📄 main.jsx              # React entry point
│   ├── 📄 App.jsx               # Router + Protected routes
│   ├── 📄 index.css             # Global design system (CSS variables, animations)
│   │
│   ├── 📁 context/
│   │   └── 📄 AuthContext.jsx   # Global auth state, role logic, permission helpers
│   │
│   ├── 📁 constants/
│   │   └── 📄 permissions.js    # ROLES enum + PERMISSIONS map + ROLE_PERMISSIONS matrix
│   │
│   ├── 📁 components/
│   │   ├── 📄 SidebarLayout.jsx # Main app shell (sidebar nav + content area)
│   │   └── 📄 SidebarLayout.css
│   │
│   ├── 📁 services/
│   │   ├── 📄 aiService.js      # All Gemini AI integrations (6 functions)
│   │   ├── 📄 apiService.js     # REST API factory for all backend modules
│   │   ├── 📄 weatherService.js # OpenWeatherMap integration
│   │   └── 📄 mockDatabase.js   # Local fallback data (legacy)
│   │
│   └── 📁 pages/               # All page-level React components
│       ├── 📄 Landing.jsx       # Public landing page
│       ├── 📄 Login.jsx         # Authentication page
│       ├── 📄 Dashboard.jsx     # Main user dashboard
│       ├── 📄 AiPlanner.jsx     # AI trip generation engine ⭐
│       ├── 📄 AiChat.jsx        # Conversational AI travel agent
│       ├── 📄 MyTrips.jsx       # Trip library with filters
│       ├── 📄 CreateTrip.jsx    # Multi-step trip creation wizard
│       ├── 📄 TripDetails.jsx   # Full trip overview
│       ├── 📄 ItineraryBuilder.jsx # Day-by-day planner
│       ├── 📄 Budget.jsx        # Budget tracking + charts
│       ├── 📄 PackingChecklist.jsx # AI packing assistant
│       ├── 📄 Explore.jsx       # Destination discovery
│       ├── 📄 Journal.jsx       # Trip diary/notes
│       ├── 📄 Calendar.jsx      # Travel calendar
│       ├── 📄 Profile.jsx       # User profile settings
│       │
│       └── 📁 admin/           # Admin-only modules
│           ├── 📄 AdminDashboard.jsx    # Analytics overview
│           ├── 📄 UserManagement.jsx    # User CRUD + role assignment
│           ├── 📄 Destinations.jsx      # Destination management
│           ├── 📄 Activities.jsx        # Activity management
│           ├── 📄 Packages.jsx          # Travel packages CRUD
│           ├── 📄 Subscriptions.jsx     # Subscription plans CRUD
│           ├── 📄 CommunityModeration.jsx # Reports management
│           ├── 📄 Support.jsx           # Support ticket management
│           ├── 📄 Notifications.jsx     # Broadcast system
│           ├── 📄 Analytics.jsx         # Analytics charts
│           ├── 📄 AiManagement.jsx      # AI model config
│           └── 📄 SuperAdminSettings.jsx # Platform settings
│
└── 📁 backend/                  # ─── BACKEND (Spring Boot) ──────────────────
    ├── 📄 pom.xml               # Maven build config + dependencies
    ├── 📄 mvnw / mvnw.cmd       # Maven wrapper scripts
    │
    └── 📁 src/main/
        ├── 📁 resources/
        │   └── 📄 application.properties  # DB config, server port, JPA settings
        │
        └── 📁 java/com/traveloop/backend/
            ├── 📄 TraveloopBackendApplication.java  # Spring Boot main class
            │
            ├── 📁 config/
            │   └── 📄 CorsConfig.java     # CORS allow-list for frontend origin
            │
            ├── 📁 entity/               # JPA Database Models
            │   ├── 📄 User.java          # id, name, email, role, status, joinDate
            │   ├── 📄 Destination.java   # id, country, city, status, safety
            │   ├── 📄 Activity.java      # id, name, type, location, price, status
            │   ├── 📄 Package.java       # id, name, destination, price, duration, status
            │   ├── 📄 Plan.java          # id, name, price, billing, features, status
            │   ├── 📄 Report.java        # id, user, content, type, status
            │   ├── 📄 Ticket.java        # id, subject, user, priority, status
            │   └── 📄 Broadcast.java     # id, title, body, target, channels, date
            │
            ├── 📁 repository/           # Spring Data JPA Repositories
            │   └── ...Repository.java    # (one per entity, auto-CRUD)
            │
            └── 📁 controller/           # REST API Controllers
                ├── 📄 UserController.java        # GET/POST/PUT/DELETE /api/users
                ├── 📄 DestinationController.java  # GET/POST/PUT/DELETE /api/destinations
                ├── 📄 ActivityController.java     # GET/POST/PUT/DELETE /api/activities
                ├── 📄 PackageController.java      # GET/POST/PUT/DELETE /api/packages
                ├── 📄 PlanController.java         # GET/POST/PUT/DELETE /api/plans
                ├── 📄 ReportController.java       # GET/POST/PUT/DELETE /api/reports
                ├── 📄 TicketController.java       # GET/POST/PUT/DELETE /api/tickets
                └── 📄 BroadcastController.java    # GET/POST/PUT/DELETE /api/broadcasts
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

### 1. Clone the Repository

```bash
git clone https://github.com/Pranesh003/Traveloop-AI.git
cd Traveloop-AI
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your API keys
VITE_GEMINI_API_KEY=your_google_gemini_api_key
VITE_OPENWEATHER_KEY=your_openweathermap_key
VITE_API_BASE=http://localhost:8080
```

### 3. Start the Backend (Node.js/Express)

```bash
cd server
npm install
npx prisma generate
npm run dev
```

> ✅ Backend starts at **http://localhost:5000**

### 4. Start the Frontend (Vite + React)

```bash
# From the project root
npm install
npm run dev
```

> ✅ Frontend starts at **http://localhost:5173**

### 5. Log In

| Role | Email | Password |
|---|---|---|
| **Super Admin** | `pranesh@traveloop.ai` | `super123` |
| **Admin** | `admin@traveloop.ai` | `admin123` |
| **User** | `user@traveloop.ai` | `user123` |

---

## 🔧 Environment Setup

### Getting API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the key and paste into your `.env` as `VITE_GEMINI_API_KEY`

#### OpenWeatherMap API Key
1. Register at [openweathermap.org](https://openweathermap.org/api)
2. Go to **API Keys** in your account
3. Copy the default key into `.env` as `VITE_OPENWEATHER_KEY`

### Backend Configuration (`application.properties`)

```properties
spring.application.name=TraveloopBackend
server.port=8080

# H2 File-based Database (persists data locally)
spring.datasource.url=jdbc:h2:file:./data/traveloop
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# Auto-create/update tables on startup
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# H2 Web Console for debugging
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
```

---

## 🌐 API Reference

### Base URL: `http://localhost:5000/api`

All endpoints follow RESTful conventions with JSON request/response bodies.

#### Destinations

```
GET    /api/destinations          → List all destinations
POST   /api/destinations          → Create new destination
GET    /api/destinations/{id}     → Get single destination
PUT    /api/destinations/{id}     → Update destination
DELETE /api/destinations/{id}     → Delete destination
```

**Destination Object:**
```json
{
  "id": 1,
  "city": "Bali",
  "country": "Indonesia",
  "status": "Active",
  "safety": "High"
}
```

#### Users

```
GET    /api/users                 → List all users
POST   /api/users                 → Create user
GET    /api/users/{id}            → Get single user
PUT    /api/users/{id}            → Update user (incl. role change)
DELETE /api/users/{id}            → Delete user
```

#### Activities

```
GET    /api/activities
POST   /api/activities
GET    /api/activities/{id}
PUT    /api/activities/{id}
DELETE /api/activities/{id}
```

**Activity Object:**
```json
{
  "id": 1,
  "name": "Bungee Jumping",
  "type": "Adventure",
  "location": "Rishikesh",
  "price": 2500,
  "status": "Active"
}
```

#### Support Tickets

```
GET    /api/tickets               → All tickets (Admin view)
POST   /api/tickets               → Create ticket (user-facing)
GET    /api/tickets/{id}
PUT    /api/tickets/{id}          → Update status (Resolved, In Progress)
DELETE /api/tickets/{id}
```

#### Broadcasts (Notifications)

```
GET    /api/broadcasts            → Message history
POST   /api/broadcasts            → Send new broadcast
GET    /api/broadcasts/{id}
PUT    /api/broadcasts/{id}
DELETE /api/broadcasts/{id}
```

> All remaining modules (`/api/packages`, `/api/plans`, `/api/reports`) follow identical CRUD patterns.

---

## 🛡️ Role & Permission System

```
Permission Matrix
──────────────────────────────────────────────────────────────────
Permission                  SUPER_ADMIN    ADMIN    USER
──────────────────────────────────────────────────────────────────
MANAGE_PLATFORM             ✅             ❌       ❌
MANAGE_AI                   ✅             ❌       ❌
MANAGE_USERS                ✅             ❌       ❌
MANAGE_DESTINATIONS         ✅             ✅       ❌
MANAGE_ACTIVITIES           ✅             ✅       ❌
MANAGE_PACKAGES             ✅             ✅       ❌
MANAGE_SUBSCRIPTIONS        ✅             ❌       ❌
MODERATE_COMMUNITY          ✅             ✅       ❌
MANAGE_SUPPORT              ✅             ✅       ❌
VIEW_ANALYTICS              ✅             ✅       ❌
──────────────────────────────────────────────────────────────────
```

The permission system is enforced in three layers:
1. **Route level** — `ProtectedRoute` component in `App.jsx` redirects unauthorized users.
2. **Subscription & Plan Gating** — Premium features (such as the AI Planner, AI Chat, and Explore Destination updates) are strictly hidden or restricted for basic users.
3. **UI level** — Admin components conditionally show/hide actions based on `isSuperAdmin` flag, and admin accounts operate strictly within admin views to prevent interface contamination.

### 🔌 Live DB Empty Fallback Resiliency
To ensure a seamless experience even when database tables are unseeded or empty, the CRUD client factory automatically merges active database records with offline mock database elements. This prevents empty lists, visual card drops, and dashboard errors for analytics metrics.


---

## 🤖 AI Features Deep Dive

### AI Service Functions (`aiService.js`)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        aiService.js Functions                        │
├──────────────────────────┬──────────────────────────────────────────┤
│  Function                │  Description                              │
├──────────────────────────┼──────────────────────────────────────────┤
│  generateTripPlan()      │  Full itinerary: days, hotels, costs,    │
│                          │  weather, packing list, local tips        │
├──────────────────────────┼──────────────────────────────────────────┤
│  chatWithAI()            │  Conversational agent with travel         │
│                          │  expertise and conversation history       │
├──────────────────────────┼──────────────────────────────────────────┤
│  generatePackingList()   │  Smart packing by destination,            │
│                          │  duration, weather, travel style          │
├──────────────────────────┼──────────────────────────────────────────┤
│  discoverDestinations()  │  AI recommends 6 destinations             │
│                          │  matching user's query/mood               │
├──────────────────────────┼──────────────────────────────────────────┤
│  predictBudget()         │  Detailed cost breakdown by category      │
│                          │  (flights, hotels, food, activities)      │
├──────────────────────────┼──────────────────────────────────────────┤
│  optimizeRoute()         │  Reorders multi-city stops for            │
│                          │  minimum travel time & cost               │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Fallback Strategy

All AI functions implement a two-tier fallback:

```
1. Try Gemini API call
      ↓ Success → Use AI response
      ↓ Failure (no key / timeout / rate limit)
2. Smart mock data fallback
      → Dynamically generated based on keywords in user's prompt
      → No error shown to user — experience is seamless
```

### AI Model Configuration (Admin Controllable)

Super Admins can change the AI model at runtime via `/admin/ai`:
- `gemini-2.5-flash` — Fast, cost-effective (default)
- `gemini-2.5-pro` — Advanced reasoning, higher quality

Config is stored in `localStorage` as `tl_ai_config` and read by `aiService.js` on every call.

---

## 🎨 UI Design System

### Design Philosophy
Traveloop AI uses a **Glassmorphic Dark Design System** with:
- **Base Colors**: Deep navy (`#0a0a12`) background with purple/cyan accent gradients
- **Glass Cards**: `backdrop-filter: blur()` + semi-transparent borders
- **Typography**: `Space Grotesk` (display) + `Inter` (body) from Google Fonts
- **Animations**: CSS `animate-fade-in` stagger effects, hover transitions

### CSS Variables

```css
:root {
  --bg-primary:    #0a0a12;   /* Main background */
  --bg-secondary:  #0f0f1e;   /* Card backgrounds */
  --violet:        #7c3aed;   /* Primary accent */
  --cyan:          #06b6d4;   /* Secondary accent */
  --emerald:       #10b981;   /* Success states */
  --orange:        #f97316;   /* Warning states */

  --gradient-violet: linear-gradient(135deg, #6d28d9, #7c3aed);
  --font-display:    'Space Grotesk', sans-serif;
  --font-body:       'Inter', sans-serif;
}
```

### Component Classes

| Class | Usage |
|---|---|
| `.glass-card` | Standard frosted glass panel |
| `.gradient-card` | Gradient-bordered card with glow |
| `.btn-primary` | Violet gradient button |
| `.btn-secondary` | Ghost/outline button |
| `.badge-violet` | Status badge (purple) |
| `.badge-emerald` | Status badge (green) |
| `.animate-fade-in` | Slide-up fade animation |
| `.text-gradient` | Violet→cyan gradient text |

---

## 🗺️ Page Routes

| Route | Component | Auth Required | Min Role |
|---|---|---|---|
| `/` | Landing | ❌ | — |
| `/login` | Login | ❌ | — |
| `/dashboard` | Dashboard | ✅ | User |
| `/ai-planner` | AiPlanner | ✅ | User |
| `/my-trips` | MyTrips | ✅ | User |
| `/create-trip` | CreateTrip | ✅ | User |
| `/trip/:id` | TripDetails | ✅ | User |
| `/builder/:id` | ItineraryBuilder | ✅ | User |
| `/budget/:id` | Budget | ✅ | User |
| `/checklist/:id` | PackingChecklist | ✅ | User |
| `/explore` | Explore | ✅ | User |
| `/ai-chat` | AiChat | ✅ | User |
| `/journal/:id` | Journal | ✅ | User |
| `/calendar` | Calendar | ✅ | User |
| `/profile` | Profile | ✅ | User |
| `/admin` | AdminDashboard | ✅ | Admin |
| `/admin/users` | UserManagement | ✅ | Admin |
| `/admin/destinations` | Destinations | ✅ | Admin |
| `/admin/activities` | Activities | ✅ | Admin |
| `/admin/packages` | Packages | ✅ | Admin |
| `/admin/subscriptions` | Subscriptions | ✅ | Admin |
| `/admin/community` | CommunityModeration | ✅ | Admin |
| `/admin/support` | Support | ✅ | Admin |
| `/admin/notifications` | Notifications | ✅ | Admin |
| `/admin/analytics` | Analytics | ✅ | Admin |
| `/admin/ai` | AiManagement | ✅ | **Super Admin** |
| `/admin/super` | SuperAdminSettings | ✅ | **Super Admin** |

---

## 🔮 Roadmap

### Immediate Next Steps
- [ ] **MongoDB Migration** — Replace H2 with MongoDB Atlas for cloud-native persistence
- [ ] **Real Authentication** — JWT-based login with Spring Security
- [ ] **User Registration** — Full sign-up flow with email verification

### Short-Term (v2.1)
- [ ] **Flight Search Integration** — Real-time prices via Amadeus or Skyscanner API
- [ ] **Hotel Booking** — Connect to hotel APIs (Booking.com / Agoda)
- [ ] **Map Integration** — Google Maps or Mapbox for visual trip routes
- [ ] **PDF Export** — Download full itinerary as a formatted PDF
- [ ] **Social Sharing** — Public trip pages with unique shareable URLs

### Long-Term (v3.0 — TravelOS)
- [ ] **B2B Agency Portal** — White-label admin dashboard for travel agencies
- [ ] **Multi-language Support** — i18n for Hindi, Spanish, French
- [ ] **Mobile App** — React Native companion app
- [ ] **Collaborative Trips** — Real-time multi-user trip planning
- [ ] **AI Voice Planner** — Gemini Live voice-based trip generation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Use functional React components with hooks
- Follow the existing glassmorphic design system (don't add inline styles for colors)
- Backend controllers must include CORS headers via the existing `CorsConfig`
- All new AI features must implement the two-tier fallback pattern

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by [Pranesh](https://github.com/Pranesh003)**

*Powered by Google Gemini AI · React · Spring Boot*

⭐ **Star this repo if you found it useful!** ⭐

</div>
