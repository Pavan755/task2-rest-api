# Task 2 - Full-Stack REST API with Auth and Rate Limiting

A secure REST API built with Node.js/Express featuring JWT authentication,
role-based access control, rate limiting, and a plain HTML/JS frontend.

> **Transparency note:** I am a beginner with basic HTML/CSS/JS knowledge.
> I used Claude AI (Anthropic) as a learning assistant throughout this task.
> It helped me understand concepts, debug errors, and guided me step by step.
> Every line of code was reviewed and understood by me before moving forward.
> This README documents the full journey, including what I learned at each step.

---

## Live Demo

- **Backend API:** https://task2-rest-api.onrender.com
- **Frontend:** Open `frontend/login.html` with Live Server in VS Code

---

## My Learning Journey - How I Built This

I had never built a backend before. Here is the honest route I took
from zero to a deployed full-stack app.

### Where I started

- Knew basic HTML, CSS, JavaScript
- Had VS Code and Git installed
- Never used Node.js, Express, JWT, or databases before

### Route map

```
START
   |
   v
Phase 0 - Project Setup
   - Created GitHub repo (task2-rest-api)
   - Learned what npm is (package manager, like an app store for code)
   - Ran npm init to create package.json (the project's recipe card)
   - Installed all dependencies in one go
   - Created folder structure: src/db, src/routes, src/middleware, src/utils
   - Learned about .env files - secrets never go in code
   - Made first commit with meaningful message
   |
   v
Phase 1 - Database + User Model
   - Learned what SQLite is (a database stored as a single file)
   - Created database.js - sets up two tables: users and notes
   - Learned what a table schema is (like a spreadsheet with defined columns)
   - Created userModel.js - learned about password hashing with bcrypt
      KEY LEARNING: Never store plain passwords. bcrypt scrambles them
      with 12 rounds so even if DB is stolen, passwords cannot be reversed
   - Created noteModel.js - CRUD operations for notes
   - Fixed first real bug: file was named userModule.js, not userModel.js
      (learned that file names must match exactly what the code requires)
   |
   v
Phase 2 - JWT Authentication
   - Learned what JWT (JSON Web Token) is:
      - Like a digital ID card the server gives you after login
      - Every request after that shows the ID card instead of password
   - Created two types of tokens:
      - Access token (15 min) - used for every request, short lived for security
      - Refresh token (7 days) - used only to get a new access token silently
   - Built POST /api/auth/register - validates input, hashes password, returns tokens
   - Built POST /api/auth/login - checks password hash, returns tokens
   - Built POST /api/auth/refresh - gives new access token using refresh token
   - Learned about timing attacks:
      Always run bcrypt.compare even if user not found, so attackers
      cannot tell if an email exists based on response speed
   - Fixed PowerShell curl issue - Windows uses Invoke-RestMethod instead
   - Tested register endpoint live and got back real JWT tokens
   |
   v
Phase 3 - Role-Based Access Control (RBAC)
   - Learned what middleware is:
      A function that runs BEFORE the route handler, like a security guard
   - Created auth.js middleware - verifies JWT on every protected request
   - Created requireAdmin middleware - second layer, only lets admins through
   - Built notes routes with RBAC:
      - Regular users: can only see/edit/delete their own notes
      - Admins: can see all notes from all users
   - Tested: created a note with JWT token, confirmed it was protected
   |
   v
Phase 4 - Security Hardening
   - Added helmet.js - automatically adds 11 security headers:
      - Content-Security-Policy (blocks malicious scripts)
      - X-Frame-Options: SAMEORIGIN (prevents clickjacking)
      - Strict-Transport-Security (forces HTTPS)
      - X-Content-Type-Options: nosniff (prevents MIME attacks)
      - And 7 more...
   - Added global rate limiter (100 requests/15 min per IP)
   - Auth routes get stricter limit (10 requests/15 min per IP)
   - Added global error handler so stack traces never leak to clients
   - Verified all headers live using Invoke-WebRequest
   |
   v
Phase 5 - Plain HTML/JS Frontend
   - Chose plain HTML/JS over React (task allows either, simpler to build)
   - Created api.js - all API calls in one place, handles token refresh automatically
   - Built login.html - form with validation, error messages, Enter key support
   - Built register.html - form with client-side validation before API call
   - Built dashboard.html - protected page showing notes, add/delete functionality
   - Learned about XSS prevention:
      Used document.createTextNode() instead of innerHTML to display user content
      This prevents malicious scripts from running if injected into note content
   - Fixed CORS issue - browser blocked requests because frontend origin
      was not in the allowed list. Added all Live Server ports to CORS config
   |
   v
Phase 6 - Deployment
   - Deployed backend to Render.com (free tier)
   - Learned about environment variables on hosting platforms:
      same concept as .env file but stored encrypted on the server
   - Used Render's secret generator for JWT secrets (stronger than manual)
   - Verified live deployment with real API calls:
      - Register: OK returned JWT tokens
      - Login + create note: OK note saved to live database
      - Rate limiter: OK returned 429 Too Many Requests after repeated failures
   |
   v
DONE - Full stack app deployed and tested end to end
```

---

## Tech Stack

### Backend

| Package | Purpose |
|---------|---------|
| Node.js + Express | Web server framework |
| better-sqlite3 | File-based database, zero config |
| bcryptjs | Password hashing (12 salt rounds) |
| jsonwebtoken | JWT access + refresh token generation |
| express-rate-limit | Rate limiting on auth + global routes |
| helmet | 11 security headers automatically |
| express-validator | Input validation and sanitization |
| cors | Locked to specific frontend origins only |
| dotenv | Loads secrets from .env file |

### Frontend

| Technology | Purpose |
|------------|---------|
| Plain HTML + CSS | Structure and styling |
| Vanilla JavaScript | Logic and API calls |
| Fetch API | HTTP requests to backend |
| localStorage | Token storage between page loads |

---

## Project Structure

```
task2-rest-api/
|- backend/
|  |- src/
|  |  |- db/
|  |  |  |- database.js       # SQLite setup, creates users + notes tables
|  |  |  |- userModel.js      # User CRUD: create, findByEmail, findById, verifyPassword
|  |  |  \- noteModel.js      # Notes CRUD: findByUserId, create, update, delete, findAll
|  |  |- middleware/
|  |  |  |- auth.js           # JWT verification + requireAdmin guard
|  |  |  \- errorHandler.js   # Global error handler, prevents stack trace leaks
|  |  |- routes/
|  |  |  |- auth.js           # POST /register, /login, /refresh
|  |  |  \- notes.js          # GET/POST/PUT/DELETE /notes with RBAC
|  |  |- utils/
|  |  |  \- tokens.js         # generateAccessToken + generateRefreshToken
|  |  \- app.js               # Express app: middleware stack + route mounting
|  |- .env.example            # Shows required env vars without real values
|  \- package.json
\- frontend/
    |- api.js                  # All API calls, auto token refresh logic
    |- login.html              # Login form -> saves tokens -> redirects to dashboard
    |- register.html           # Register form -> saves tokens -> redirects to dashboard
    \- dashboard.html          # Protected notes UI: add, view, delete notes
```

---

## API Endpoints

### Auth (rate limited: 10 requests / 15 min per IP)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Create account, returns tokens | No |
| POST | /api/auth/login | Login, returns tokens | No |
| POST | /api/auth/refresh | Get new access token | No |

### Notes (rate limited: 100 requests / 15 min per IP)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/notes | Own notes (admin gets all) | Yes |
| POST | /api/notes | Create a note | Yes |
| PUT | /api/notes/:id | Update own note | Yes |
| DELETE | /api/notes/:id | Delete own note | Yes |
| GET | /api/notes/admin/all | All notes with usernames | Admin only |

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- Git

### Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Pavan755/task2-rest-api.git
cd task2-rest-api

# 2. Install backend dependencies
cd backend
npm install

# 3. Create your .env file
copy .env.example .env
# Open .env and fill in your own JWT secrets

# 4. Start the server
node src/app.js
# You should see:
# Database connected and tables ready
# Server running on port 5000

# 5. Open frontend/login.html with Live Server in VS Code
```

---

## Security Decisions and Tradeoffs

### Why JWT over sessions?

JWT tokens are stateless. The server does not need to store session data.
This makes the API easier to scale. The tradeoff is that tokens cannot be
invalidated before expiry without maintaining a blocklist.

### Why two tokens (access + refresh)?

Access tokens expire in 15 minutes. That short window limits damage if stolen.
Refresh tokens last 7 days and are used silently to get new access tokens,
so users do not have to log in again every 15 minutes.

### Why bcrypt with 12 rounds?

12 rounds means $2^{12} = 4096$ iterations of hashing. This is strong enough
to make brute-force attacks impractical while keeping login time reasonable.

### Why SQLite over PostgreSQL?

SQLite requires zero configuration and runs as a local file. It is perfect for
this task's scope. In a production app with multiple server instances,
PostgreSQL would be the better choice.

### Why plain HTML/JS over React?

The task explicitly allows plain HTML/JS. Since I am learning, removing
the React learning curve let me focus on what the task actually tests:
security architecture, JWT, and API design.

### Rate limiting strategy

Auth endpoints (login, register) get the strictest limit: 10 per 15 min.
These routes are most sensitive to brute-force attacks. All other routes
get a more generous global limit of 100 per 15 min.

### CORS configuration

Locked to specific origins rather than wildcard `*`. This prevents
unauthorized websites from making API calls on behalf of a logged-in user.


---
## Live Demo & Proof Links

| What | Link |
|------|------|
| 🌐 Live Backend API | https://task2-rest-api.onrender.com |
| 📁 GitHub Repository | https://github.com/Pavan755/task2-rest-api |
| ✅ Health Check | https://task2-rest-api.onrender.com/ |
| 🔐 Register endpoint | https://task2-rest-api.onrender.com/api/auth/register |
| 📝 Notes endpoint | https://task2-rest-api.onrender.com/api/notes |

### Live API test proof

**Health check** — visit in browser:
```
https://task2-rest-api.onrender.com/
```
Returns: `{"message":"API is running"}`

**Register proof** — tested live via PowerShell:
```
POST https://task2-rest-api.onrender.com/api/auth/register
Response: Account created successfully + JWT access token + refresh token
```

**Note creation proof** — tested with JWT token:
```
POST https://task2-rest-api.onrender.com/api/notes
Response: Note created @{id=1; userId=1; title=Live test; content=Running on Render!}
```

**Rate limiter proof** — sent 11 rapid login attempts:
```
Requests 1-8:  401 Unauthorized  (wrong password — expected)
Requests 9-11: 429 Too Many Requests  (rate limiter triggered — working!)
```

**Security headers proof** — helmet.js verified live:
```
Content-Security-Policy: default-src 'self'...
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
RateLimit-Remaining: 99
```

### Render deployment proof

- Deployed at: https://render.com
- Service name: task2-rest-api
- Region: Singapore (Southeast Asia)
- Runtime: Node.js
- Auto-deploys from: github.com/Pavan755/task2-rest-api (main branch)
- Build log shows:
  - `npm install` — 122 packages installed
  - `Database connected and tables ready`
  - `Server running on port 10000`
  - Status: ✅ Live
---
## Submission Checklist

- [x] GitHub repository is public with progressive commit history
- [x] Backend deployed live on Render.com
- [x] JWT authentication working (register + login + refresh)
- [x] Role-based access control (admin vs user)
- [x] Rate limiting on auth endpoints (verified with 429 response)
- [x] Input validation on all endpoints (express-validator)
- [x] Security headers added (helmet.js — 11 headers)
- [x] Frontend consuming the API (login, register, dashboard)
- [x] .env.example present, no real secrets in repo
- [x] README documents setup, decisions and tradeoffs
- [x] AI assistance disclosed transparently
---

## What I Learned

1. **Backend is just a program that listens for HTTP requests**
    Once I understood that, Express made complete sense.

2. **Never trust user input**
    Validate and sanitize everything before touching the database.
    express-validator made this straightforward.

3. **Secrets never go in code**
    .env files and hosting platform env vars are the right place.

4. **File names must match exactly**
    I spent time debugging a userModule.js vs userModel.js mismatch.

5. **PowerShell is different from bash**
    `curl` does not work the same way. I used Invoke-RestMethod for testing.

6. **CORS exists to protect users**
    The browser blocks cross-origin requests by default for security reasons.

7. **Free hosting sleeps**
    Render's free tier spins down after inactivity. First request can be slow,
    which is expected behavior.