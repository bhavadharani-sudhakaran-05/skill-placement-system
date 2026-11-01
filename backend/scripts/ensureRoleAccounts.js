const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sps';

const accounts = [
  {
    name: 'College Placement Administrator',
    email: 'admin@skillforge.com',
    password: 'admin123',
    role: 'admin',
    metrics: { skillReadinessScore: 100 }
  },
  {
    name: 'Demo College Student',
    email: 'student@skillforge.com',
    password: 'student123',
    role: 'student',
    education: [{ institution: 'College of Engineering & Technology', degree: 'B.Tech IT', year: '2026' }],
    skills: [
      { name: 'JavaScript', level: 85, category: 'technical' },
      { name: 'React', level: 80, category: 'technical' },
      { name: 'Node.js', level: 75, category: 'technical' }
    ],
    metrics: { skillReadinessScore: 82 }
  }
];

async function ensureAccounts(options = {}) {
  const { isCli = false } = options;
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log(`Connected to MongoDB at ${MONGODB_URI}`);
    }

    // Clean up any remaining recruiter or legacy accounts
    try {
      const removed = await User.deleteMany({
        $or: [
          { role: 'recruiter' },
          { email: /recruiter/i }
        ]
      });
      if (removed.deletedCount > 0) {
        console.log(`[CLEANED] Purged ${removed.deletedCount} recruiter accounts from database`);
      }
    } catch (cleanErr) {
      console.warn('Note: Recruiter cleanup skipped:', cleanErr.message);
    }

    for (const acc of accounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        await User.create(acc);
        console.log(`[CREATED] ${acc.role.toUpperCase()}: ${acc.email} | password: ${acc.password}`);
      } else {
        let changed = false;
        if (existing.role !== acc.role) {
          existing.role = acc.role;
          changed = true;
        }
        if (acc.name && existing.name !== acc.name) {
          existing.name = acc.name;
          changed = true;
        }
        if (changed) {
          await existing.save();
          console.log(`[UPDATED] ${acc.role.toUpperCase()}: ${acc.email}`);
        }
      }
    }

    console.log('✅ College placement accounts verification complete');
    if (isCli) process.exit(0);
  } catch (error) {
    console.error('Error ensuring accounts:', error.message);
    if (isCli) process.exit(1);
  }
}

if (require.main === module) {
  ensureAccounts({ isCli: true });
}

module.exports = { ensureAccounts };
