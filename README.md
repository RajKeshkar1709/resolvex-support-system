# ResolveX — Enterprise Support Ticket Management System

ResolveX is a production-grade, secure, full-stack Support Ticket Management System built with the **MERN Stack (MongoDB, Express.js, React, Node.js)**. It features strict role-based access control (RBAC), an event-driven decoupled architecture using Node.js `EventEmitter`, real-time audit logging, interactive Swagger API documentation, and a modern Tailwind CSS dashboard with dark/light mode.

---

## 🚀 Live Deployments & Credentials

| Resource | Live URL | Description |
|---|---|---|
| **🌐 Production Web App (Frontend)** | [https://resolvex-support-system.vercel.app](https://resolvex-support-system.vercel.app) | Live React 18 SPA hosted on Vercel |
| **⚡ Live API Server & Swagger Docs** | [https://resolvex-support-system.onrender.com/api-docs](https://resolvex-support-system.onrender.com/api-docs) | Interactive OpenAPI 3.0 Documentation hosted on Render |
| **📦 GitHub Repository** | [https://github.com/RajKeshkar1709/resolvex-support-system](https://github.com/RajKeshkar1709/resolvex-support-system) | Source code repository |

### 🔑 Pre-Seeded Evaluation Credentials:

Reviewers and evaluators can log in immediately with the pre-seeded Enterprise Administrator account:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Admin** | `admin@resolvex.com` | `Admin@123456` | Manage all tickets, transition status, escalate priority, assign support agents, view SLA analytics & global audit logs. |

*Note: New customer accounts can also be created dynamically via the web app registration page (`/register`).*

---

## ⚡ Interactive API Documentation (Swagger)

ResolveX includes built-in interactive **Swagger OpenAPI 3.0 Documentation**. You do not need to import Postman collections.

* **Live Cloud Swagger UI:** [https://resolvex-support-system.onrender.com/api-docs](https://resolvex-support-system.onrender.com/api-docs)
* **Local Swagger UI:** `http://localhost:5000/api-docs`
* **Features:**
  * Complete schemas for Authentication, Tickets, Comments, Notifications, and Admin Telemetry.
  * Pre-filled sample payloads for instant **"Try it out" ➡️ "Execute"**.
  * Cookie-aware: executing `POST /api/auth/login` automatically stores HttpOnly session cookies in your browser, enabling instant authorized testing across all endpoints.

---

## 🏗️ Architecture & Implementation Highlights

```
┌────────────────────────────────────────────────────────┐
│                   ResolveX Frontend                    │
│      React 18 + Vite + Context API (useState)          │
│         Tailwind CSS + Recharts + Lucide Icons         │
└───────────────────────────┬────────────────────────────┘
                            │ Axios (withCredentials: true)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   ResolveX Backend                     │
│         Node.js + Express REST API (MVC Pattern)       │
│    Helmet + Rate Limiting + Cookie Parser + JWT        │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
┌───────────────────────────┐  ┌─────────────────────────┐
│     MongoDB Atlas / DB    │  │   Node.js EventEmitter  │
│  (Users, Tickets, Logs,   │  │ (Async decoupled side   │
│   Comments, Notifications)│  │  effects & audit logs)  │
└───────────────────────────┘  └─────────────────────────┘
```

### Key Technical Decisions:
1. **State Management (React Context API + Custom Hooks):**
   * Migrated to native `useContext` (`AuthContext`, `TicketContext`, `UIContext`) paired with `useState`.
   * Eliminates boilerplate and overhead of external state managers while ensuring predictable unidirectional data flow.
2. **Security & Authentication:**
   * **Dual Token JWT Architecture:** 15-minute short-lived `accessToken` paired with a 7-day `refreshToken`.
   * **Zero-XSS Storage:** Tokens are sent in `HttpOnly`, `SameSite: lax` cookies, completely inaccessible to malicious JavaScript.
   * **Silent Refresh:** Axios response interceptor intercepts HTTP 401s, silently issues a new access token via `/api/auth/refresh`, and transparently replays the request without kicking the user to `/login`.
3. **Event-Driven Decoupled Architecture (`EventEmitter`):**
   * Ticket creation and lifecycle mutations immediately respond to the user without waiting for notifications or audit logs to complete.
   * Background listeners asynchronously write to `ActivityLogs` and dispatch `Notifications`.
4. **Cascading Cleanup Integrity:**
   * Deleting an unserviced open ticket automatically cleans up all associated comments, notifications, and activity logs.

---

## 📁 Repository Structure

```text
resolvex-support-system/
├── Backend/
│   ├── docs/                   # Swagger & project documentation
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection
│   │   ├── constants/          # Roles, ticket statuses, HTTP status codes
│   │   ├── controllers/        # Request handling & response formatting
│   │   ├── docs/               # Swagger OpenAPI specification (swagger.js)
│   │   ├── events/             # Node.js EventEmitter & asynchronous listeners
│   │   ├── middlewares/        # JWT auth, RBAC authorization, rate limiter, errors
│   │   ├── models/             # Mongoose schemas (User, Ticket, Comment, Notification, Log)
│   │   ├── routes/             # Express route declarations
│   │   ├── scripts/            # Database seeder scripts (seedAdmin.js)
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # API response wrapper & custom error class
│   │   ├── validators/         # express-validator schemas
│   │   ├── app.js              # Express app configuration & middleware pipeline
│   │   └── server.js           # HTTP server bootstrap & DB initialization
│   ├── tests/                  # Jest & Supertest integration tests
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/                # Centralized axiosClient with credentials & refresh
│   │   ├── components/         # Reusable Badges, Navbar, Sidebar, Layout
│   │   ├── context/            # AuthContext, TicketContext, UIContext
│   │   ├── pages/
│   │   │   ├── admin/          # Admin Dashboard, All Tickets, Global Activity
│   │   │   ├── auth/           # Login & Registration views
│   │   │   ├── public/         # SaaS Landing page
│   │   │   └── user/           # User Dashboard, Ticket Creation, Details
│   │   ├── routes/             # AppRoutes & role-based ProtectedRoute
│   │   ├── styles/             # Tailwind CSS & global animations
│   │   ├── App.jsx             # Root component wrapped with Providers
│   │   └── main.jsx            # React 18 DOM mount
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore                  # Git ignore rules for node_modules, .env, and dist
└── README.md
```

---

## 🛠️ Step-by-Step Local Setup Guide

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **MongoDB:** Local MongoDB daemon or MongoDB Atlas connection URI

---

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/resolvex-support-system.git
cd resolvex-support-system
```

---

### Step 2: Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```bash
# Backend/.env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resolvex?retryWrites=true&w=majority
JWT_SECRET=resolvex_jwt_secret_dev_2026_super_secure_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=resolvex_refresh_token_dev_2026_super_secure_key
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_SECURE=false
ADMIN_NAME=ResolveX Admin
ADMIN_EMAIL=admin@resolvex.com
ADMIN_PASSWORD=Admin@123456
```

---

### Step 3: Install Dependencies & Seed Database

#### 1. Setup Backend:
```bash
cd Backend
npm install

# Seed the default Administrator account
npm run seed:admin
```

#### 2. Setup Frontend:
```bash
cd ../Frontend
npm install
```

---

### Step 4: Run the Application

#### Terminal 1 — Start Backend API (Port 5000):
```bash
cd Backend
npm run dev
# Server running on http://localhost:5000
# Swagger API Docs available on http://localhost:5000/api-docs
```

#### Terminal 2 — Start Frontend Application (Port 5173):
```bash
cd Frontend
npm run dev
# Frontend accessible on http://localhost:5173
```

---

## 🧪 Running Automated Tests

ResolveX includes full integration test suites testing authentication, RBAC authorization, and ticket lifecycle flows using **Jest** and **Supertest**:

```bash
cd Backend
npm test
```

**Test Coverage:**
* `tests/auth.test.js`: Registration validation, duplicate email handling, login authentication, HttpOnly cookie emission.
* `tests/ticket.test.js`: Ticket creation, role-based ticket isolation, state machine transitions, cascading deletion.

---

## 🌐 Production Deployment Guide

### Deploying Backend (Render / Railway / AWS EC2):
1. Set Root Directory to `Backend/`.
2. Build Command: `npm install`.
3. Start Command: `npm start` (or `node src/server.js`).
4. Add environment variables in provider dashboard matching `.env` (Set `NODE_ENV=production` and `COOKIE_SECURE=true`).

### Deploying Frontend (Vercel / Netlify):
1. Set Root Directory to `Frontend/`.
2. Build Command: `npm run build`.
3. Output Directory: `dist`.
4. Configure redirect/rewrite for SPA:
   * **Vercel (`vercel.json`):**
     ```json
     { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
     ```
   * Set `VITE_API_URL` to your production backend URL (e.g. `https://api.resolvex.com/api`).

---

## 📄 License
This project is licensed under the ISC License.
