const mongoose = require('mongoose');

const CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Health',
  'Shopping', 'Entertainment', 'Utilities', 'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,
    },
    description: {
      type:     String,
      required: [true, 'Description is required'],
      trim:     true,
      maxlength: [200, 'Description too long'],
    },
    amount: {
      type:     Number,
      required: [true, 'Amount is required'],
      min:      [0.01, 'Amount must be positive'],
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     { values: CATEGORIES, message: '{VALUE} is not a valid category' },
    },
    date: {
      type:     Date,
      required: [true, 'Date is required'],
      index:    true,
    },
  },
  { timestamps: true }
);

// Compound index for fast per-user date-sorted queries
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
module.exports.CATEGORIES = CATEGORIES;
