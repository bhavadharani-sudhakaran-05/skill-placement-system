const test = require('node:test');
const assert = require('node:assert/strict');
const ResumeParserService = require('../services/resumeParser.service');

const representativeResume = `Sarah Chen
sarah.chen@example.com | 9876543210 | linkedin.com/in/sarahchen | github.com/sarahchen

EDUCATION
B.Tech in Information Technology
Coimbatore Institute of Technology, 2024
CGPA: 8.5

SKILLS
Java, JavaScript, React.js, Node.js, Express.js, Spring Boot, MySQL, MongoDB, TensorFlow.js, Git, GitHub, Figma, Communication, Problem-Solving

PROJECTS

Online Examination Portal
Tech Stack: HTML, CSS, JavaScript, SpringBoot, MySQL, TensorFlow.js, FaceAPI
Developed a secure online examination system with AI-powered proctoring using TensorFlow.js and FaceAPI to solve real-world integrity challenges. Implemented real-time monitoring, tab-switch detection, and anomaly detection to prevent malpractice scenarios. Built scalable teacher and student modules with efficient exam management and result processing.

Skill Development And Placement Recommendation System
Tech Stack: Node.js, Express.js, MongoDB, React.js, Tailwind CSS, JWT
Developed a full-stack platform for skill gap analysis and personalized job recommendations. Built scalable RESTful APIs and implemented JWT-based authentication and secure user management. Integrated resume parsing and a recommendation engine.

EcoLearn - Gamified Environmental Education Platform
Tech Stack: Node.js, Express.js, MongoDB, React.js, JWT
Developed a gamified environmental education platform featuring role-based dashboards, AI tutoring, interactive simulations, educational games, XP, badges, leaderboards, and rewards.

CERTIFICATIONS
Full Stack Java Developer, Udemy, 2023`;

test('representative resume produces exactly 3 projects with correct tech stacks and titles', async () => {
  const analysis = await ResumeParserService.analyzeResumeText(representativeResume);

  // 1. Projects
  assert.equal(analysis.projects.length, 3, 'Must produce exactly 3 projects');
  assert.equal(analysis.projects[0].title, 'Online Examination Portal');
  assert.equal(analysis.projects[1].title, 'Skill Development And Placement Recommendation System');
  assert.equal(analysis.projects[2].title, 'EcoLearn - Gamified Environmental Education Platform');

  // Check tech stacks
  assert.ok(analysis.projects[0].tech_stack.includes('JavaScript') || analysis.projects[0].tech_stack.includes('SpringBoot'));
  assert.ok(!analysis.projects[0].tech_stack.includes('r'), 'Must NOT contain single-letter "r" artifact');
  assert.ok(analysis.projects[1].tech_stack.includes('Node.js'));
  assert.ok(analysis.projects[2].tech_stack.includes('MongoDB'));

  // 2. Project descriptions must not be classified as work experience
  assert.equal(analysis.experience.length, 0, 'No genuine employment was listed, must not invent experience from project text');

  // 3. Technical vs Soft Skills
  const techNames = analysis.skills.technical.map(s => s.name);
  assert.ok(techNames.includes('Java'));
  assert.ok(techNames.includes('JavaScript'));
  assert.ok(techNames.includes('React.js') || techNames.includes('React'));
  assert.ok(techNames.includes('Node.js'));
  assert.ok(techNames.includes('Express.js'));
  assert.ok(techNames.includes('Spring Boot'));
  assert.ok(techNames.includes('MySQL'));
  assert.ok(techNames.includes('MongoDB'));
  assert.ok(techNames.includes('TensorFlow'));
  assert.ok(techNames.includes('Git'));
  assert.ok(techNames.includes('Figma'));

  // Communication & Problem-Solving MUST NOT be in technical
  assert.ok(!techNames.includes('Communication'), 'Communication is a soft skill');
  assert.ok(!techNames.includes('Problem-Solving'), 'Problem-Solving is a soft skill');
  assert.ok(!techNames.includes('Problem Solving'), 'Problem Solving is a soft skill');

  // Must be in soft skills
  assert.ok(analysis.skills.soft.includes('Communication'));
  assert.ok(analysis.skills.soft.some(s => s.includes('Problem')));

  // 4. Education
  assert.ok(analysis.education.length >= 1);
  assert.match(analysis.education[0].degree, /B\.?Tech/i);
  assert.equal(analysis.education[0].field, 'Information Technology');
  assert.ok(analysis.education[0].institution.includes('Institute') || analysis.education[0].institution.includes('Coimbatore'));
  assert.match(analysis.education[0].grade, /8\.5/);

  // 5. Certifications
  assert.ok(analysis.certifications.length >= 1);
  assert.ok(analysis.certifications[0].name.includes('Java'));

  // 6. ATS Score & Breakdown
  assert.ok(analysis.atsScore >= 60 && analysis.atsScore <= 100);
  assert.ok(analysis.scoreBreakdown);
  assert.equal(typeof analysis.scoreBreakdown.skillsMatch, 'number');
  assert.equal(typeof analysis.scoreBreakdown.experienceAndProjects, 'number');
});

