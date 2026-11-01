const test = require('node:test');
const assert = require('node:assert/strict');
const ResumeParserService = require('../services/resumeParser.service');

const sampleResumeText = `
Git-HubLeetcode
Linkedin

alex.morgan@example.com
Alex Morgan
MERN STACK DEVELOPER
SUMMARY
SKILLS
Programming
Frontend
Backend
Databases
Core Concepts
Tools & Deployment

JavaScript, Java, SQL
React.js, HTML5, CSS3, Bootstrap
Node.js, Express.js, REST APIs, JWT Authentication
MongoDB, MySQL
Data Structures & Algorithms, Object-Oriented Programming, DBMS
Git, GitHub, VS Code, Vercel, Render
ACHIEVEMENTS

Smart India Hackathon 2025 Finalist: Recognized for EcoLearn, a gamified environmental education platform.
Retain the claim about selection among 50,000+ teams if you can verify it.
LeetCode: Solved 250+ problems and earned 50 Days, 100 Days, and Monthly badges.
MERN Stack  Developer with  hands-on experience building full-stack web  applications using  React.js,
Node.js, Express.js, and  MongoDB.  Experienced in  developing REST  APIs, implementing JWT
authentication and  role-based access control, and  integrating AI-powered features. Strong foundations in
JavaScript, data structures and algorithms, OOP, and database management, with practical project experience
and Smart India Hackathon 2025 finalist recognition.
EDUCATION
Apex Institute of Technology
B.TECH INFORMATION TECHNOLOGY - CGPA - 8.17
Government Higher Secondary School
HSC - 86%
Coimbatore
Sep 2023 - May 2027 (Expected)
Namakkal
June 2022 - March 2023
PROJECTS

GitHub | Live Demo
HireReady — Interview Portal & Preparation Platform
Developed  a  full-stack  interview  preparation  platform  featuring  aptitude  assessments,  resume  building,  and
personalized interview preparation workflows.
Implemented JWT-based authentication, protected routes, and REST APIs to integrate the React frontend with
Express.js backend services and MongoDB.
Integrated the Gemini API to support AI-powered mock interviews and personalized feedback.
Tech Stack: React.js, Node.js, Express.js, MongoDB, JWT, Gemini API
GitHub

Tech Stack: Java, JDBC, MySQL, OOP

Developed a Java-based application with CRUD operations for managing student and scholarship records using
JDBC and MySQL.
Applied Object-Oriented Programming (OOP) principles and layered architecture to organize application logic and
improve code maintainability.
Designed  a  normalized  MySQL  database  and  used  PreparedStatement  for  secure  database  operations  and  SQL
injection prevention.
Smart Scholarship Management System

Developed a MERN-based environmental education platform with dedicated dashboards for students, teachers, and
administrators.
Implemented JWT authentication and role-based access control, and built interactive learning simulations, minigames, and gamification features including XP, badges, and leaderboards.
Selected as a Smart India Hackathon 2025 finalist for developing the gamified environmental education platform.
EcoLearn — Gamified Environmental Education Platform
Tech Stack: React.js, Node.js, Express.js, MongoDB, JWT, Gemini API
GitHub | Live Demo
CERTIFICATIONS
Full-Stack Java Developer — NoviTech R&D Private Limited | Apr 2025
Java Object-Oriented Programming — LinkedIn Learning | Jul 2025
Structured Query Language — HackerRank | Dec 2025
`;

test('validates user resume extraction against all section requirements', async () => {
  const analysis = await ResumeParserService.analyzeResumeText(sampleResumeText);

  // 1. Projects: Exactly 3 projects with correct titles and non-empty tech stacks
  assert.equal(analysis.projects.length, 3, 'Must extract exactly 3 projects');
  assert.match(analysis.projects[0].title, /HireReady/i);
  assert.match(analysis.projects[1].title, /Smart Scholarship Management System/i);
  assert.match(analysis.projects[2].title, /EcoLearn/i);
  assert.ok(!analysis.projects.some(p => /github\s*\|\s*live demo/i.test(p.title)));

  // Tech stacks
  assert.ok(analysis.projects[0].tech_stack.includes('React.js') || analysis.projects[0].tech_stack.includes('React'));
  assert.ok(analysis.projects[0].tech_stack.includes('Node.js'));
  assert.ok(analysis.projects[0].tech_stack.includes('MongoDB'));

  assert.ok(analysis.projects[1].tech_stack.includes('Java'));
  assert.ok(analysis.projects[1].tech_stack.includes('MySQL'));

  assert.ok(analysis.projects[2].tech_stack.includes('React.js') || analysis.projects[2].tech_stack.includes('React'));
  assert.ok(analysis.projects[2].tech_stack.includes('Express.js'));

  // 2. Experience: Exactly 0
  assert.equal(analysis.experience.length, 0, 'No genuine employment or internship, must not fabricate');

  // 3. Education: Exactly 2 records, no duplicates
  assert.equal(analysis.education.length, 2, 'Must extract exactly 2 education records');
  assert.match(analysis.education[0].institution, /Apex Institute/i);
  assert.match(analysis.education[0].degree, /B\.?Tech/i);
  assert.match(analysis.education[0].field, /Information Technology/i);
  assert.match(analysis.education[0].grade, /8\.17/);

  assert.match(analysis.education[1].institution, /Government Higher Secondary School/i);
  assert.match(analysis.education[1].degree, /Higher Secondary|HSC/i);
  assert.match(analysis.education[1].grade, /86/);

  // 4. Certifications: Exactly 3 records
  assert.equal(analysis.certifications.length, 3, 'Must extract exactly 3 certifications');
  assert.match(analysis.certifications[0].name, /Full-Stack Java Developer/i);
  assert.match(analysis.certifications[0].issuer, /NoviTech/i);

  assert.match(analysis.certifications[1].name, /Java Object-Oriented Programming/i);
  assert.match(analysis.certifications[1].issuer, /LinkedIn Learning/i);

  assert.match(analysis.certifications[2].name, /Structured Query Language/i);
  assert.match(analysis.certifications[2].issuer, /HackerRank/i);

  // 5. Achievements: Exactly 2 records
  assert.equal(analysis.achievements.length, 2, 'Must extract exactly 2 achievements');
  assert.match(analysis.achievements[0].title, /Smart India Hackathon/i);
  assert.match(analysis.achievements[1].title, /LeetCode/i);

  // 6. Skills: Exactly 21 unique skills across the 6 categories
  assert.equal(analysis.skills.technical.length, 21, 'Must extract exactly 21 unique technical skills');

  const catMap = {};
  analysis.skills.technical.forEach(s => {
    catMap[s.category] = (catMap[s.category] || 0) + 1;
  });

  assert.equal(catMap['Programming Languages'], 3, '3 Programming Languages');
  assert.equal(catMap['Frontend'], 4, '4 Frontend skills');
  assert.equal(catMap['Backend'], 4, '4 Backend skills');
  assert.equal(catMap['Databases'], 2, '2 Database skills');
  assert.equal(catMap['Core Concepts'], 3, '3 Core Concepts');
  assert.equal(catMap['Tools & Deployment'], 5, '5 Tools & Deployment');
});

