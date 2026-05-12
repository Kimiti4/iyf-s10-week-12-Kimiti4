# Week 12: Deployment & Final Project - JamiiLink

## Author

- **Name:** Amos Kimiti

- **GitHub:** [@Kimiti4](https://github.com/Kimiti4)

- **Date:** May 1, 2026



## Project Description

JamiiLink is a full-stack community platform that connects Kenyan communities to share information, trade goods, and grow together. This final week project deploys the complete application with React frontend, Express backend, MongoDB database, and JWT authentication to production servers (Render + Vercel).



## Technologies Used

- React 18

- React Router v6

- Vite

- Node.js

- Express.js

- MongoDB

- Mongoose

- JWT Authentication

- bcrypt

- CORS

- Render (Backend Hosting)

- Vercel (Frontend Hosting)

- MongoDB Atlas (Cloud Database)



## Features

- Secure user registration and authentication with JWT tokens

- Protected routes requiring login

- Create, read, update, delete posts (CRUD operations)

- Search posts by title, content, or category

- User profiles with post history

- Image upload support for posts

- Post credibility/verification system

- Responsive design for mobile and desktop

- Health check endpoint for monitoring

- Production deployment on Render and Vercel

## Lesson 23: Full-Stack Integration
✅ Task 23.1: Connect React to API - COMPLETED
Location: iyf-s10-week-09-Kimiti4/src/services/api.js/iyf-s10-week-12-Kimiti4/iyf-s10-week-09-Kimiti4/src/services/api.js)
Full API service with auth headers, error handling, 401 redirect
Auth, Posts, Comments, Users APIs all implemented
✅ Task 23.2: Authentication Context - COMPLETED
Location: iyf-s10-week-09-Kimiti4/src/context/AuthContext.jsx/iyf-s10-week-12-Kimiti4/iyf-s10-week-09-Kimiti4/src/context/AuthContext.jsx)
Auth provider with login, register, logout
Location: iyf-s10-week-09-Kimiti4/src/components/ProtectedRoute.jsx/iyf-s10-week-12-Kimiti4/iyf-s10-week-09-Kimiti4/src/components/ProtectedRoute.jsx)
Protected route component for authenticated pages
✅ Task 23.3: Enable CORS - COMPLETED
Location: iyf-s10-week-11-Kimiti4/src/app.js/iyf-s10-week-12-Kimiti4/iyf-s10-week-11-Kimiti4/src/app.js#L17-L38)
CORS configured with environment variables
Supports localhost and production frontend URLs
✅ Task 23.4: Environment Variables - COMPLETED
Backend: iyf-s10-week-11-Kimiti4/.env.example/iyf-s10-week-12-Kimiti4/iyf-s10-week-11-Kimiti4/.env.example)
MONGODB_URI, JWT_SECRET, FRONTEND_URL, PORT, NODE_ENV
Frontend: Uses VITE_API_URL environment variable
Database validation: iyf-s10-week-11-Kimiti4/src/config/database.js/iyf-s10-week-12-Kimiti4/iyf-s10-week-11-Kimiti4/src/config/database.js)
✅ Task 23.5: Production Build - READY
Frontend: npm run build (Vite configured)
Backend: npm start (Express server)
package.json scripts ready
Lesson 24: Deployment
✅ Task 24.1: Deploy Backend - READY FOR RAILWAY
Root directory: iyf-s10-week-11-Kimiti4
Build: npm install
Start: npm start
Health check: /api/health ✅
Environment variables documented
✅ Task 24.2: Deploy Frontend - READY FOR VERCEL
Root directory: iyf-s10-week-09-Kimiti4
Build: npm run build
Output: dist
Framework: Vite (auto-detected)
✅ Task 24.3: Alternative - Full Deploy to Render - READY
Can deploy both frontend + backend together
Static file serving configured in backend
✅ Task 24.4: Health Check & Monitoring - COMPLETED
Location: iyf-s10-week-11-Kimiti4/src/routes/index.js/iyf-s10-week-12-Kimiti4/iyf-s10-week-11-Kimiti4/src/routes/index.js#L12-L19)
Health endpoint at /api/health
Returns status, timestamp, uptime, database connection
✅ Task 24.5: Final Polish - IN PROGRESS
All CRUD operations work ✅
Authentication works ✅
Protected routes ✅
Error messages ✅
Loading states ✅
Responsive design ✅
Environment variables configured ✅

## How to Run

1. Clone this repository

```bash
git clone https://github.com/Kimiti4/iyf-s10-week-12-Kimiti4.git
cd iyf-s10-week-12-Kimiti4
```

2. Install backend dependencies

```bash
cd iyf-s10-week-11-Kimiti4
npm install
```

3. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. Start backend server

```bash
npm run dev
```

5. In a new terminal, install and start frontend

```bash
cd ../iyf-s10-week-09-Kimiti4
npm install
npm run dev
```

6. Visit `http://localhost:5173` in your browser



## Lessons Learned

- How to connect React frontend to Express REST API with proper error handling

- Implementing JWT-based authentication with token storage and verification

- Creating protected routes that redirect unauthenticated users

- Managing global state with React Context API

- Configuring CORS for cross-origin requests between frontend and backend

- Setting up environment variables for different deployment environments

- Deploying full-stack applications to cloud platforms (Render + Vercel)

- Implementing health check endpoints for monitoring application status

- Building production-ready applications with proper security practices

- Handling file uploads and image previews in React



## Challenges Faced

**Challenge 1: MongoDB Connection Issues**

- Problem: Deprecated Mongoose options caused connection errors

- Solution: Removed `useNewUrlParser` and `useUnifiedTopology` options (deprecated in Mongoose 6+)


**Challenge 2: CORS Configuration**

- Problem: Frontend couldn't reach backend due to CORS restrictions

- Solution: Configured CORS middleware with dynamic allowed origins from environment variables


**Challenge 3: Environment Variables Management**

- Problem: Secrets exposed in code or missing in production

- Solution: Created .env.example templates, used import.meta.env for Vite, and configured secrets in Render dashboard


**Challenge 4: Protected Routes Implementation**

- Problem: Users could access protected pages without authentication

- Solution: Created ProtectedRoute component that checks auth state and redirects to login


**Challenge 5: Deployment Configuration**

- Problem: Backend crashed on Render due to missing environment variables

- Solution: Added all required env vars individually in Render dashboard and set NODE_ENV to production



## Screenshots (optional)

![JamiiLink Homepage](./screenshots/homepage.png)

![User Registration](./screenshots/register.png)

![Create Post](./screenshots/create-post.png)

![Search Results](./screenshots/search.png)

![User Profile](./screenshots/profile.png)



## Live Demo (if deployed)

- **Frontend:** [JamiiLink](https://jamii-link-ke.vercel.app/)

- **Backend API:** [Railway Deployment](https://iyf-s10-week-12-kimiti4-production.up.railway.app/)


