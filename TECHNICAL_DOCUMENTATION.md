# Ranger App Technical Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Environment Variables](#environment-variables)
5. [Setup & Installation](#setup--installation)
6. [Running the App](#running-the-app)
7. [Deployment](#deployment)
8. [Backend](#backend)
9. [Frontend](#frontend)
10. [API Endpoints](#api-endpoints)
11. [Database Schema](#database-schema)
12. [Testing](#testing)
13. [Debugging & Logging](#debugging--logging)
14. [Maintenance & Best Practices](#maintenance--best-practices)
15. [Contact & Support](#contact--support)

---

## 1. Overview

The Ranger App is a full-stack web application for field rangers and administrators to manage, submit, and monitor field reports. It features user authentication, role-based dashboards, report submission with image uploads, and admin management tools.

## 2. Architecture

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** Supabase (PostgreSQL)
- **File Storage:** Cloudinary (for images)
- **Hosting:** Vercel (frontend), Render/other (backend)

## 3. Project Structure

```
Ranger-app/
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions (e.g., supabaseClient.js)
│   │   ├── assets/        # Images, icons, etc.
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
├── server/                # Backend Express app
│   ├── routes/            # API route handlers
│   ├── controllers/       # Business logic
│   ├── utils/             # Utility functions (e.g., hash, cloudinary)
│   ├── package.json
│   └── ...
├── README.md
├── .gitignore
└── ...
```

## 4. Environment Variables

**Frontend (`client/.env` or Vercel dashboard):**

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_KEY` - Supabase anon/public key
- `VITE_BACKEND_URL` - Backend API base URL

**Backend (`server/.env` or Render dashboard):**

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase service role key
- `CLOUDINARY_URL` - Cloudinary connection string
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_CLOUD_NAME` - Cloudinary credentials
- `JWT_SECRET` - Secret for JWT authentication (if used)

## 5. Setup & Installation

1. **Clone the repository:**
   ```sh
   git clone <repo-url>
   cd Ranger-app
   ```
2. **Install dependencies:**
   - Frontend:
     ```sh
     cd client
     npm install
     ```
   - Backend:
     ```sh
     cd ../server
     npm install
     ```
3. **Set up environment variables** as described above.

## 6. Running the App

- **Frontend:**
  ```sh
  cd client
  npm run dev
  ```
- **Backend:**
  ```sh
  cd server
  npm start
  ```

## 7. Deployment

- **Frontend:** Deploy to Vercel. Set environment variables in the Vercel dashboard.
- **Backend:** Deploy to Render, Railway, or similar. Set environment variables in the provider dashboard.
- **Database:** Supabase project (PostgreSQL)
- **File Storage:** Cloudinary account

## 8. Backend

- **Express.js** REST API
- **Routes:**
  - `/api/register` - Ranger registration
  - `/api/login` - User login
  - `/api/report` - Report submission (with image upload)
  - `/api/reports` - Fetch reports
  - `/api/assign` - Assign reports to rangers
  - `/api/approve` - Approve/disapprove ranger registration (triggers email)
- **Utils:**
  - Password hashing (bcrypt)
  - Cloudinary image upload
  - Supabase client

## 9. Frontend

- **React** with functional components and hooks
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **State Management:** React state/hooks
- **Key Components:**
  - `RegisterPage.jsx`, `LoginPage.jsx`, `Dashboard.jsx`, `RangerDashboard.jsx`, `Form.jsx`, `ReportTable.jsx`, etc.
- **API Calls:** Fetches data from backend and Supabase

## 10. API Endpoints

| Endpoint        | Method | Description                           |
| --------------- | ------ | ------------------------------------- |
| `/api/register` | POST   | Register a new ranger                 |
| `/api/login`    | POST   | User login                            |
| `/api/report`   | POST   | Submit a new report (with image)      |
| `/api/reports`  | GET    | Get all reports                       |
| `/api/assign`   | POST   | Assign report to ranger               |
| `/api/approve`  | POST   | Approve/disapprove ranger, send email |

## 11. Database Schema (Supabase)

- **pending_ranger_requests**
  - `id`, `name`, `ranger_id`, `email`, `password_hash`, `status`, `created_at`
- **ranger_reports**
  - `id`, `ranger_name`, `ranger_id`, `condition`, `notes`, `latitude`, `longitude`, `image_url`, `status`, `assigned_to`, `created_at`, `admin_notes`
- **users/rangers** (if separate)
  - `id`, `name`, `email`, `role`, etc.

## 12. Testing

- **Frontend:**
  - Use [Vitest](https://vitest.dev/) or Jest with React Testing Library
  - Test files: `*.test.jsx` in `client/src/components/`
- **Backend:**
  - Use Jest or Mocha for API and utility tests
  - Test files: `*.test.js` in `server/`
- **Run tests:**
  ```sh
  npm test
  # or for Vitest
  npx vitest
  ```

## 13. Debugging & Logging

- **Frontend:**
  - Use browser dev tools for debugging
  - Add error boundaries and user-friendly error messages
- **Backend:**
  - Use `console.log`/`console.error` for server logs
  - Use a logging library (e.g., Winston, Morgan) for production
  - Check deployment provider logs (Vercel, Render, etc.)
- **Common Issues:**
  - 500 errors: Check backend logs and Supabase responses
  - CORS issues: Ensure correct CORS settings on backend
  - Env variable issues: Double-check provider dashboard

## 14. Maintenance & Best Practices

- **Code Organization:**
  - Keep components and utilities modular
  - Use custom hooks for repeated logic
- **Security:**
  - Hash passwords, use HTTPS, validate all inputs
  - Store secrets in environment variables
- **Performance:**
  - Use pagination for large data sets
  - Optimize images before upload
- **Accessibility:**
  - Use semantic HTML, ARIA labels, and keyboard navigation
- **Documentation:**
  - Keep this file and user guides up to date
- **Backups:**
  - Regularly back up Supabase data

## 15. Contact & Support

- For technical support, contact the project maintainer or your IT team.
- For user support, refer to the included Ranger and Admin User Guides.
