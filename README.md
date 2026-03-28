# RenatalWPA — House rental PWA

Monorepo: Express + MongoDB backend (`backend/`) and Vite + React frontend (`frontend/`).

## Backend setup

1. Copy environment template and fill in real values (never commit the copy):

   ```bash
   cp backend/.env.example backend/.env
   ```

2. **`backend/.env` is required** to run the API. Keep it out of version control (see `.gitignore`).

3. **JWT secret (production):** use a long random value, for example:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Set the output as `JWT_SECRET` in `backend/.env`. In production, the server **exits on startup** if `JWT_SECRET` is missing, shorter than 32 characters, or still set to the placeholder strings from `.env.example`.

4. **Production:** set `NODE_ENV=production` and ensure `MONGODB_URI`, `FRONTEND_URL`, and a strong `JWT_SECRET` are set. Behind Nginx, Render, Railway, or similar, the app uses `trust proxy` so rate limits use the real client IP.

## Pre-push checklist (secrets)

- Run `git status` and confirm `backend/.env` is not staged.
- Search the diff for connection strings or `JWT_SECRET=` before pushing.

## Run locally

- Backend: `cd backend && npm install && npm run dev` (expects MongoDB reachable at `MONGODB_URI`).
- Frontend: `cd frontend && npm install && npm run dev`

### Frontend / deploy (`VITE_API_URL`)

1. Copy `frontend/.env.example` to `frontend/.env` (or `.env.production` for production builds).
2. Set `VITE_API_URL` to your API root **including** `/api`, e.g. `http://localhost:5000/api` or `https://your-api.example.com/api`.
3. Rebuild the frontend after changing env vars (`npm run build`). Hosting platforms (Vercel, Netlify, etc.) can inject `VITE_API_URL` in the project environment settings instead of a file.

## Rate limiting

The API applies per-IP limits: a stricter window on `/api/auth` and a baseline limit on all `/api/*` routes. Repeated abuse returns HTTP **429**.

## Inquiries / messaging

Customer–owner chat is built on **inquiries**: one thread per property + renter + owner, with an initial message and threaded replies. API details are in [API_DOCS.md](API_DOCS.md); screen behavior is summarized in [UI_FLOW.md](UI_FLOW.md). The Messages screen lives at `/inquiries` in the frontend.

## Email and password reset

- **Registration (email verification):** For now the verification code is **only printed in the API server terminal** (watch the `nodemon` / `node` window after sign-up). No SMTP is used for OTP until you change that in `authController.js`.
- **Forgot password:** With `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` (or `EMAIL_USER` as fallback) set, reset links are sent by email using `FRONTEND_URL`. If email is not configured, the reset token and URL are logged on the server console (development-style).
