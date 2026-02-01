const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models
const User = require('./models/User');
const Skill = require('./models/Skill');
const Job = require('./models/Job');
const Course = require('./models/Course');
const Assessment = require('./models/Assessment');
const LearningPath = require('./models/LearningPath');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillforge';

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Skill.deleteMany({}),
      Job.deleteMany({}),
      Course.deleteMany({}),
      Assessment.deleteMany({}),
      LearningPath.deleteMany({})
    ]);

    // Create Admin User first (needed for jobs)
    console.log('👤 Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@skillforge.com',
      password: adminPassword,
      role: 'admin',
      skills: [],
      skillReadinessScore: 100
    });

    // Seed Skills
    console.log('📚 Seeding skills...');
    const skillsData = [
      { name: 'JavaScript', category: 'technical', description: 'Core web programming language', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'React', category: 'technical', description: 'Popular UI library by Meta', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'Node.js', category: 'technical', description: 'Server-side JavaScript runtime', demandLevel: 'high', growthTrend: 'stable' },
      { name: 'Python', category: 'technical', description: 'Versatile programming language', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'MongoDB', category: 'technical', description: 'NoSQL document database', demandLevel: 'medium', growthTrend: 'stable' },
      { name: 'SQL', category: 'technical', description: 'Structured Query Language', demandLevel: 'high', growthTrend: 'stable' },
      { name: 'TypeScript', category: 'technical', description: 'Typed superset of JavaScript', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'AWS', category: 'tools', description: 'Amazon Web Services cloud platform', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'Docker', category: 'tools', description: 'Container platform', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'Git', category: 'tools', description: 'Version control system', demandLevel: 'high', growthTrend: 'stable' },
      { name: 'Machine Learning', category: 'domain', description: 'AI and predictive modeling', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'Data Analysis', category: 'domain', description: 'Extracting insights from data', demandLevel: 'high', growthTrend: 'rising' },
      { name: 'Communication', category: 'soft', description: 'Effective verbal and written communication', demandLevel: 'high', growthTrend: 'stable' },
      { name: 'Problem Solving', category: 'soft', description: 'Analytical thinking and solution finding', demandLevel: 'high', growthTrend: 'stable' }
    ];
    const skills = await Skill.insertMany(skillsData);
    const skillMap = {};
    skills.forEach(s => skillMap[s.name] = s._id);

    // Seed Jobs
    console.log('💼 Seeding jobs...');
    const jobsData = [
      {
        title: 'Senior Full Stack Developer',
        company: { name: 'TechCorp Inc.', industry: 'Technology', size: '500-1000' },
        location: { city: 'San Francisco', state: 'CA', country: 'USA', remote: true },
        type: 'full-time',
        mode: 'hybrid',
        description: 'Join our team to build scalable web applications serving millions of users worldwide.',
        responsibilities: ['Design scalable systems', 'Mentor junior developers', 'Code reviews'],
        requirements: ['5+ years experience', 'React expertise', 'Node.js proficiency'],
        benefits: ['Health insurance', 'Stock options', 'Remote work'],
        skills: [
          { name: 'JavaScript', importance: 'required', minLevel: 80 },
          { name: 'React', importance: 'required', minLevel: 75 },
          { name: 'Node.js', importance: 'required', minLevel: 70 }
        ],
        experience: { min: 5, max: 10 },
        salary: { min: 150000, max: 180000, currency: 'USD', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'Frontend Developer',
        company: { name: 'StartupXYZ', industry: 'E-commerce', size: '50-200' },
        location: { city: 'New York', state: 'NY', country: 'USA', remote: true },
        type: 'full-time',
        mode: 'remote',
        description: 'Create beautiful user interfaces for our e-commerce platform.',
        responsibilities: ['Build UI components', 'Optimize performance', 'Collaborate with designers'],
        requirements: ['3+ years experience', 'React/Vue expertise'],
        benefits: ['Flexible hours', '401k', 'Learning budget'],
        skills: [
          { name: 'JavaScript', importance: 'required', minLevel: 70 },
          { name: 'React', importance: 'required', minLevel: 70 },
          { name: 'TypeScript', importance: 'preferred', minLevel: 50 }
        ],
        experience: { min: 3, max: 6 },
        salary: { min: 90000, max: 120000, currency: 'USD', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'Backend Engineer',
        company: { name: 'DataFlow Systems', industry: 'Technology', size: '200-500' },
        location: { city: 'Austin', state: 'TX', country: 'USA', remote: false },
        type: 'full-time',
        mode: 'onsite',
        description: 'Build robust APIs and microservices for data processing.',
        responsibilities: ['Design APIs', 'Optimize databases', 'Write tests'],
        requirements: ['4+ years experience', 'Strong algorithms knowledge'],
        benefits: ['Health insurance', 'Gym membership', 'Free lunch'],
        skills: [
          { name: 'Python', importance: 'required', minLevel: 75 },
          { name: 'SQL', importance: 'required', minLevel: 70 },
          { name: 'Docker', importance: 'preferred', minLevel: 50 }
        ],
        experience: { min: 4, max: 8 },
        salary: { min: 120000, max: 150000, currency: 'USD', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'Data Scientist',
        company: { name: 'AI Innovations', industry: 'AI/ML', size: '100-200' },
        location: { city: 'Seattle', state: 'WA', country: 'USA', remote: true },
        type: 'full-time',
        mode: 'hybrid',
        description: 'Drive data-driven decisions with ML models.',
        responsibilities: ['Build ML models', 'Analyze data', 'Present insights'],
        requirements: ['PhD or Masters preferred', 'ML framework experience'],
        benefits: ['Research budget', 'Conference attendance', 'Stock options'],
        skills: [
          { name: 'Python', importance: 'required', minLevel: 80 },
          { name: 'Machine Learning', importance: 'required', minLevel: 75 },
          { name: 'Data Analysis', importance: 'required', minLevel: 70 }
        ],
        experience: { min: 3, max: 7 },
        salary: { min: 140000, max: 170000, currency: 'USD', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'DevOps Engineer',
        company: { name: 'CloudNative Co', industry: 'Cloud', size: '50-100' },
        location: { city: 'Remote', country: 'USA', remote: true },
        type: 'full-time',
        mode: 'remote',
        description: 'Manage cloud infrastructure and CI/CD pipelines.',
        responsibilities: ['Manage AWS', 'Build CI/CD', 'Monitor systems'],
        requirements: ['Kubernetes experience', 'Strong Linux skills'],
        benefits: ['Remote work', 'Equipment budget', 'Unlimited PTO'],
        skills: [
          { name: 'AWS', importance: 'required', minLevel: 75 },
          { name: 'Docker', importance: 'required', minLevel: 70 },
          { name: 'Git', importance: 'required', minLevel: 60 }
        ],
        experience: { min: 3, max: 6 },
        salary: { min: 130000, max: 160000, currency: 'USD', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      }
    ];
    await Job.insertMany(jobsData);

    // Seed Courses
    console.log('🎓 Seeding courses...');
    const coursesData = [
      {
        title: 'Complete React Developer Course',
        description: 'Master React from beginner to advanced level with hands-on projects.',
        shortDescription: 'Learn React.js from scratch',
        provider: { name: 'Udemy', website: 'https://udemy.com' },
        instructor: { name: 'John Smith', bio: 'Senior React Developer' },
        category: 'Web Development',
        tags: ['react', 'javascript', 'frontend'],
        skills: [{ name: 'React', level: 'intermediate' }, { name: 'JavaScript', level: 'intermediate' }],
        level: 'beginner',
        duration: { hours: 40, weeks: 8 },
        pricing: { isFree: false, price: 49.99, currency: 'USD' },
        rating: { average: 4.8, count: 12500 },
        enrollmentCount: 125000,
        isActive: true
      },
      {
        title: 'Node.js - The Complete Guide',
        description: 'Build powerful backend applications with Node.js and Express.',
        shortDescription: 'Backend development with Node.js',
        provider: { name: 'Coursera', website: 'https://coursera.org' },
        instructor: { name: 'Jane Doe', bio: 'Backend Architect' },
        category: 'Backend Development',
        tags: ['nodejs', 'express', 'backend'],
        skills: [{ name: 'Node.js', level: 'intermediate' }, { name: 'MongoDB', level: 'beginner' }],
        level: 'intermediate',
        duration: { hours: 35, weeks: 6 },
        pricing: { isFree: true, price: 0, currency: 'USD' },
        rating: { average: 4.7, count: 8900 },
        enrollmentCount: 89000,
        isActive: true
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python for data analysis and machine learning applications.',
        shortDescription: 'Python for ML and Data Science',
        provider: { name: 'edX', website: 'https://edx.org' },
        instructor: { name: 'Dr. Alan Turing', bio: 'Data Science Professor' },
        category: 'Data Science',
        tags: ['python', 'datascience', 'ml'],
        skills: [{ name: 'Python', level: 'advanced' }, { name: 'Data Analysis', level: 'intermediate' }],
        level: 'beginner',
        duration: { hours: 60, weeks: 12 },
        pricing: { isFree: false, price: 99, currency: 'USD' },
        rating: { average: 4.9, count: 20000 },
        enrollmentCount: 200000,
        isActive: true
      },
      {
        title: 'AWS Solutions Architect',
        description: 'Prepare for AWS certification exam with comprehensive training.',
        shortDescription: 'AWS certification preparation',
        provider: { name: 'AWS Training', website: 'https://aws.amazon.com/training' },
        instructor: { name: 'Cloud Expert', bio: 'AWS Certified Solutions Architect' },
        category: 'Cloud Computing',
        tags: ['aws', 'cloud', 'devops'],
        skills: [{ name: 'AWS', level: 'advanced' }, { name: 'Docker', level: 'intermediate' }],
        level: 'advanced',
        duration: { hours: 50, weeks: 10 },
        pricing: { isFree: false, price: 299, currency: 'USD' },
        rating: { average: 4.6, count: 6700 },
        enrollmentCount: 67000,
        isActive: true
      },
      {
        title: 'TypeScript Masterclass',
        description: 'Deep dive into TypeScript for large-scale applications.',
        shortDescription: 'Advanced TypeScript concepts',
        provider: { name: 'Pluralsight', website: 'https://pluralsight.com' },
        instructor: { name: 'TypeScript Pro', bio: 'Microsoft MVP' },
        category: 'Programming',
        tags: ['typescript', 'javascript', 'programming'],
        skills: [{ name: 'TypeScript', level: 'advanced' }, { name: 'JavaScript', level: 'intermediate' }],
        level: 'intermediate',
        duration: { hours: 25, weeks: 4 },
        pricing: { isFree: false, price: 29, currency: 'USD' },
        rating: { average: 4.5, count: 4500 },
        enrollmentCount: 45000,
        isActive: true
      }
    ];
    await Course.insertMany(coursesData);

    // Seed Assessments
    console.log('📝 Seeding assessments...');
    const jsSkill = skills.find(s => s.name === 'JavaScript');
    const reactSkill = skills.find(s => s.name === 'React');
    const pythonSkill = skills.find(s => s.name === 'Python');

    const assessmentsData = [
      {
        title: 'JavaScript Fundamentals',
        description: 'Test your JavaScript core knowledge',
        skill: jsSkill._id,
        skillName: 'JavaScript',
        category: 'technical',
        difficulty: 'beginner',
        duration: 30,
        passingScore: 70,
        questions: [
          { question: 'What is closure in JavaScript?', type: 'mcq', options: ['A function with access to outer scope', 'A loop construct', 'An object type', 'None'], correctAnswer: 0, points: 10 },
          { question: 'What does === compare?', type: 'mcq', options: ['Value only', 'Type only', 'Value and type', 'Reference'], correctAnswer: 2, points: 10 },
          { question: 'What is hoisting?', type: 'mcq', options: ['Moving vars to top', 'A design pattern', 'An error type', 'A loop'], correctAnswer: 0, points: 10 },
          { question: 'What is the event loop?', type: 'mcq', options: ['A for loop', 'Async execution mechanism', 'An event handler', 'A callback'], correctAnswer: 1, points: 10 },
          { question: 'What does Promise.all do?', type: 'mcq', options: ['Runs promises sequentially', 'Runs all promises in parallel', 'Cancels promises', 'Creates promises'], correctAnswer: 1, points: 10 }
        ],
        totalPoints: 50,
        isActive: true
      },
      {
        title: 'React Advanced Concepts',
        description: 'Test your React expertise',
        skill: reactSkill._id,
        skillName: 'React',
        category: 'technical',
        difficulty: 'advanced',
        duration: 45,
        passingScore: 75,
        questions: [
          { question: 'What is the purpose of useCallback?', type: 'mcq', options: ['Create callbacks', 'Memoize functions', 'Handle events', 'Manage state'], correctAnswer: 1, points: 10 },
          { question: 'What is React.memo used for?', type: 'mcq', options: ['Memory management', 'Memoize components', 'Create memos', 'Debug'], correctAnswer: 1, points: 10 },
          { question: 'What is the Virtual DOM?', type: 'mcq', options: ['Browser DOM', 'In-memory representation', 'A library', 'CSS framework'], correctAnswer: 1, points: 10 },
          { question: 'What is useReducer for?', type: 'mcq', options: ['Reduce array', 'Complex state logic', 'Performance', 'Routing'], correctAnswer: 1, points: 10 },
          { question: 'What is Context API?', type: 'mcq', options: ['State sharing', 'Routing', 'Styling', 'Testing'], correctAnswer: 0, points: 10 }
        ],
        totalPoints: 50,
        isActive: true
      },
      {
        title: 'Python Programming',
        description: 'Assess your Python skills',
        skill: pythonSkill._id,
        skillName: 'Python',
        category: 'technical',
        difficulty: 'intermediate',
        duration: 40,
        passingScore: 70,
        questions: [
          { question: 'What is a decorator?', type: 'mcq', options: ['Design pattern', 'Function wrapper', 'Class type', 'Module'], correctAnswer: 1, points: 10 },
          { question: 'What does *args do?', type: 'mcq', options: ['Fixed arguments', 'Keyword args', 'Variable positional args', 'No args'], correctAnswer: 2, points: 10 },
          { question: 'What is a list comprehension?', type: 'mcq', options: ['Loop syntax', 'Concise list creation', 'Import statement', 'Class'], correctAnswer: 1, points: 10 },
          { question: 'What is GIL?', type: 'mcq', options: ['A library', 'Global Interpreter Lock', 'A function', 'A module'], correctAnswer: 1, points: 10 },
          { question: 'What is __init__?', type: 'mcq', options: ['Destructor', 'Constructor', 'Static method', 'Property'], correctAnswer: 1, points: 10 }
        ],
        totalPoints: 50,
        isActive: true
      }
    ];
    await Assessment.insertMany(assessmentsData);

    // Seed Learning Paths
    console.log('🛤️  Seeding learning paths...');
    const learningPathsData = [
      {
        title: 'Full Stack Web Developer',
        description: 'Complete path to become a full stack developer',
        targetRole: 'Full Stack Developer',
        level: 'intermediate',
        duration: { weeks: 24, hoursPerWeek: 10 },
        skills: [
          { name: 'JavaScript', targetLevel: 80 },
          { name: 'React', targetLevel: 75 },
          { name: 'Node.js', targetLevel: 70 },
          { name: 'MongoDB', targetLevel: 65 }
        ],
        stages: [
          { order: 1, title: 'Frontend Fundamentals', description: 'Learn HTML, CSS, JavaScript', duration: 80, modules: [] },
          { order: 2, title: 'React Development', description: 'Master React and state management', duration: 60, modules: [] },
          { order: 3, title: 'Backend Development', description: 'Build APIs with Node.js', duration: 60, modules: [] },
          { order: 4, title: 'Database & Deployment', description: 'MongoDB and cloud deployment', duration: 40, modules: [] }
        ],
        isActive: true,
        isAdaptive: true
      },
      {
        title: 'Data Scientist',
        description: 'Path to becoming a data scientist',
        targetRole: 'Data Scientist',
        level: 'advanced',
        duration: { weeks: 32, hoursPerWeek: 12 },
        skills: [
          { name: 'Python', targetLevel: 85 },
          { name: 'Data Analysis', targetLevel: 80 },
          { name: 'Machine Learning', targetLevel: 75 },
          { name: 'SQL', targetLevel: 70 }
        ],
        stages: [
          { order: 1, title: 'Python Basics', description: 'Learn Python programming', duration: 60, modules: [] },
          { order: 2, title: 'Data Analysis', description: 'Master pandas and visualization', duration: 80, modules: [] },
          { order: 3, title: 'Machine Learning', description: 'Learn ML algorithms', duration: 100, modules: [] },
          { order: 4, title: 'Deep Learning', description: 'Neural networks and AI', duration: 80, modules: [] }
        ],
        isActive: true,
        isAdaptive: true
      },
      {
        title: 'Cloud Engineer',
        description: 'Become a cloud infrastructure expert',
        targetRole: 'Cloud Engineer',
        level: 'intermediate',
        duration: { weeks: 20, hoursPerWeek: 10 },
        skills: [
          { name: 'AWS', targetLevel: 80 },
          { name: 'Docker', targetLevel: 75 },
          { name: 'Git', targetLevel: 70 }
        ],
        stages: [
          { order: 1, title: 'Cloud Fundamentals', description: 'Learn cloud concepts', duration: 40, modules: [] },
          { order: 2, title: 'AWS Services', description: 'Master core AWS services', duration: 80, modules: [] },
          { order: 3, title: 'Containerization', description: 'Docker and Kubernetes', duration: 60, modules: [] },
          { order: 4, title: 'Infrastructure as Code', description: 'Terraform and automation', duration: 40, modules: [] }
        ],
        isActive: true,
        isAdaptive: true
      }
    ];
    await LearningPath.insertMany(learningPathsData);

    // Seed Test Users
    console.log('👥 Seeding test users...');
    const userPassword = await bcrypt.hash('password123', salt);
    
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'student',
      skills: [
        { name: 'JavaScript', proficiencyLevel: 85, verified: true },
        { name: 'React', proficiencyLevel: 80, verified: true },
        { name: 'Node.js', proficiencyLevel: 70, verified: false }
      ],
      education: [{ institution: 'Stanford University', degree: 'B.S. Computer Science', year: 2022 }],
      skillReadinessScore: 78
    });

    await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: userPassword,
      role: 'student',
      skills: [
        { name: 'Python', proficiencyLevel: 90, verified: true },
        { name: 'Machine Learning', proficiencyLevel: 75, verified: false },
        { name: 'Data Analysis', proficiencyLevel: 85, verified: true }
      ],
      education: [{ institution: 'MIT', degree: 'M.S. Data Science', year: 2023 }],
      skillReadinessScore: 82
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   • ${skillsData.length} Skills`);
    console.log(`   • ${jobsData.length} Jobs`);
    console.log(`   • ${coursesData.length} Courses`);
    console.log(`   • ${assessmentsData.length} Assessments`);
    console.log(`   • ${learningPathsData.length} Learning Paths`);
    console.log(`   • 3 Users (1 admin + 2 students)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@skillforge.com | Password: admin123');
    console.log('   User:  john@example.com     | Password: password123');
    console.log('   User:  jane@example.com     | Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
