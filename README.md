# IEEE Computer Society SBC MITS — College Chapter Website

Full-stack website for the IEEE CS student chapter.

| Layer    | Tech                                                                   |
| -------- | ---------------------------------------------------------------------- |
| Frontend | React 18, TypeScript, Vite, React Router 6, Axios, TanStack Query      |
| Backend  | Node.js, Express 4, Mongoose, JWT, bcryptjs, helmet, express-validator |
| Database | MongoDB 6+                                                             |

---

## Repository layout

```
ieee-cs-website/
├── backend/                   # Express API
│   ├── src/
│   │   ├── config/env.js      # validated env vars
│   │   ├── db/
│   │   │   ├── connection.js  # mongoose connect()
│   │   │   ├── syncIndexes.js # `npm run db:sync-indexes`
│   │   │   └── seed.js        # `npm run db:seed`
│   │   ├── middleware/        # auth, asyncHandler, errorHandler, rateLimits, validate
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # auth, events, officeBearers, misc
│   │   ├── utils/             # HttpError, buildUpdate
│   │   ├── validators/        # express-validator schemas
│   │   └── index.js           # app entrypoint
│   ├── .env.example
│   └── package.json
├── frontend/                  # Vite + React SPA
│   ├── src/
│   │   ├── components/        # Navbar, Footer, …
│   │   ├── context/           # AuthContext (JWT)
│   │   ├── pages/             # route views
│   │   ├── services/api.ts    # axios client
│   │   └── styles/            # global CSS
│   ├── .env.example
│   └── package.json
├── package.json               # workspace helper scripts
└── vercel.json                # SPA rewrites
```

---

## Prerequisites

| Tool         | Version              | Notes                                                                  |
| ------------ | -------------------- | ---------------------------------------------------------------------- |
| Node.js      | 18 LTS or 20 LTS     | `node --version`                                                       |
| npm          | 9+                   | ships with Node                                                        |
| MongoDB      | 6.x or 7.x           | local server **or** a free MongoDB Atlas cluster                       |
| Git          | any recent           | for cloning                                                            |

> Windows users: the project is tested on Windows 11 with PowerShell and Git Bash. Commands below use bash syntax; in PowerShell, swap `&&` for `;` or run each command separately.

---

## 1. Clone & install

```bash
git clone <your-repo-url> ieee-cs-website
cd ieee-cs-website
npm run install:all     # installs both backend/ and frontend/ deps
```

Or install them individually:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

---

## 2. Provision MongoDB

You need a running MongoDB instance and a connection string (URI). Pick **one**:

### Option A — Local MongoDB

1. Install MongoDB Community Server: <https://www.mongodb.com/try/download/community>.
2. Start the service:
   - **macOS (Homebrew)**: `brew services start mongodb-community`
   - **Linux (systemd)**: `sudo systemctl start mongod`
   - **Windows**: MongoDB is installed as a Windows service named `MongoDB` — start it from `services.msc` or run `net start MongoDB` in an admin shell.
3. Verify it's listening:
   ```bash
   mongosh "mongodb://127.0.0.1:27017"
   ```
4. Your URI is:
   ```
   mongodb://127.0.0.1:27017/ieee_cs
   ```
   Mongoose will create the `ieee_cs` database on first write — no manual `CREATE DATABASE` step required.

### Option B — MongoDB Atlas (cloud, free tier)

1. Sign up at <https://www.mongodb.com/cloud/atlas> and create a free **M0** cluster.
2. **Database Access** → create a user (e.g. `ieeecs`) with a strong password.
3. **Network Access** → allow your IP (or `0.0.0.0/0` for dev).
4. **Database** → *Connect* → *Drivers* → copy the URI. It looks like:
   ```
   mongodb+srv://ieeecs:<password>@cluster0.xxxxx.mongodb.net/ieee_cs?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the URL-encoded password and append the database name (`/ieee_cs`).

---

## 3. Configure environment variables

### 3a. Backend — `backend/.env`

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in at minimum:

| Variable              | Required | Example                                          | Notes                                                                       |
| --------------------- | -------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| `PORT`                | no       | `5000`                                           | API port                                                                    |
| `NODE_ENV`            | no       | `development` / `production`                     | toggles dev-vs-prod error verbosity, error logging, autoIndex behavior      |
| `TRUST_PROXY`         | no       | `false`                                          | set `true` only when behind a proxy (nginx, Render, Fly, etc.)              |
| `FRONTEND_URL`        | no       | `http://localhost:5173`                          | comma-separated allowlist for CORS                                          |
| `MONGODB_URI`         | **yes**  | `mongodb://127.0.0.1:27017/ieee_cs`              | the URI from step 2                                                         |
| `MONGOOSE_AUTO_INDEX` | no       | `true` (dev) / `false` (prod)                    | when `false`, you must run `npm run db:sync-indexes` after schema changes   |
| `JWT_SECRET`          | **yes**  | (random 64 hex chars)                            | generate with `openssl rand -hex 64` or `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN`      | no       | `7d`                                             | any [vercel/ms](https://github.com/vercel/ms) duration                      |
| `BCRYPT_ROUNDS`       | no       | `12`                                             | bcrypt cost factor (10–14)                                                  |
| `SEED_ADMIN_EMAIL`    | seed     | `admin@ieeecs.ac.in`                             | only needed when running `db:seed`                                          |
| `SEED_ADMIN_PASSWORD` | seed     | ≥ 12 characters                                  | only needed when running `db:seed`. Refuses to run if shorter or missing.   |

The server **will not start** if `MONGODB_URI` or `JWT_SECRET` is missing — it fails fast with a clear error.

### 3b. Frontend — `frontend/.env`

```bash
cd ../frontend
cp .env.example .env
```

Single variable:

```
VITE_API_URL=http://localhost:5000/api
```

In production set it to your deployed backend URL, e.g. `https://api.your-domain.com/api`.

---

## 4. Initialize the database

From `backend/`:

```bash
# Build all indexes (compound unique on event_registrations, etc.).
# Safe to re-run.
npm run db:sync-indexes

# Optional: seed an admin user, sample events, and the office-bearer list.
# Requires SEED_ADMIN_PASSWORD in .env (≥ 12 chars).
npm run db:seed
```

The same scripts can be invoked from the repo root:

```bash
npm run db:sync-indexes
npm run db:seed
```

---

## 5. Run in development

You need **two terminals**.

**Terminal 1 — backend**

```bash
cd backend
npm run dev
# → 🚀 IEEE CS API running on http://localhost:5000 [development]
```

`npm run dev` uses `nodemon`, so it auto-reloads on file changes.

**Terminal 2 — frontend**

```bash
cd frontend
npm run dev
# → VITE  ready in xxx ms
#   ➜ Local: http://localhost:5173/
```

Open <http://localhost:5173>. The Vite dev server proxies your API calls through Axios to `VITE_API_URL` (the backend). CORS is already configured to accept `http://localhost:5173`.

### Verify the connection

```bash
curl http://localhost:5000/health
# {"success":true,"message":"IEEE CS API is running","db":"connected","timestamp":"…"}
```

If `db` reports anything other than `connected`, check `MONGODB_URI` and that MongoDB is actually running.

---

## 6. Default admin login

After running `npm run db:seed` you can log in at <http://localhost:5173/admin/login> with:

```
Email:    <whatever SEED_ADMIN_EMAIL you set>
Password: <whatever SEED_ADMIN_PASSWORD you set>
```

There is **no** hardcoded default password — the seed script refuses to run without one.

---

## 7. How the two halves connect

```
┌──────────────┐  HTTPS/JSON  ┌──────────────┐   Mongoose   ┌──────────────┐
│  React SPA   │ ───────────▶ │ Express API  │ ───────────▶ │   MongoDB    │
│ (Vite, 5173) │  Bearer JWT  │ (Node, 5000) │              │  (27017)     │
└──────────────┘              └──────────────┘              └──────────────┘
        ▲                              │
        └──── Authorization: Bearer ───┘
              (JWT stored in localStorage as `ieee_token`)
```

- **Axios client** ([frontend/src/services/api.ts](frontend/src/services/api.ts)) reads `VITE_API_URL` and attaches `Authorization: Bearer <token>` to every request when a token exists in `localStorage` under the key `ieee_token`.
- **CORS** ([backend/src/index.js](backend/src/index.js)) accepts only origins listed in `FRONTEND_URL` (comma-separated). Update it for every deployment URL.
- **JWT** is signed with `JWT_SECRET` and verified by `authMiddleware`. `adminOnly` guards admin routes.
- **Rate limits**: global 300 req / 15 min on `/api`; 10 failed logins / 15 min; 20 public-write submissions / 10 min.

---

## 8. API reference

All responses follow `{ success: boolean, ... }`. Errors look like `{ success: false, message: "...", details?: [...] }`.

### Auth

| Method | Path             | Auth  | Body                            |
| ------ | ---------------- | ----- | ------------------------------- |
| POST   | `/api/auth/login`| —     | `{ email, password }`           |
| GET    | `/api/auth/me`   | JWT   | —                               |

### Events

| Method | Path                                | Auth  | Notes                                                              |
| ------ | ----------------------------------- | ----- | ------------------------------------------------------------------ |
| GET    | `/api/events`                       | —     | query: `status`, `type`, `featured=true`, `limit` (≤100), `offset` |
| GET    | `/api/events/:id`                   | —     | `:id` must be a valid Mongo ObjectId                               |
| POST   | `/api/events`                       | admin | full event body                                                    |
| PUT    | `/api/events/:id`                   | admin | partial update (whitelisted fields only)                           |
| DELETE | `/api/events/:id`                   | admin | also deletes its `event_registrations`                             |
| POST   | `/api/events/:id/register`          | —     | atomic capacity check + unique `(event_id, email)`                 |
| GET    | `/api/events/:id/registrations`     | admin | —                                                                  |

### Office bearers

| Method | Path                          | Auth  |
| ------ | ----------------------------- | ----- |
| GET    | `/api/office-bearers`         | —     |
| POST   | `/api/office-bearers`         | admin |
| PUT    | `/api/office-bearers/:id`     | admin |
| DELETE | `/api/office-bearers/:id`     | admin |

### Gallery

| Method | Path                  | Auth  |
| ------ | --------------------- | ----- |
| GET    | `/api/gallery`        | —     |
| POST   | `/api/gallery`        | admin |
| DELETE | `/api/gallery/:id`    | admin |

### Membership

| Method | Path                              | Auth  |
| ------ | --------------------------------- | ----- |
| POST   | `/api/membership/apply`           | —     |
| GET    | `/api/membership`                 | admin |
| PUT    | `/api/membership/:id/status`      | admin |

### Contact

| Method | Path             | Auth  |
| ------ | ---------------- | ----- |
| POST   | `/api/contact`   | —     |
| GET    | `/api/contact`   | admin |

### Health

| Method | Path       | Auth |
| ------ | ---------- | ---- |
| GET    | `/health`  | —    |

---

## 9. Production build

### Frontend

```bash
cd frontend
npm run build       # outputs frontend/dist/
npm run preview     # local preview of the production build
```

### Backend

```bash
cd backend
NODE_ENV=production npm start
```

In production:
- `MONGOOSE_AUTO_INDEX` is forced to `false` — run `npm run db:sync-indexes` once during deploy.
- `helmet`, `compression`, and `morgan` (combined log format) are active.
- Error messages with status ≥ 500 are masked (`"Internal server error"`); stack traces are never returned to the client.

---

## 10. Deployment

### Frontend on Vercel

1. Import the repo in Vercel.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variable**: `VITE_API_URL=https://api.your-domain.com/api`
6. Vercel uses `vercel.json` for SPA route rewrites — every path falls back to `index.html` for React Router.

### Backend on Render / Railway / Fly.io

1. **Build command**: `npm install`
2. **Start command**: `npm start`
3. **Root directory**: `backend`
4. **Environment variables** (paste from your `.env`, except `SEED_*` which are only needed for the seed step):
   - `NODE_ENV=production`
   - `MONGODB_URI=...`
   - `JWT_SECRET=...`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `TRUST_PROXY=true`  *(required if the platform terminates TLS in front of Node — Render, Fly, Railway all do)*
5. **One-time post-deploy**: shell into the instance (or use a release task) and run `npm run db:sync-indexes`.

### Database

- **MongoDB Atlas** (recommended) — free M0 tier is enough for development and small production.
- Add the deployment platform's egress IPs to Atlas Network Access (or `0.0.0.0/0` for simplicity, paired with strong DB credentials).

---

## 11. Troubleshooting

| Symptom                                                          | Likely cause / fix                                                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `❌ Missing required environment variables: MONGODB_URI`         | You haven't created `backend/.env`, or `MONGODB_URI` is empty.                                                                       |
| `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017` | MongoDB isn't running locally. Start it (see step 2A) or switch to an Atlas URI.                                                  |
| Atlas: `bad auth: Authentication failed`                         | The user/password in the URI is wrong, or the password contains special chars that aren't URL-encoded.                               |
| `CORS blocked: http://...`                                       | The origin isn't in `FRONTEND_URL`. Add it (comma-separated for multiple).                                                           |
| `429 Too many login attempts`                                    | The auth rate limiter tripped (10 failed logins / 15 min per IP). Wait it out, or in dev edit `backend/src/middleware/rateLimits.js`. |
| `id must be a valid Mongo ObjectId`                              | The URL path contains an ID that isn't 24-hex-character ObjectId. Most likely a leftover UUID from the old Postgres version.         |
| Frontend gets 404 from `/api/...`                                | `VITE_API_URL` is wrong or the backend isn't running on the port it points at. Hit `/health` directly to confirm.                    |
| Seed fails: `SEED_ADMIN_PASSWORD must be at least 12 characters` | Set a longer password in `backend/.env`.                                                                                             |
| `npm run db:seed` says "duplicate key"                           | The seed script is idempotent — duplicates are safely ignored via `$setOnInsert`. If you see this it's something else; check the log.|

---

## 12. Useful commands cheat-sheet

From **`backend/`**:

| Command                       | What it does                                            |
| ----------------------------- | ------------------------------------------------------- |
| `npm run dev`                 | start with nodemon                                      |
| `npm start`                   | start without auto-reload (production)                  |
| `npm run lint`                | ESLint                                                  |
| `npm run db:sync-indexes`     | create/update all Mongoose indexes                      |
| `npm run db:seed`             | upsert admin user, sample events, office bearers        |

From **`frontend/`**:

| Command                       | What it does                                            |
| ----------------------------- | ------------------------------------------------------- |
| `npm run dev`                 | Vite dev server on port 5173                            |
| `npm run build`               | production build → `dist/`                              |
| `npm run preview`             | serve the production build locally                      |
| `npm run lint`                | ESLint                                                  |

From the **repo root**:

| Command                       | What it does                                            |
| ----------------------------- | ------------------------------------------------------- |
| `npm run install:all`         | install both backend and frontend dependencies          |
| `npm run dev:backend`         | shortcut for `cd backend && npm run dev`                |
| `npm run dev:frontend`        | shortcut for `cd frontend && npm run dev`               |
| `npm run db:sync-indexes`     | run the backend's index sync                            |
| `npm run db:seed`             | run the backend's seed script                           |

---

Made for IEEE CS chapters.
