# Kharcha — Expense Tracker

A full-stack expense tracker with JWT auth, **MongoDB** database, React frontend, and an AI finance advisor powered by Claude.

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18 + Vite + React Router v6       |
| Charts   | Chart.js 4 + react-chartjs-2            |
| Backend  | Node.js + Express                       |
| Database | MongoDB + Mongoose                      |
| Auth     | JWT (jsonwebtoken) + bcryptjs           |
| AI       | Anthropic Claude API (claude-sonnet-4)  |

## Project Structure

```
kharcha/
├── .gitignore
├── README.md
├── backend/
│   ├── config/
│   │   └── db.js              # Mongoose connection (exits 1 on failure)
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── models/
│   │   ├── User.js            # User schema + bcrypt hooks
│   │   └── Expense.js         # Expense schema + indexes
│   ├── routes/
│   │   ├── auth.js            # POST /api/auth/login|register
│   │   ├── expenses.js        # GET|POST|PUT|DELETE /api/expenses
│   │   └── ai.js              # POST /api/ai/ask
│   ├── scripts/
│   │   └── seed.js            # Demo data seeder
│   ├── server.js              # Express entry point
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx              # Router + protected routes
        ├── index.css
        ├── components/
        │   ├── Layout.jsx       # Sticky navbar + page wrapper
        │   └── ExpenseModal.jsx # Add / Edit modal
        ├── context/
        │   └── AuthContext.jsx  # Global JWT auth state
        ├── hooks/
        │   └── useExpenses.js   # Data fetching + CRUD hook
        ├── pages/
        │   ├── LoginPage.jsx    # Login + Register tabs
        │   ├── DashboardPage.jsx # Charts + stat cards
        │   ├── ExpensesPage.jsx  # Full list + filters
        │   └── AiPage.jsx        # Claude AI advisor chat
        └── utils/
            └── api.js           # Axios instance + interceptors
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/kharcha.git
cd kharcha
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/kharcha
JWT_SECRET=change_this_to_a_long_random_string
ANTHROPIC_API_KEY=sk-ant-...
```

Seed demo data (optional):

```bash
npm run seed
```

Start the server:

```bash
npm run dev      # nodemon hot-reload
npm start        # production
```

API available at **http://localhost:5000**

> If MongoDB is unreachable, the server exits with **code 1** immediately.

### 3. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

App available at **http://localhost:5173** — Vite proxies `/api/*` to the backend.

## Demo Accounts

| Username | Password  |
|----------|-----------|
| alice    | alice123  |
| bob      | bob456    |

Run `npm run seed` in the backend folder to create them.

## API Reference

### Auth
| Method | Endpoint            | Body                          | Description     |
|--------|---------------------|-------------------------------|-----------------|
| POST   | /api/auth/register  | `{username, name, password}`  | Create account  |
| POST   | /api/auth/login     | `{username, password}`        | Login → JWT     |

### Expenses *(Bearer token required)*
| Method | Endpoint               | Description                        |
|--------|------------------------|------------------------------------|
| GET    | /api/expenses          | List (filter: `?category=&month=`) |
| GET    | /api/expenses/summary  | Monthly totals + category breakdown |
| POST   | /api/expenses          | Create expense                     |
| PUT    | /api/expenses/:id      | Update expense                     |
| DELETE | /api/expenses/:id      | Delete expense                     |

### AI
| Method | Endpoint     | Body          | Description                    |
|--------|--------------|---------------|--------------------------------|
| POST   | /api/ai/ask  | `{question}`  | Ask Claude about your spending |

## Features

- **MongoDB + Mongoose** — schemas, indexes, aggregation pipelines
- **JWT auth** — 7-day tokens, auto-logout on 401
- **Dashboard** — stat cards, stacked bar chart (last 6 months), donut chart by category
- **Expenses** — full CRUD, filter by category + month, delete confirmation
- **AI Advisor** — Claude reads live MongoDB data and gives personalised advice
- **Protected routes** — unauthenticated users redirected to `/login`
- **Exit code 1** — server exits immediately if MongoDB connection fails

## Deployment

**Backend** → Railway / Render / Fly.io. Set env vars in the platform dashboard.

**Frontend** → `npm run build` produces `dist/`. Deploy to Vercel / Netlify / GitHub Pages.

For production, set `CLIENT_URL` in backend `.env` to your deployed frontend URL.

## License

MIT
