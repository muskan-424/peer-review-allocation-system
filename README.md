# Peer Review Allocation System – Backend API

> Node.js · Express · TypeScript · PostgreSQL · Prisma · JWT

---

## Project Structure

```
peer-review-backend/
│
├── prisma/
│   └── schema.prisma          ← Database schema (5 tables)
│
├── src/
│   ├── index.ts               ← Server entry point
│   ├── types/index.ts         ← All TypeScript interfaces
│   │
│   ├── routes/                ← URL → controller mapping
│   │   ├── auth.routes.ts
│   │   ├── student.routes.ts
│   │   ├── team.routes.ts
│   │   ├── submission.routes.ts
│   │   ├── allocation.routes.ts
│   │   └── review.routes.ts
│   │
│   ├── controllers/           ← Handles HTTP req/res
│   │   ├── auth.controller.ts
│   │   ├── student.controller.ts
│   │   ├── submission.controller.ts
│   │   ├── allocation.controller.ts
│   │   └── review.controller.ts
│   │
│   ├── services/              ← Business logic lives here
│   │   ├── auth.service.ts
│   │   ├── student.service.ts
│   │   ├── submission.service.ts
│   │   ├── allocation.service.ts  ← THE CORE ALGORITHM
│   │   └── review.service.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts  ← JWT verify + role guard
│   │   └── error.middleware.ts ← Global error handler
│   │
│   ├── utils/
│   │   ├── prisma.ts           ← DB client singleton
│   │   └── response.ts         ← sendSuccess / sendError
│   │
│   └── prisma/
│       └── seed.ts             ← Sample data (A,B,C,D,E,F)
│
├── .env                        ← Environment variables
├── package.json
└── tsconfig.json
```

---

## Setup — Step by Step

### 1. Install dependencies
```bash
npm install
```

### 2. Set up your .env file
Edit `.env` and put your PostgreSQL connection string:
```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/peer_review_db"
JWT_SECRET=any_long_random_string
```

### 3. Create the database tables
```bash
npx prisma migrate dev --name init
```

### 4. Seed with sample data (Alice, Bob, Carol, David, Eva, Frank)
```bash
npm run prisma:seed
```

### 5. Start the server
```bash
npm run dev
```
Server runs at: **http://localhost:3000**

---

## API Endpoints

### Auth
| Method | Endpoint | Who |
|--------|----------|-----|
| POST | `/api/v1/auth/login` | Anyone |

**Login body:**
```json
{ "email": "instructor@lms.com", "password": "password123" }
```

---

### Students
| Method | Endpoint | Who |
|--------|----------|-----|
| GET | `/api/v1/students` | Instructor |
| GET | `/api/v1/students/:id` | Instructor / Self |
| PATCH | `/api/v1/students/:id` | Instructor |

---

### Submissions
| Method | Endpoint | Who |
|--------|----------|-----|
| POST | `/api/v1/submissions` | Student |
| GET | `/api/v1/submissions` | Instructor |
| GET | `/api/v1/submissions/:id` | Instructor / Owner |

---

### Allocation (THE MAIN FEATURE)
| Method | Endpoint | Who |
|--------|----------|-----|
| POST | `/api/v1/allocation/run` | Instructor |
| POST | `/api/v1/allocation/run/:submissionId` | Instructor |

**Run full allocation:**
```json
{ "assignmentId": "assignment-001" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSubmissions": 6,
    "tasksCreated": 12,
    "submissionsCovered": 6,
    "relaxedConstraints": [],
    "durationMs": 45
  }
}
```

---

### Reviews
| Method | Endpoint | Who |
|--------|----------|-----|
| GET | `/api/v1/reviews/my-tasks` | Student |
| GET | `/api/v1/reviews/workload` | Instructor |
| PATCH | `/api/v1/reviews/:id/start` | Student |
| PATCH | `/api/v1/reviews/:id/submit` | Student |

**Submit a review:**
```json
{ "score": 85 }
```

---

## How the Algorithm Works (allocation.service.ts)

For each submission, the algorithm runs this pipeline:

```
All Active Students (HC-05)
        ↓
Remove Owner (HC-01)
        ↓
Remove Same-Team Students (HC-02)
        ↓
Remove Already-Assigned (HC-04)
        ↓
Remove Prior Pairs if possible (SC-01) ← relaxed if needed
        ↓
Sort by Review Count ASC (SC-02)
        ↓
Check pool >= 2 (HC-03) ← error if not
        ↓
Assign top 2 reviewers
        ↓
Save ReviewTask + update PairHistory + update workload
```

---

## Authentication

All endpoints except `/auth/login` require:
```
Authorization: Bearer <your_jwt_token>
```

Get the token from the login endpoint first.
