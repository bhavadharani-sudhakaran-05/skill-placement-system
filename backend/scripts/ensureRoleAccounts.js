const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sps';

const accounts = [
  {
    name: 'Platform Administrator',
    email: 'admin@skillforge.com',
    password: 'admin123',
    role: 'admin',
    metrics: { skillReadinessScore: 100 }
  },
  {
    name: 'TechCorp Recruiter',
    email: 'recruiter@skillforge.com',
    password: 'recruiter123',
    role: 'recruiter',
    company: {
      name: 'TechCorp Solutions',
      website: 'https://techcorp.example.com',
      industry: 'Software & Technology',
      size: '500-1000',
      description: 'Global provider of enterprise cloud and AI solutions'
    }
  },
  {
    name: 'Apex Institute Placement Cell',
    email: 'college@skillforge.com',
    password: 'college123',
    role: 'college_admin',
    college: {
      name: 'Apex Institute of Technology',
      location: 'Coimbatore, Tamil Nadu',
      website: 'https://apex-tech.edu',
      placementCell: 'Directorate of Corporate Relations & Placements'
    }
  },
  {
    name: 'Demo Student',
    email: 'student@skillforge.com',
    password: 'student123',
    role: 'student',
    education: [{ institution: 'Apex Institute of Technology', degree: 'B.Tech IT', year: '2026' }],
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
        if (acc.company && !existing.company?.name) {
          existing.company = acc.company;
          changed = true;
        }
        if (acc.college && !existing.college?.name) {
          existing.college = acc.college;
          changed = true;
        }
        if (changed) {
          await existing.save();
          console.log(`[UPDATED] ${acc.role.toUpperCase()}: ${acc.email}`);
        }
      }
    }

    if (isCli) {
      const allUsers = await User.find({}).select('email role name');
      console.log('\n--- Current Registered Users in DB ---');
      console.table(allUsers.map(u => ({ id: u._id.toString(), email: u.email, role: u.role, name: u.name })));
      process.exit(0);
    }
  } catch (err) {
    console.error('Error ensuring accounts:', err);
    if (isCli) process.exit(1);
  }
}

if (require.main === module) {
  ensureAccounts({ isCli: true });
}

module.exports = { ensureAccounts, accounts };
