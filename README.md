# TaskFlow — Project Management Platform

> A real-time, multi-workspace task board with role-based access control.
> Built with **Next.js · Node.js · Express · MongoDB · Tailwind CSS · Socket.io · JWT**.

![stack](https://img.shields.io/badge/stack-MERN%20%2B%20Next.js-6366f1) ![socket](https://img.shields.io/badge/realtime-Socket.io-10b981) ![auth](https://img.shields.io/badge/auth-JWT%20%2B%20bcrypt-f59e0b)

TaskFlow lets teams organise work across multiple workspaces on a Kanban-style board. Every change — creating a task, dragging between columns, updating a member's role — is pushed to all connected clients instantly via WebSockets. Access is enforced on the server with a 4-tier role system (owner / admin / member / viewer), not just hidden in the UI.

---

## Features

- **Authentication** — JWT-based auth with bcrypt password hashing and rate limiting
- **Multi-workspace** — Create unlimited workspaces, each with its own invite code
- **Role-based access control** — 4 roles (owner, admin, member, viewer) enforced server-side
- **Real-time Kanban board** — Drag-and-drop across `To do` / `In progress` / `Done`; every client sees the change instantly
- **Task management** — Title, description, priority, assignee, due date, column order
- **Member management** — Invite via code, promote/demote roles, remove members
- **Optimistic UI** — Drag feels instant, server confirms in background
- **Production hardening** — Helmet, CORS, express-rate-limit, input validation, error middleware

## Architecture

```
┌──────────────────────────┐         ┌──────────────────────────┐
│  Next.js 14 (App Router) │◄───────►│  Express 4 REST API      │
│  · TypeScript            │  HTTPS  │  · JWT middleware        │
│  · Tailwind CSS          │         │  · RBAC middleware       │
│  · Socket.io client      │◄──ws───►│  · Socket.io server      │
└──────────────────────────┘         └────────────┬─────────────┘
                                                   │
                                                   ▼
                                     ┌──────────────────────────┐
                                     │  MongoDB (Mongoose)      │
                                     │  · User / Workspace /    │
                                     │    Task collections      │
                                     └──────────────────────────┘
```

### Repository layout

```
taskflow/
├── backend/            Express + MongoDB + Socket.io
│   └── src/
│       ├── config/     DB connection
│       ├── models/     Mongoose schemas
│       ├── controllers/ Route handlers
│       ├── middleware/ auth + RBAC + error
│       ├── routes/     REST routes
│       ├── socket/     Socket.io setup
│       ├── utils/      Token signing, seed script
│       ├── app.js      Express app
│       └── server.js   HTTP + Socket.io boot
│
└── frontend/           Next.js 14 app
    └── src/
        ├── app/        Routes (login, register, dashboard, workspaces/[id])
        ├── components/ Shared UI (Topbar)
        ├── context/    AuthContext
        └── lib/        api client, socket hook
```

---

## Getting started

### Prerequisites

- **Node.js 18+**
- **MongoDB** — either local (`mongodb://127.0.0.1:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

### 1 · Clone & install

```bash
git clone https://github.com/<your-username>/taskflow.git
cd taskflow

# Backend
cd backend
cp .env.example .env          # then edit .env with your values
npm install

# Frontend
cd ../frontend
cp .env.example .env.local
npm install
```

### 2 · Configure environment

**`backend/.env`**
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=replace_me_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

**`frontend/.env.local`**
```ini
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3 · (Optional) Seed demo data

```bash
cd backend
npm run seed
```

Creates three users and one workspace with eight tasks across the three columns:

| Email                 | Password      | Role   |
| --------------------- | ------------- | ------ |
| hashir@taskflow.dev   | password123   | owner  |
| aisha@taskflow.dev    | password123   | admin  |
| omar@taskflow.dev     | password123   | member |

### 4 · Run in development

Open **two** terminals:

```bash
# terminal 1 — backend
cd backend && npm run dev
# → http://localhost:5000

# terminal 2 — frontend
cd frontend && npm run dev
# → http://localhost:3000
```

Visit [http://localhost:3000](http://localhost:3000) and sign in with one of the seeded accounts, or register a new one.

**To see real-time sync in action:** open the workspace in two browsers (or a normal window + an incognito window) logged in as different users and drag a card — it moves in both instantly.

---

## API reference

All routes prefixed with `/api`. Auth routes are rate-limited to 30 requests per 15 min.

| Method | Path                                                  | Auth | Role     | Purpose                            |
| ------ | ----------------------------------------------------- | :--: | -------- | ---------------------------------- |
| POST   | `/auth/register`                                      |      |          | Create account, returns JWT        |
| POST   | `/auth/login`                                         |      |          | Sign in, returns JWT               |
| GET    | `/auth/me`                                            |  ✓   |          | Get current user                   |
| GET    | `/workspaces`                                         |  ✓   |          | List my workspaces                 |
| POST   | `/workspaces`                                         |  ✓   |          | Create workspace                   |
| POST   | `/workspaces/join`                                    |  ✓   |          | Join by invite code                |
| GET    | `/workspaces/:id`                                     |  ✓   | member+  | Get workspace details              |
| PATCH  | `/workspaces/:id`                                     |  ✓   | admin+   | Update workspace                   |
| DELETE | `/workspaces/:id`                                     |  ✓   | owner    | Delete workspace + all tasks       |
| PATCH  | `/workspaces/:id/members/:memberId`                   |  ✓   | admin+   | Change member role                 |
| DELETE | `/workspaces/:id/members/:memberId`                   |  ✓   | admin/self | Remove member / leave            |
| GET    | `/workspaces/:wsId/tasks`                             |  ✓   | viewer+  | List tasks                         |
| POST   | `/workspaces/:wsId/tasks`                             |  ✓   | member+  | Create task                        |
| PATCH  | `/workspaces/:wsId/tasks/:taskId`                     |  ✓   | member+  | Update task                        |
| DELETE | `/workspaces/:wsId/tasks/:taskId`                     |  ✓   | member+  | Delete task                        |
| POST   | `/workspaces/:wsId/tasks/:taskId/move`                |  ✓   | member+  | Change status/order (Kanban drag)  |

### WebSocket events

After connecting with `{ auth: { token } }`, a client emits `workspace:join` with a workspace ID. It then receives:

| Event            | Payload            | When                |
| ---------------- | ------------------ | ------------------- |
| `task:created`   | Populated task     | A member creates a task |
| `task:updated`   | Populated task     | A task is edited    |
| `task:moved`     | Populated task     | A task changes column/order |
| `task:deleted`   | `{ _id }`          | A task is removed   |

---

## Role-based access control

Roles form a strict hierarchy: **owner > admin > member > viewer**.

| Capability                            | owner | admin | member | viewer |
| ------------------------------------- | :---: | :---: | :----: | :----: |
| View workspace & tasks                |   ✓   |   ✓   |   ✓    |   ✓    |
| Create / edit / move / delete tasks   |   ✓   |   ✓   |   ✓    |        |
| Edit workspace name / description     |   ✓   |   ✓   |        |        |
| Promote / demote / remove members     |   ✓   |   ✓   |        |        |
| Delete workspace                      |   ✓   |       |        |        |

Enforced in `backend/src/middleware/rbac.js` — the frontend hides unavailable controls, but the server is the source of truth.

---

## Testing

The backend was built against a comprehensive integration test suite (in-memory MongoDB via `mongodb-memory-server` + `supertest`) covering **34 scenarios**: registration, login, token verification, workspace CRUD, invite-code joining, role promotion/demotion, RBAC boundaries for all 4 roles, task assignment validation, task movement, and workspace deletion. All 34 cases pass on a clean install.

---

## Production build

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm start
```

For deployment, consider:
- **Backend**: Railway, Render, or a Docker container on a VPS
- **Frontend**: Vercel (one-click), or the same VPS with a Node process
- **Database**: MongoDB Atlas free tier

---

## Built with

- [Next.js 14](https://nextjs.org/) · App Router, TypeScript, SSR
- [Tailwind CSS](https://tailwindcss.com/) · Utility-first styling
- [Express 4](https://expressjs.com/) · REST API
- [MongoDB + Mongoose](https://mongoosejs.com/) · Data layer
- [Socket.io](https://socket.io/) · Real-time layer
- [JWT](https://jwt.io/) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) · Auth
- [Helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [express-validator](https://express-validator.github.io/) · Hardening
- [Lucide React](https://lucide.dev/) · Icons
- **Fonts**: Cormorant Garamond (display) + Jost (body)

---

## License

MIT
