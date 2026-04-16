require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const authRoutes    = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const aiRoutes      = require('./routes/ai');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://fadimuhammed.github.io"
  ],
  credentials: true
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Kharcha API is running 🚀");
});
app.use('/api/auth',     authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai',       aiRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: 'mongodb' }));

// 404
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
(async () => {
  await connectDB();          // exits with code 1 on failure
  app.listen(PORT, () => {
    console.log(`🚀 Kharcha API → http://localhost:${PORT}`);
  });
})();
