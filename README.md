# 🌊 PeerFlow – Peer Review Allocation System

A premium, full-stack peer review allocation system built to automate student peer grading assignments with robust constraints, workload balancing, and rich visual analytics.

Developed by **Team Code Fixers** during the **Xebia Internship**.

---

## 👥 The Team: Code Fixers
* **Sambhav** — Backend REST API & Controllers
* **Priyansh** — Database Schema Design & Prisma Migrations
* **Aastha** — Peer Review Allocation Algorithm Design
* **Muskan** — Unit Test Suites & Constraint Verification
* **Atharv** — React + Vite Frontend Application & UI Components

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React 19, TypeScript, Vite
* **Styling**: Vanilla CSS (Harmonious premium dark mode design, HSL custom palette, responsive layout, fluid micro-animations)
* **Routing**: React Router DOM (v6)
* **API Client**: Axios (configured with baseURL to port 3000, graceful offline fallbacks to mock data)
* **Data Visualization**: Recharts (Fairness metrics, workload distribution, allocation summary charts)
* **Icons**: Lucide React

### Backend
* **Core**: Node.js, Express, TypeScript
* **Database Access**: Prisma ORM (Object-Relational Mapping)
* **Validation**: Zod (type-safe input validation)
* **Authentication**: JSON Web Token (JWT) with role-based access control (Instructor vs. Student) & bcrypt password hashing
* **Test Suite**: Jest & ts-jest (100% test coverage on core constraint logic)
* **Utility**: Nodemon (hot-reloading in dev mode)

### Database
* **Database**: PostgreSQL (relational model with cascading constraints and unique index guards)

---

## 📁 Project Structure

```
peer-review-allocation-system/
├── prisma/
│   ├── schema.prisma          ← Database schema (5 models, PostgreSQL driver)
│   └── migrations/            ← Historical DB migrations
├── src/
│   ├── index.ts               ← Express server entrypoint
│   ├── types/index.ts         ← Shared TypeScript type declarations
│   ├── routes/                ← Auth, Student, Team, Submission, Allocation, Review
│   ├── controllers/           ← Request & Response handlers
│   ├── services/              ← Business logic services
│   │   ├── auth.service.ts
│   │   ├── student.service.ts
│   │   ├── submission.service.ts
│   │   ├── review.service.ts
│   │   └── allocation.service.ts ← Core greedy constraint-first algorithm
│   ├── middleware/            ← JWT Authentication & Global Error Handler
│   ├── utils/                 ← Prisma client singleton & response wrappers
│   ├── prisma/
│   │   └── seed.ts             ← Database seeder (creates mockup course dataset)
│   └── __tests__/             ← Jest test suites for constraints
├── frontend/
│   ├── src/
│   │   ├── api.ts            ← Axios backend communicator
│   │   ├── App.tsx           ← React entry & route definitions
│   │   ├── index.css         ← Global design system variables & CSS tokens
│   │   ├── components/       ← Sidebar navigation, Topbar breadcrumb
│   │   └── pages/            ← 8 dashboard screens (Dashboard, Students, Teams, etc.)
│   ├── tsconfig.json          ← Frontend TypeScript configs
│   ├── package.json           ← Frontend dependencies & build commands
│   └── vite.config.ts         ← Vite developer server options
├── .env.example               ← Template file for database URL & secret keys
├── jest.config.js             ← Jest test runtime configurations
├── package.json               ← Backend dependencies & CLI scripts
└── tsconfig.json              ← Backend TypeScript configurations
```

---

## ⚡ Setup & Run Guidelines

Follow these steps to set up the project locally:

### Prerequisites
* **Node.js** (v18+ recommended)
* **PostgreSQL** database running locally (or via Docker)

### 1. Set Up Environment Variables
Create a `.env` file in the root directory and copy the contents from `.env.example`:
```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DATABASE_NAME>?schema=public"
PORT=3000
JWT_SECRET="your_jwt_secret_token_phrase"
JWT_EXPIRES_IN="7d"
```

### 2. Install Dependencies
Run `npm install` in both the root directory (for backend) and the frontend directory:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Setup the Database Schema
Apply migrations to your PostgreSQL database and seed it with initial data:
```bash
# Apply Prisma database migrations
npx prisma migrate dev --name init

# Seed the database
npm run prisma:seed
```
*Note: Seeding creates an Instructor account, 6 active students across 3 teams, and 6 initial pending submissions.*

### 4. Run the Servers
Start both the backend and frontend dev servers:
```bash
# Start Backend API (runs on port 3000)
npm run dev

# Start Frontend App (runs on port 5173)
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to access the dashboard.

### 5. Running the Tests
To verify the allocation engine's correctness against the hard and soft constraints, run Jest unit tests:
```bash
npm test
```

---

## 🧠 Core Feature: Allocation Engine (`allocation.service.ts`)

The system uses a greedy constraint-first allocation algorithm designed by **Aastha** and implemented in the backend services. When the allocation run is triggered, the engine evaluates candidates for each submission through the following multi-stage pipeline:

```
[ All Students ]
       │
       ▼ (HC-05) Exclude Inactive Students
[ Active Students Pool ]
       │
       ▼ (HC-01) Exclude Submission Owner (No Self Review)
[ Filtered Pool (Step 1) ]
       │
       ▼ (HC-02) Exclude Team Members (No Intra-Team Review)
[ Filtered Pool (Step 2) ]
       │
       ▼ (HC-04) Exclude Already-Assigned Reviewers (No Duplicates)
[ Filtered Pool (Step 3) ]
       │
       ▼ (SC-01) Avoid Repeat Pairs (Soft Constraint)
       ├─► Check: If pool size < 2 after removing previous reviewers:
       │     └─► Relax SC-01 (Retain previous reviewers to prevent shortage)
       │     └─► Add warning note in logs & output
       └─► Otherwise: Apply SC-01
[ Prioritized Reviewer Pool ]
       │
       ▼ (SC-02) Workload Balancing
       └─► Sort candidates by current reviewCount ASC (fewest reviews first)
[ Sorted Reviewer Pool ]
       │
       ▼ (HC-03) Feasibility Check
       └─► Verify: Are there at least 2 candidates left in the pool?
             ├─► YES: Assign top 2 reviewers
             └─► NO: Mark as allocation error (requires Instructor manual assignment)
```

### Enforced Constraints:
1. **No Self Review (HC-01)**: Students cannot review their own submissions.
2. **No Same Team Review (HC-02)**: Students in the same team cannot review each other's submissions.
3. **Min 2 Reviews per Submission (HC-03/HC-06)**: Every submission must receive exactly 2 peer reviews.
4. **No Duplicate Assignment (HC-04)**: A student cannot be assigned to review the same submission twice.
5. **Active Students Only (HC-05)**: Inactive or dropped students are excluded from the reviewer pool.
6. **Avoid Repeat Pairs (SC-01)**: The system avoids assigning a student to review a peer they have reviewed in a previous assignment (unless pool size constraints necessitate relaxation).
7. **Workload Balancing (SC-02)**: Review tasks are assigned first to students who have the fewest reviews scheduled to ensure fairness.

---

## 🎨 Frontend View (8 Screens)
1. **Dashboard**: Live system status overview, total reviews, submission coverage rates, and recent activity feed.
2. **Students**: Detailed list of all active/inactive students, search, and workload status.
3. **Teams**: Cards summarizing team structure, membership lists, and projects.
4. **Submissions**: Track the workflow status (`PENDING`, `UNDER_REVIEW`, `COMPLETE`) of all student submissions.
5. **Allocation Engine**: Interface for instructors to execute the allocation engine on assignments, configure parameters, and visualize results.
6. **Review Tasks**: List of reviews assigned to the logged-in student.
7. **Review Workspace**: Interactive peer grading panel with feedback comments and a star-rating form.
8. **Fairness Analytics**: Breakdown of the Gini coefficient, workload parity index, and workload distributions.

---

## 🔐 Authentication & Security

All API endpoints (except `/api/v1/auth/login`) require Bearer JWT token verification:
```
Authorization: Bearer <jwt_token>
```
Endpoints are guarded by role checking:
- **Instructors** have full CRUD permissions and can run/configure the allocation engine.
- **Students** can only view/submit their own submissions, view assigned review tasks, and submit peer grades.
