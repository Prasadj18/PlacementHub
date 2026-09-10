# PlacementHub

PlacementHub is a comprehensive college student placement tracking and management application. It is designed to help students track their placement journey after applying externally through their college placement portal.

## Features

- **Authentication**: JWT-based authentication restricted to specific college email domains (e.g., `@bmsce.ac.in`).
- **Dashboard**: High-level overview of application statistics, upcoming events, and recent applications.
- **Company Management**: Track companies, roles, CTC, work modes, and locations.
- **Application Tracking**: Manage your application status (Applied, OA, Shortlisted, Interview, Selected, Rejected).
- **Placement Events**: Track dates and details for Pre-Placement Talks (PPTs), Online Assessments (OAs), Interviews, and Results.
- **Calendar View**: A visual monthly calendar showing all placement events.
- **Experiences**: Share and read interview and assessment experiences from other students.
- **Notifications**: Automatic alerts when new events are added or updated for companies you're tracking.

## Tech Stack

- **Frontend**: React (with TypeScript), Vite, React Router, custom CSS (Vanilla).
- **Backend**: Node.js, Express, TypeScript.
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: JSON Web Tokens (JWT) & bcrypt.
- **Infrastructure**: Docker Compose (for PostgreSQL).

## How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

### 1. Database Setup
Start the PostgreSQL database using Docker Compose:
```bash
cd PlacementHub
docker compose up -d
```

### 2. Backend Setup
Install dependencies, run database migrations, and start the development server:
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run dev
```
The backend API will be available at `http://localhost:5000`.

### 3. Frontend Setup
In a new terminal window, install dependencies and start the React app:
```bash
cd client
npm install
npm run dev
```
The frontend will typically be available at `http://localhost:5173` (or `5174` if `5173` is busy).

## Environment Variables

Make sure to set up your environment variables if starting fresh.

**Backend (`server/.env`)**:
```env
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
PORT
NODE_ENV
COLLEGE_EMAIL_DOMAIN
CLIENT_URL
VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```
