const express = require('express');
const mongoose = require('mongoose');
const Expense  = require('../models/Expense');
const auth     = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ── GET /api/expenses ────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, month, limit = 100, offset = 0 } = req.query;
    const filter = { user: req.user._id };

    if (category && category !== 'All') filter.category = category;
    if (month) {
      const [y, m] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(y, m - 1, 1),
        $lt:  new Date(y, m, 1),
      };
    }

    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .lean();

    // Serialize date as YYYY-MM-DD string for the frontend
    const result = expenses.map(e => ({
      ...e,
      id:   e._id,
      date: e.date.toISOString().slice(0, 10),
    }));

    res.json(result);
  } catch (err) {
    console.error('GET /expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// ── GET /api/expenses/summary ────────────────────────────────────────────────
router.get('/summary', async (req, res) => {
  try {
    const uid = req.user._id;

    const [monthly, byCategory, monthlyByCategory] = await Promise.all([
      // Monthly totals
      Expense.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(uid) } },
        { $group: {
            _id:   { $dateToString: { format: '%Y-%m', date: '$date' } },
            total: { $sum: '$amount' },
          }
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: '$_id', total: 1 } },
      ]),

      // Category totals
      Expense.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(uid) } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
        { $project: { _id: 0, category: '$_id', total: 1 } },
      ]),

      // Monthly × category breakdown
      Expense.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(uid) } },
        { $group: {
            _id: {
              month:    { $dateToString: { format: '%Y-%m', date: '$date' } },
              category: '$category',
            },
            total: { $sum: '$amount' },
          }
        },
        { $sort: { '_id.month': 1 } },
        { $project: { _id: 0, month: '$_id.month', category: '$_id.category', total: 1 } },
      ]),
    ]);

    res.json({ monthly, byCategory, monthlyByCategory });
  } catch (err) {
    console.error('GET /expenses/summary:', err);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ── POST /api/expenses ───────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;

    if (!description || !amount || !category || !date) {
      return res.status(400).json({ error: 'description, amount, category and date are required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      description: description.trim(),
      amount:      Number(amount),
      category,
      date:        new Date(date),
    });

    res.status(201).json({ ...expense.toObject(), id: expense._id, date: expense.date.toISOString().slice(0, 10) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('. ');
      return res.status(400).json({ error: msg });
    }
    console.error('POST /expenses:', err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// ── PUT /api/expenses/:id ────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const { description, amount, category, date } = req.body;
    const updates = {};
    if (description !== undefined) updates.description = description.trim();
    if (amount      !== undefined) updates.amount      = Number(amount);
    if (category    !== undefined) updates.category    = category;
    if (date        !== undefined) updates.date        = new Date(date);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    res.json({ ...expense.toObject(), id: expense._id, date: expense.date.toISOString().slice(0, 10) });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join('. ');
      return res.status(400).json({ error: msg });
    }
    console.error('PUT /expenses/:id:', err);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// ── DELETE /api/expenses/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('DELETE /expenses/:id:', err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
