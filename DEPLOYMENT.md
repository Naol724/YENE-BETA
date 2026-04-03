# Deployment Guide (Frontend and Backend Separately)

This project is ready to deploy as two independent services:

- `backend/` -> Node.js API
- `frontend/` -> static Vite app

## 1) Deploy backend (API)

Use any Node host (Render, Railway, Fly.io, VPS, etc.).

### Backend required environment variables

- `NODE_ENV=production`
- `PORT` (provider can set this automatically)
- `MONGODB_URI` (or `MONGODB_USER` + `MONGODB_PASSWORD`)
- `JWT_SECRET` (must be strong, min 32 chars)
- `FRONTEND_URL` (your deployed frontend URL, e.g. `https://app.example.com`)

Optional: email and M-Pesa variables from `backend/.env.example`.

### Backend start command

```bash
npm start
```

### Backend build command

No build step is required for this API.

## 2) Deploy frontend (SPA)

Use any static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront, etc.).

### Frontend required environment variable (build-time)

- `VITE_API_URL` -> public API URL including `/api`
  - Example: `https://api.example.com/api`

### Frontend build command

```bash
npm run build
```

### Frontend publish directory

`frontend/dist`

## 3) CORS and connectivity checklist

Before going live:

1. Set backend `FRONTEND_URL` to your frontend production origin.
2. Set frontend `VITE_API_URL` to your backend production API URL (with `/api`).
3. Confirm `GET <API_URL>/health` returns success.
4. Confirm browser calls to auth/listings routes succeed without CORS errors.

## 4) Docker (optional, separate containers)

Dockerfiles are included for both services:

- `backend/Dockerfile`
- `frontend/Dockerfile`

### Build images

```bash
npm run docker:build:backend
npm run docker:build:frontend
```

By default, `docker:build:frontend` uses `VITE_API_URL=http://localhost:5000/api`.
Override it in CI/CD:

```bash
docker build -t renatalwpa-frontend --build-arg VITE_API_URL=https://api.example.com/api ./frontend
```

### Run containers locally

```bash
npm run docker:run:backend
npm run docker:run:frontend
```

Frontend will be available at `http://localhost:8080`.

