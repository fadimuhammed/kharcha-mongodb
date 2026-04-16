const express  = require('express');
const mongoose = require('mongoose');
const Expense  = require('../models/Expense');
const auth     = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// POST /api/ai/ask
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const uid = new mongoose.Types.ObjectId(req.user._id);

    // Pull context from MongoDB
    const [totals, byCategory, monthly, recent] = await Promise.all([
      Expense.aggregate([
        { $match: { user: uid } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { user: uid } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
      ]),
      Expense.aggregate([
        { $match: { user: uid } },
        { $group: {
            _id:   { $dateToString: { format: '%Y-%m', date: '$date' } },
            total: { $sum: '$amount' },
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 3 },
      ]),
      Expense.find({ user: uid })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalSpent = totals[0]?.total || 0;
    const txCount    = totals[0]?.count || 0;

    const context = `
User: ${req.user.name}
Total spent: ₹${totalSpent.toLocaleString('en-IN')} across ${txCount} transactions
Top categories: ${byCategory.map(c => `${c._id}: ₹${c.total.toLocaleString('en-IN')}`).join(', ')}
Recent 3 months: ${monthly.map(m => `${m._id}: ₹${m.total.toLocaleString('en-IN')}`).join(', ')}
Recent expenses: ${JSON.stringify(recent.map(e => ({ desc: e.description, amount: e.amount, category: e.category, date: e.date.toISOString().slice(0, 10) })))}
    `.trim();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: `You are a concise, friendly personal finance advisor for an Indian expense tracker app called Kharcha.
The user's expense data: ${context}
Give practical, specific advice in 2-4 sentences. Use ₹ for amounts. Be warm but direct.`,
        messages: [{ role: 'user', content: question }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Anthropic API error');
    }

    res.json({ reply: data.content[0].text });
  } catch (err) {
    console.error('AI route error:', err.message);
    res.status(502).json({ error: 'AI service unavailable. Check your ANTHROPIC_API_KEY.' });
  }
});

module.exports = router;
