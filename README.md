# Task 2 — Full-Stack REST API with Auth & Rate Limiting

A secure REST API built with Node.js/Express featuring JWT authentication, 
role-based access control, and rate limiting — plus a plain HTML/JS frontend.

## Live Demo

- **Backend API:** https://task2-rest-api.onrender.com
- **Frontend:** Open `frontend/login.html` with Live Server locally

## Tech Stack

**Backend**
- Node.js + Express — web server framework
- better-sqlite3 — lightweight file-based database
- bcryptjs — password hashing (12 salt rounds)
- jsonwebtoken — JWT access + refresh tokens
- express-rate-limit — rate limiting on auth endpoints
- helmet — security headers (CSP, HSTS, X-Frame-Options etc.)
- express-validator — input validation and sanitization
- cors — locked to specific frontend origins only

**Frontend**
- Plain HTML + CSS + JavaScript (no framework)
- Fetch API for HTTP requests
- localStorage for token storage

## Features

- User registration and login with JWT authentication
- Access tokens (15 min expiry) + refresh tokens (7 days)
- Role-based access control — admin and user roles
- Rate limiting — max 10 auth attempts per 15 minutes per IP
- Global rate limit — max 100 requests per 15 minutes per IP
- Security headers via helmet.js (11 headers automatically added)
- Input validation and sanitization on all endpoints
- XSS prevention on frontend via DOM text nodes
- Protected notes CRUD API — users see only their own notes
- Admins can view and delete all users' notes

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Login | No |
| POST | /api/auth/refresh | Refresh access token | No |

### Notes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | /api/notes | Get notes (own or all if admin) | Yes |
| POST | /api/notes | Create a note | Yes |
| PUT | /api/notes/:id | Update a note | Yes |
| DELETE | /api/notes/:id | Delete a note | Yes |

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- Git

### Local Development

1. Clone the repository
```bash
   git clone https://github.com/Pavan755/task2-rest-api.git
   cd task2-rest-api
```

2. Install backend dependencies
```bash
   cd backend
   npm install
```

3. Create environment file
```bash
   cp .env.example .env
```
   Fill in your own values in `.env`

4. Start the backend server
```bash
   node src/app.js
```

5. Open `frontend/login.html` with Live Server in VS Code

## Security Decisions & Tradeoffs

**JWT over sessions:** Stateless tokens make the API easier to scale 
horizontally. Tradeoff — tokens cannot be invalidated before expiry 
without a blocklist.

**Short access token expiry (15 min):** Limits damage window if a token 
is stolen. Refresh tokens handle seamless re-authentication without 
forcing users to log in again.

**bcrypt with 12 rounds:** Strong enough to resist brute force attacks 
while keeping registration/login response times reasonable (~300ms).

**SQLite over PostgreSQL:** Sufficient for this task scope. In production 
with multiple server instances, PostgreSQL would be the right choice.

**Rate limiting on auth routes only (10/15min):** Prevents brute force 
on login/register. A global limiter (100/15min) covers all other routes.

**CORS locked to specific origins:** Prevents unauthorized domains from 
calling the API directly from a browser.

## Project Structure
```
task2-rest-api/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── database.js      # SQLite setup and table creation
│   │   │   ├── userModel.js     # User CRUD operations
│   │   │   └── noteModel.js     # Notes CRUD operations
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification middleware
│   │   │   └── errorHandler.js  # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.js          # Register, login, refresh routes
│   │   │   └── notes.js         # Notes CRUD routes
│   │   ├── utils/
│   │   │   └── tokens.js        # JWT generation helpers
│   │   └── app.js               # Express app entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── api.js                   # All API call functions
    ├── login.html
    ├── register.html
    └── dashboard.html
```