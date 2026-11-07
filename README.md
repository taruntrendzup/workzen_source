# 🌿 WORKZEN — Timesheet & Workforce Management Platform

> **Calm efficiency, balanced time tracking & enterprise workforce governance.**

Workzen is a modern workforce management platform designed to help organizations track employee working hours, manage projects, approve timesheets, and generate productivity reports through a clean, role-based, and fully functional full-stack application.

---

## 🚀 Live Endpoints & Local Access

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Unified Application** | [http://localhost:5000](http://localhost:5000) | Express Server + Production React Bundle |
| **Vite Dev Server** | [http://localhost:5173](http://localhost:5173) | Hot-Module-Reload React Development |
| **Backend REST API** | [http://localhost:5000/api](http://localhost:5000/api) | Express + MongoDB API Services |
| **Health Check** | [http://localhost:5000/api/health](http://localhost:5000/api/health) | API Status Telemetry |

---

## 🔑 Demo Access Credentials

The database is pre-seeded with realistic data across all roles. Quick 1-click instant login buttons are available right on the login page!

| Role | Email | Password | Name / Title |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@workzen.io` | `Admin@123` | Eleanor Vance *(Director of Operations)* |
| **Manager** | `manager@workzen.io` | `Manager@123` | Sarah Jenkins *(Engineering Lead)* |
| **Employee** | `employee@workzen.io` | `Employee@123` | David Kim *(Senior Frontend Engineer)* |

*(Additional seeded team accounts: `priya.patel@workzen.io`, `marcus.vance@workzen.io`, `elena.rostova@workzen.io`, all password `Employee@123`)*

---

## 📦 Deliverables & Milestones Summary

### ✅ Milestone 1 — Foundation & Authentication
- Secure user registration and login with encrypted bcrypt password hashing
- Email-code sign-in, optional password reset, and verified email/password changes from Account Settings
- Role-based authorization for **Admin**, **Manager**, and **Employee**
- Protected dashboard access & route guards based on active role
- Dynamic JWT session handling with automatic re-authentication

### ✅ Milestone 2 — Project & Job Management
- Create, update, and delete projects with budget hours, deadlines, and priorities
- Status tracking: `Planning`, `In Progress`, `On Hold`, `Completed`
- Employee and Manager assignment to projects with capacity limits
- Detailed project overview modal with contributor breakdown and budget burn %

### ✅ Milestone 3 — Timesheet & Approval System
- Daily work hour logging with project selection, task title, description, and billable toggle
- Editable and deletable timesheet entries (with strict safety: locked once approved)
- Employee timesheet history filterable by status (`Pending`, `Approved`, `Rejected`), project, and date
- Manager approval workflow with 1-click quick approvals and bulk approval support
- Manager feedback & revision note system visible directly to employees

### ✅ Milestone 4 — Dashboard, Reports & Launch
- **Personalized Role Dashboards**:
  - **Admin**: Organization KPIs, active project count, 7-day velocity area chart, project distribution bar chart, pending review queue.
  - **Manager**: Managed projects, pending reviews list with 1-click approve/reject, team output leaderboard.
  - **Employee**: Today's hours, weekly summary, assigned projects, my recent timesheet entries with status.
- **Visual Analytics (Recharts)**:
  - 7-Day Hours Trend Area Chart
  - Project Hours Distribution Bar Chart
  - Billable vs Non-Billable Donut Chart
- **Exportable Reports**:
  - Employee Performance Ledger with hourly rate & estimated payroll cost
  - Project Budget Audit Ledger with budget vs actual hours
  - One-click CSV Export and Print/PDF formatted view

---

## 📸 Completed Page Screenshots

All screenshots are stored in [`./screenshots/`](./screenshots/):

1. **`01_login_page.png`** — Login portal with 1-click demo accounts
2. **`02_admin_dashboard.png`** — Full organization admin telemetry & charts
3. **`03_projects_management.png`** — Project cards, progress bars, and team avatars
4. **`04_timesheets_logging.png`** — Timesheet table, date filters, and log time modal
5. **`05_approvals_center.png`** — Manager review queue, bulk approvals, and feedback
6. **`06_reporting_analytics.png`** — Financial summary, Recharts visualizations, and CSV export
7. **`07_team_directory.png`** — Workforce personnel cards & role assignments
8. **`08_manager_dashboard.png`** — Manager-tailored productivity dashboard
9. **`09_employee_dashboard.png`** — Employee daily tracker and assigned deliverables

---

## 📁 Source Code ZIP File

The full source code has been packaged into:
👉 **`c:\Coding Data\Tarun Dashboard\workzen_source_code.zip`**

---

## 🛠️ Project Structure

```text
Tarun Dashboard/
├── screenshots/             # High-resolution screenshots of all completed pages
├── workzen_source_code.zip  # Complete packaged deliverables ZIP
├── server/                  # Node.js + Express Backend
│   ├── config/              # MongoDB connection
│   ├── controllers/         # Auth, Project, Timesheet, Dashboard, Report, Notification
│   ├── middleware/          # JWT Protect & Role Authorize middlewares
│   ├── models/              # User, Project, Timesheet, Notification schemas
│   ├── routes/              # Express API route endpoints
│   ├── utils/               # Database seeder & screenshot capture scripts
│   ├── server.js            # Unified application server
│   └── package.json
└── client/                  # React.js (Vite + Tailwind CSS + Recharts)
    ├── public/              # Favicon & assets
    ├── src/
    │   ├── components/      # Logo, Sidebar, Navbar, Layout, Modals
    │   ├── context/         # AuthContext
    │   ├── pages/           # Login, Register, Dashboard, Projects, Timesheets, Approvals, Reports, Team
    │   ├── services/        # Axios API client
    │   ├── App.jsx          # Route configuration
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 💻 How to Run Locally

### Email verification setup
New registrations require a six-digit email verification code sent over Gmail SMTP using an App Password. For local development, add the following to `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=your-16-character-app-password
EMAIL_FROM="Workzen <your-gmail-address@gmail.com>"
```

`SMTP_USER` and `SMTP_PASS` are required. `EMAIL_FROM` is optional and defaults to `SMTP_USER`; if set, use the same address as `SMTP_USER` or a sender alias authorized by Gmail. Enable 2-Step Verification on the Google account, then create an App Password in your Google Account security settings. Use the generated App Password, not your normal Gmail password. Spaces in the App Password are removed automatically.

For a hosted deployment, add these variables to the **backend service's** environment-variable settings; a local `server/.env` file is not automatically available on the live server. Set `SMTP_USER` and `SMTP_PASS` (and optionally `EMAIL_FROM`), then restart or redeploy the backend. Check `/api/health`: `emailVerificationConfigured` must be `true`. Keep credentials out of source control. Use **Send a new code** to retry after configuration. Verification codes expire after 10 minutes. Existing accounts remain verified.

### 1. Prerequisites
- Node.js (v22.12+)
- MongoDB running locally on `mongodb://127.0.0.1:27017`

### 2. Start Unified Server
```bash
cd server
npm start
# Opens http://localhost:5000
```

### 3. (Optional) Run Vite Dev Client
```bash
cd client
npm run dev
# Opens http://localhost:5173 with hot reload
```

### 4. Re-Seed Database
```bash
cd server
npm run seed
```
