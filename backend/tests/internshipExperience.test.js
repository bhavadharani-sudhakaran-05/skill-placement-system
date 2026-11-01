const test = require('node:test');
const assert = require('node:assert/strict');
const ResumeParserService = require('../services/resumeParser.service');
const ResumeAnalysisService = require('../services/resumeAnalysis.service');

test('Resume with internship under INTERNSHIP heading is extracted into experience with type Internship', async () => {
  const sampleResume = `
Jordan Taylor
Email: jordan.taylor@example.com | Phone: 9876543210
GitHub: https://github.com/jordantaylor | LinkedIn: https://linkedin.com/in/jordantaylor

TECHNICAL SKILLS
Languages: Java, JavaScript, SQL
Frontend: React.js, HTML5, CSS3, Tailwind CSS
Backend: Node.js, Express.js, REST APIs
Databases: MongoDB, MySQL
Tools: Git, GitHub

INTERNSHIP
Full Stack Developer Intern
Udrlight Innovation Centre
September 2025 – March 2026
- Developed a responsive e-commerce web application using React.js and Tailwind CSS.
- Implemented product listing and cart management features.
- Integrated REST APIs and managed version control using Git.
- Improved maintainability through component-based architecture.

PROJECTS
Online Examination Portal
Technologies: React.js, Node.js, Express.js, MongoDB
- Developed full-stack portal with automated proctoring.

EDUCATION
B.E. Computer Science and Engineering
Saveetha Engineering College
2022 - 2026 | CGPA: 8.5
`;

  const parsed = await ResumeParserService.analyzeResumeText(sampleResume);

  assert.ok(parsed.parsedExperience.length >= 1, 'Should extract at least 1 experience record');
  const internship = parsed.parsedExperience[0];

  assert.match(internship.role, /Full Stack Developer Intern/i);
  assert.match(internship.company || internship.employer, /Udrlight Innovation Centre/i);
  assert.equal(internship.type, 'Internship');
  assert.equal(internship.isInternship, true);
  assert.ok(internship.responsibilities.length >= 2, 'Should extract responsibilities');
  assert.ok(internship.technologies.length >= 2, 'Should extract technologies from responsibilities');
  assert.ok(internship.technologies.includes('React.js') || internship.technologies.includes('React'));
});

test('Resume with both professional employment and internship extracts both correctly', async () => {
  const sampleResume = `
PRIYA S
Email: priya@example.com

PROFESSIONAL EXPERIENCE
Software Engineer
Apex Tech Solutions
January 2024 – Present
- Built high-performance microservices using Node.js and Redis.

INTERNSHIP EXPERIENCE
Web Development Intern
Innovate Labs
June 2023 – December 2023
- Designed user interfaces with React and Tailwind CSS.

EDUCATION
B.Tech IT, 2020 - 2024
`;

  const parsed = await ResumeParserService.analyzeResumeText(sampleResume);

  assert.equal(parsed.parsedExperience.length, 2, 'Should extract both records');
  const [emp1, emp2] = parsed.parsedExperience;

  assert.equal(emp1.type, 'Full-Time');
  assert.equal(emp1.isInternship, false);
  assert.match(emp1.company, /Apex Tech Solutions/i);

  assert.equal(emp2.type, 'Internship');
  assert.equal(emp2.isInternship, true);
  assert.match(emp2.company, /Innovate Labs/i);
});

test('Resume with no experience or internships returns an empty array cleanly', async () => {
  const sampleResume = `
STUDENT NAME
Email: student@example.com

EDUCATION
B.E. Computer Science, 2025

TECHNICAL SKILLS
Java, Python, SQL
`;

  const parsed = await ResumeParserService.analyzeResumeText(sampleResume);
  assert.deepEqual(parsed.parsedExperience, []);
});

