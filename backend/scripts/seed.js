require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');
const Expense  = require('../models/Expense');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe existing demo users
    const alice = await User.findOneAndDelete({ username: 'alice' });
    const bob   = await User.findOneAndDelete({ username: 'bob' });
    if (alice) await Expense.deleteMany({ user: alice._id });
    if (bob)   await Expense.deleteMany({ user: bob._id });

    // Create users
    const [aliceUser, bobUser] = await User.create([
      { username: 'alice', name: 'Alice Chen',  password: 'alice123' },
      { username: 'bob',   name: 'Bob Kumar',   password: 'bob456'   },
    ]);

    const mkDate = (str) => new Date(str);

    // Alice's expenses
    await Expense.insertMany([
      { user: aliceUser._id, description: 'Grocery shopping',    amount: 2800,  category: 'Food',          date: mkDate('2025-01-12') },
      { user: aliceUser._id, description: 'Uber ride',           amount: 320,   category: 'Transport',     date: mkDate('2025-01-14') },
      { user: aliceUser._id, description: 'Netflix subscription',amount: 649,   category: 'Entertainment', date: mkDate('2025-01-15') },
      { user: aliceUser._id, description: 'Electricity bill',    amount: 1200,  category: 'Utilities',     date: mkDate('2025-02-03') },
      { user: aliceUser._id, description: 'Restaurant dinner',   amount: 1850,  category: 'Food',          date: mkDate('2025-02-10') },
      { user: aliceUser._id, description: 'Bus pass',            amount: 500,   category: 'Transport',     date: mkDate('2025-02-15') },
      { user: aliceUser._id, description: 'Gym membership',      amount: 900,   category: 'Health',        date: mkDate('2025-03-01') },
      { user: aliceUser._id, description: 'Amazon order',        amount: 3200,  category: 'Shopping',      date: mkDate('2025-03-08') },
      { user: aliceUser._id, description: 'Rent',                amount: 12000, category: 'Housing',       date: mkDate('2025-03-05') },
      { user: aliceUser._id, description: 'Vegetables',          amount: 650,   category: 'Food',          date: mkDate('2025-03-18') },
      { user: aliceUser._id, description: 'Movie tickets',       amount: 480,   category: 'Entertainment', date: mkDate('2025-04-02') },
      { user: aliceUser._id, description: 'Doctor visit',        amount: 750,   category: 'Health',        date: mkDate('2025-04-10') },
      { user: aliceUser._id, description: 'Petrol',              amount: 1100,  category: 'Transport',     date: mkDate('2025-04-12') },
      { user: aliceUser._id, description: 'Groceries',           amount: 3100,  category: 'Food',          date: mkDate('2025-04-08') },
    ]);

    // Bob's expenses
    await Expense.insertMany([
      { user: bobUser._id, description: 'Lunch at cafe',       amount: 420,  category: 'Food',          date: mkDate('2025-01-10') },
      { user: bobUser._id, description: 'Metro card recharge', amount: 200,  category: 'Transport',     date: mkDate('2025-01-18') },
      { user: bobUser._id, description: 'Rent',                amount: 9000, category: 'Housing',       date: mkDate('2025-02-01') },
      { user: bobUser._id, description: 'Electricity',         amount: 850,  category: 'Utilities',     date: mkDate('2025-02-05') },
      { user: bobUser._id, description: 'Online course',       amount: 1999, category: 'Shopping',      date: mkDate('2025-02-20') },
      { user: bobUser._id, description: 'Dinner out',          amount: 1200, category: 'Food',          date: mkDate('2025-03-10') },
      { user: bobUser._id, description: 'Pharmacy',            amount: 340,  category: 'Health',        date: mkDate('2025-03-22') },
      { user: bobUser._id, description: 'Spotify',             amount: 119,  category: 'Entertainment', date: mkDate('2025-04-01') },
      { user: bobUser._id, description: 'Fuel',                amount: 900,  category: 'Transport',     date: mkDate('2025-04-05') },
      { user: bobUser._id, description: 'Groceries',           amount: 2400, category: 'Food',          date: mkDate('2025-04-09') },
    ]);

    console.log('🌱 Seeded: alice / alice123 and bob / bob456');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
