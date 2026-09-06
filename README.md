# JamiiLink

> Full-stack community platform for sharing information, trading goods, and building trusted local communities.

JamiiLink is a production-oriented full-stack application built around a React frontend, Express API, MongoDB persistence, and JWT-based authentication.

The repository represents the final Week 12 implementation of the project and is presented here as a **full-stack engineering project**, rather than only as a course exercise.

## Product scope

JamiiLink provides a community publishing workflow with authenticated users, posts, profiles, search, verification/credibility features, and responsive access across desktop and mobile layouts.

### Core capabilities

- User registration, login, and JWT authentication
- Protected frontend routes and authenticated API operations
- Create, read, update, and delete posts
- Search by post title, content, and category
- User profiles and post history
- Image upload support
- Post credibility / verification workflow
- Responsive UI
- Backend health endpoint
- Environment-based configuration for development and deployment

## Architecture

```text
┌─────────────────────┐
│   React + Vite UI   │
│     Frontend        │
└──────────┬──────────┘
           │ HTTP / JSON
           ▼
┌─────────────────────┐
│   Express.js API    │
│ Authentication/CRUD │
└──────────┬──────────┘
           │ Mongoose
           ▼
┌─────────────────────┐
│       MongoDB       │
│   application data  │
└─────────────────────┘
```

### Main stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt |
| API integration | REST / JSON |
| Production hosting | Vercel + Railway/Render-compatible deployment |
| Database hosting | MongoDB Atlas |

## Repository structure

The final project is assembled from the full-stack work developed across the preceding project stages:

```text
iyf-s10-week-12-Kimiti4/
├── iyf-s10-week-09-Kimiti4/    # React frontend
├── iyf-s10-week-11-Kimiti4/    # Express backend
├── README.md
└── ...
```

The nested frontend/backend directories are retained because they reflect the project's development progression and final integration structure.

## Running locally

### Prerequisites

- Node.js
- npm
- MongoDB or MongoDB Atlas

### Backend

```bash
cd iyf-s10-week-11-Kimiti4
npm install
cp .env.example .env
```

Configure the required environment variables, including the MongoDB connection string, JWT secret, frontend origin, and port.

Start the backend in development mode:

```bash
npm run dev
```

### Frontend

In a second terminal:

```bash
cd iyf-s10-week-09-Kimiti4
npm install
npm run dev
```

The Vite development server will provide the frontend URL shown in the terminal, normally `http://localhost:5173`.

## Configuration

The backend uses environment variables rather than committing secrets to source control. The frontend uses Vite environment configuration for the API base URL.

Typical backend configuration includes:

```text
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=...
PORT=...
NODE_ENV=development
```

Do **not** commit real credentials, tokens, database URLs containing secrets, or production configuration files.

## API and health monitoring

The backend exposes a health endpoint at:

```text
GET /api/health
```

The endpoint is intended to provide basic service/database health information for deployment and operational checks.

## Verification

The project has been through staged frontend and full-stack verification work, including linting, builds, end-to-end checks, accessibility review, and deployment-oriented checks.

Verification status should be interpreted against the specific audit/run recorded for the repository rather than as a blanket guarantee that every environment and browser configuration is defect-free.

## Deployment

The application has deployment configuration for a separate frontend and backend:

```text
Frontend  → Vercel-compatible static/Vite deployment
Backend   → Railway/Render-compatible Node deployment
Database  → MongoDB Atlas
```

Before redeploying, verify the current environment variables, allowed CORS origins, build commands, and health-check configuration for the selected provider.

## Engineering lessons

The project demonstrates practical full-stack concerns including:

- REST API integration between independent frontend/backend layers
- Authentication and authorization boundaries
- Protected client-side routes
- CORS configuration
- Environment-specific configuration
- Database connectivity and validation
- CRUD lifecycle design
- Loading/error states in the UI
- Health monitoring
- Production deployment configuration
- Accessibility and responsive UI considerations

## Project context

JamiiLink is one of the three public-facing flagship projects used to demonstrate the engineering progression around the broader Tiannara work.

It is deliberately presented separately from the **Main Tiannara** system and the **Tiannara Software Platform**, which have different scopes and architectural objectives.

## License

See the repository's license and project documentation for applicable terms.

---

**JamiiLink · Amos Kariuki · Nairobi, Kenya**
