const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

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
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@skillforge.com',
      password: 'admin123',
      role: 'admin',
      skills: [],
      metrics: { skillReadinessScore: 100 }
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
        title: 'Software Engineer',
        company: { name: 'TCS', website: 'https://ibegin.tcs.com/iBegin/', industry: 'IT Services', size: '10000+' },
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', remote: false },
        type: 'full-time',
        mode: 'hybrid',
        description: 'Join TCS Digital as a Software Engineer to work on enterprise solutions for Fortune 500 clients. Great learning opportunities and global exposure across banking, retail, and healthcare domains.',
        responsibilities: ['Develop and maintain enterprise-grade web applications', 'Collaborate with cross-functional global teams', 'Participate in code reviews and agile ceremonies', 'Write unit tests and maintain code quality'],
        requirements: ['B.Tech/B.E. in Computer Science or related field', 'Strong proficiency in JavaScript and React', 'Knowledge of Node.js and REST APIs', 'Good understanding of databases (SQL/NoSQL)'],
        benefits: ['Health insurance for family', 'Performance bonus', 'Learning & development programs', 'Work from home flexibility'],
        skills: [
          { name: 'JavaScript', importance: 'required', minLevel: 70 },
          { name: 'React', importance: 'required', minLevel: 65 },
          { name: 'Node.js', importance: 'required', minLevel: 60 }
        ],
        experience: { min: 0, max: 3 },
        salary: { min: 400000, max: 700000, currency: 'INR', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'Associate Software Engineer',
        company: { name: 'Infosys', website: 'https://www.infosys.com/careers.html', industry: 'IT Services', size: '10000+' },
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: false },
        type: 'full-time',
        mode: 'onsite',
        description: 'Infosys is hiring freshers for its Mysore DC. Training provided on cutting-edge technologies. Work on projects across banking, retail, and healthcare domains with global exposure.',
        responsibilities: ['Develop software solutions using Python and JavaScript', 'Work in agile teams with daily standups', 'Debug and resolve production issues', 'Write technical documentation'],
        requirements: ['B.Tech/B.E./MCA with 60%+ aggregate', 'Knowledge of Python and JavaScript', 'Understanding of MySQL and databases', 'Good communication skills'],
        benefits: ['Comprehensive training program', 'Health & life insurance', 'Employee stock options', 'Relocation assistance'],
        skills: [
          { name: 'Python', importance: 'required', minLevel: 60 },
          { name: 'JavaScript', importance: 'required', minLevel: 55 },
          { name: 'SQL', importance: 'preferred', minLevel: 50 }
        ],
        experience: { min: 0, max: 2 },
        salary: { min: 360000, max: 500000, currency: 'INR', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'Full Stack Developer',
        company: { name: 'Wipro', website: 'https://careers.wipro.com/', industry: 'IT Services', size: '10000+' },
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India', remote: true },
        type: 'full-time',
        mode: 'hybrid',
        description: 'Build scalable web applications for Wipro\'s digital transformation projects. Collaborative team environment with flexible work options and exposure to cloud technologies.',
        responsibilities: ['Build end-to-end features using React and Node.js', 'Design and implement RESTful APIs', 'Work with MongoDB and cloud services (AWS)', 'Mentor junior developers and conduct code reviews'],
        requirements: ['1-3 years experience in full stack development', 'Proficiency in React, Node.js, and MongoDB', 'Experience with AWS or Azure cloud services', 'Understanding of CI/CD pipelines'],
        benefits: ['Flexible work hours', 'Health insurance', 'Annual performance bonus', 'Skill development budget'],
        skills: [
          { name: 'React', importance: 'required', minLevel: 70 },
          { name: 'Node.js', importance: 'required', minLevel: 65 },
          { name: 'MongoDB', importance: 'required', minLevel: 60 },
          { name: 'AWS', importance: 'preferred', minLevel: 40 }
        ],
        experience: { min: 1, max: 4 },
        salary: { min: 500000, max: 900000, currency: 'INR', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'Data Analyst',
        company: { name: 'Zoho', website: 'https://www.zoho.com/careers.html', industry: 'Product Development', size: '5000-10000' },
        location: { city: 'Chennai', state: 'Tamil Nadu', country: 'India', remote: false },
        type: 'full-time',
        mode: 'onsite',
        description: 'Analyze large datasets to derive business insights at Zoho. Work in a product company with direct impact on millions of users worldwide. Great opportunity for data enthusiasts.',
        responsibilities: ['Analyze user behavior and product usage data', 'Create dashboards and reports using Power BI', 'Write complex SQL queries for data extraction', 'Present data-driven insights to stakeholders'],
        requirements: ['Strong proficiency in Python and SQL', 'Experience with data visualization tools (Power BI/Tableau)', 'Knowledge of statistical analysis and Excel', 'Good analytical and problem-solving skills'],
        benefits: ['Free meals at office', 'No dress code', 'Product company culture', 'Annual retreat and team outings'],
        skills: [
          { name: 'Python', importance: 'required', minLevel: 70 },
          { name: 'SQL', importance: 'required', minLevel: 75 },
          { name: 'Data Analysis', importance: 'required', minLevel: 65 }
        ],
        experience: { min: 1, max: 3 },
        salary: { min: 600000, max: 1000000, currency: 'INR', period: 'yearly' },
        postedBy: admin._id,
        status: 'active'
      },
      {
        title: 'DevOps Engineer',
        company: { name: 'Cognizant', website: 'https://careers.cognizant.com/', industry: 'IT Services', size: '10000+' },
        location: { city: 'Pune', state: 'Maharashtra', country: 'India', remote: true },
        type: 'full-time',
        mode: 'remote',
        description: 'Build CI/CD pipelines and manage cloud infrastructure for enterprise clients. Work with cutting-edge DevOps tools. Remote-friendly with hybrid work options available.',
        responsibilities: ['Set up and maintain CI/CD pipelines using Jenkins/GitHub Actions', 'Manage AWS cloud infrastructure and services', 'Containerize applications using Docker and Kubernetes', 'Monitor system performance and handle incidents'],
        requirements: ['2+ years experience in DevOps/Cloud', 'Strong knowledge of AWS services and Docker', 'Experience with Git and Linux administration', 'Understanding of networking and security'],
        benefits: ['Remote work option', 'Health & wellness programs', 'Performance-based incentives', 'Certifications sponsorship'],
        skills: [
          { name: 'AWS', importance: 'required', minLevel: 70 },
          { name: 'Docker', importance: 'required', minLevel: 65 },
          { name: 'Git', importance: 'required', minLevel: 60 }
        ],
        experience: { min: 2, max: 5 },
        salary: { min: 800000, max: 1500000, currency: 'INR', period: 'yearly' },
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
        category: 'full-stack-developer',
        isPublic: true,
        isPersonalized: false,
        totalDuration: 240,
        totalModules: 4,
        duration: { weeks: 24, hoursPerWeek: 10 },
        skills: [
          { name: 'JavaScript', targetLevel: 80 },
          { name: 'React', targetLevel: 75 },
          { name: 'Node.js', targetLevel: 70 },
          { name: 'MongoDB', targetLevel: 65 }
        ],
        successMetrics: { enrollments: 150, completions: 45, averageRating: 4.7 },
        stages: [
          { order: 1, title: 'Frontend Fundamentals', description: 'Learn HTML, CSS, JavaScript', duration: 80, difficulty: 'beginner', estimatedDuration: 80, modules: [] },
          { order: 2, title: 'React Development', description: 'Master React and state management', duration: 60, difficulty: 'intermediate', estimatedDuration: 60, modules: [] },
          { order: 3, title: 'Backend Development', description: 'Build APIs with Node.js', duration: 60, difficulty: 'intermediate', estimatedDuration: 60, modules: [] },
          { order: 4, title: 'Database & Deployment', description: 'MongoDB and cloud deployment', duration: 40, difficulty: 'advanced', estimatedDuration: 40, modules: [] }
        ],
        isActive: true,
        isAdaptive: true
      },
      {
        title: 'Data Scientist',
        description: 'Path to becoming a data scientist',
        targetRole: 'Data Scientist',
        level: 'advanced',
        category: 'data-scientist',
        isPublic: true,
        isPersonalized: false,
        totalDuration: 320,
        totalModules: 4,
        duration: { weeks: 32, hoursPerWeek: 12 },
        skills: [
          { name: 'Python', targetLevel: 85 },
          { name: 'Data Analysis', targetLevel: 80 },
          { name: 'Machine Learning', targetLevel: 75 },
          { name: 'SQL', targetLevel: 70 }
        ],
        successMetrics: { enrollments: 200, completions: 60, averageRating: 4.8 },
        stages: [
          { order: 1, title: 'Python Basics', description: 'Learn Python programming', duration: 60, difficulty: 'beginner', estimatedDuration: 60, modules: [] },
          { order: 2, title: 'Data Analysis', description: 'Master pandas and visualization', duration: 80, difficulty: 'intermediate', estimatedDuration: 80, modules: [] },
          { order: 3, title: 'Machine Learning', description: 'Learn ML algorithms', duration: 100, difficulty: 'advanced', estimatedDuration: 100, modules: [] },
          { order: 4, title: 'Deep Learning', description: 'Neural networks and AI', duration: 80, difficulty: 'advanced', estimatedDuration: 80, modules: [] }
        ],
        isActive: true,
        isAdaptive: true
      },
      {
        title: 'Cloud Engineer',
        description: 'Become a cloud infrastructure expert',
        targetRole: 'Cloud Engineer',
        level: 'intermediate',
        category: 'devops-engineer',
        isPublic: true,
        isPersonalized: false,
        totalDuration: 200,
        totalModules: 4,
        duration: { weeks: 20, hoursPerWeek: 10 },
        skills: [
          { name: 'AWS', targetLevel: 80 },
          { name: 'Docker', targetLevel: 75 },
          { name: 'Git', targetLevel: 70 }
        ],
        successMetrics: { enrollments: 100, completions: 30, averageRating: 4.5 },
        stages: [
          { order: 1, title: 'Cloud Fundamentals', description: 'Learn cloud concepts', duration: 40, difficulty: 'beginner', estimatedDuration: 40, modules: [] },
          { order: 2, title: 'AWS Services', description: 'Master core AWS services', duration: 80, difficulty: 'intermediate', estimatedDuration: 80, modules: [] },
          { order: 3, title: 'Containerization', description: 'Docker and Kubernetes', duration: 60, difficulty: 'intermediate', estimatedDuration: 60, modules: [] },
          { order: 4, title: 'Infrastructure as Code', description: 'Terraform and automation', duration: 40, difficulty: 'advanced', estimatedDuration: 40, modules: [] }
        ],
        isActive: true,
        isAdaptive: true
      }
    ];
    await LearningPath.insertMany(learningPathsData);

    // Seed Test Users
    console.log('👥 Seeding test users...');
    
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'student',
      skills: [
        { name: 'JavaScript', level: 85, verified: true, category: 'technical' },
        { name: 'React', level: 80, verified: true, category: 'technical' },
        { name: 'Node.js', level: 70, verified: false, category: 'technical' }
      ],
      education: [{ institution: 'Stanford University', degree: 'B.S. Computer Science', year: '2022' }],
      metrics: { skillReadinessScore: 78 }
    });

    await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password123',
      role: 'student',
      skills: [
        { name: 'Python', level: 90, verified: true, category: 'technical' },
        { name: 'Machine Learning', level: 75, verified: false, category: 'technical' },
        { name: 'Data Analysis', level: 85, verified: true, category: 'technical' }
      ],
      education: [{ institution: 'MIT', degree: 'M.S. Data Science', year: '2023' }],
      metrics: { skillReadinessScore: 82 }
    });

    await User.create({
      name: 'Bhavadharani S M',
      email: 'bhavadharanis23it@srishakthi.ac.in',
      password: 'password123',
      role: 'student',
      skills: [],
      education: [{ institution: 'Sri Shakthi Institute of Engineering and Technology', degree: 'B.Tech IT', year: '2027' }],
      metrics: { skillReadinessScore: 0 }
    });

    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   • ${skillsData.length} Skills`);
    console.log(`   • ${jobsData.length} Jobs`);
    console.log(`   • ${coursesData.length} Courses`);
    console.log(`   • ${assessmentsData.length} Assessments`);
    console.log(`   • ${learningPathsData.length} Learning Paths`);
    console.log(`   • 4 Users (1 admin + 3 students)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@skillforge.com                | Password: admin123');
    console.log('   User:  john@example.com                    | Password: password123');
    console.log('   User:  jane@example.com                    | Password: password123');
    console.log('   User:  bhavadharanis23it@srishakthi.ac.in  | Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
