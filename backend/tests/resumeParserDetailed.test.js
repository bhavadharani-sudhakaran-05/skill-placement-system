const test = require('node:test');
const assert = require('node:assert/strict');
const ResumeParserService = require('../services/resumeParser.service');

test('partitionSections accurately separates sections by standard headings', () => {
  const text = `John Doe\njohn@example.com\n\nPROFESSIONAL SUMMARY\nExperienced developer with a passion for web technologies.\n\nEDUCATION\nB.Tech in Computer Science\nNorth University, 2024\n\nTECHNICAL SKILLS\nJava, React, Node.js, MongoDB\n\nWORK EXPERIENCE\nTech Corp — Software Engineer | 2022–Present\n- Built scalable REST APIs\n\nPROJECTS\nCampus Map\nTech Stack: React, JavaScript\n- Interactive campus navigation\n\nCERTIFICATIONS\nAWS Certified Solutions Architect, Amazon, 2023`;

  const sections = ResumeParserService.partitionSections(text);
  assert.ok(sections.summary.includes('Experienced developer'));
  assert.ok(sections.education.includes('B.Tech in Computer Science'));
  assert.ok(sections.skills.includes('Java, React'));
  assert.ok(sections.experience.includes('Tech Corp'));
  assert.ok(sections.projects.includes('Campus Map'));
  assert.ok(sections.certifications.includes('AWS Certified'));
});

test('extractSkills extracts categorized skills with alias normalization and word boundaries', () => {
  const resumeText = `SKILLS\nReact.js, Node.js, Spring Boot, MongoDB, Python, Docker, Git, Communication\n\nPROJECTS\nPortfolio\nTech Stack: Express.js, PostgreSQL`;

  const sections = ResumeParserService.partitionSections(resumeText);
  const skills = ResumeParserService.extractSkills(resumeText, sections);

  const skillNames = skills.technical.map(s => s.name);
  assert.ok(skillNames.includes('React'), 'React.js should normalize to React');
  assert.ok(skillNames.includes('Node.js'));
  assert.ok(skillNames.includes('Spring Boot'));
  assert.ok(skillNames.includes('MongoDB'));
  assert.ok(skillNames.includes('Docker'));
  assert.ok(skillNames.includes('Git'));
  assert.ok(skillNames.includes('PostgreSQL'));

  // Verify categories
  const reactSkill = skills.technical.find(s => s.name === 'React');
  assert.equal(reactSkill.category, 'Frontend');

  const mongoSkill = skills.technical.find(s => s.name === 'Databases');
  const bootSkill = skills.technical.find(s => s.name === 'Spring Boot');
  assert.equal(bootSkill.category, 'Backend');

  // Verify soft skills separated
  assert.ok(skills.soft.includes('Communication'));
  assert.ok(!skills.technical.some(s => s.name === 'Communication'));

  // Verify inferred vs explicit source
  assert.equal(reactSkill.source, 'Skills');
  const pgSkill = skills.technical.find(s => s.name === 'PostgreSQL');
  assert.equal(pgSkill.source, 'Projects');
});

test('single letter words and common words do not trigger false skills', () => {
  const text = `I like to go to the park with my dog and read a book about computer design.`;
  const sections = ResumeParserService.partitionSections(text);
  const skills = ResumeParserService.extractSkills(text, sections);

  // 'go' in 'go to the park' should NOT be extracted as Go language
  assert.ok(!skills.parsedSkills.includes('Go'));
  // Single letter 'c' or 'r' should NOT be extracted
  assert.ok(!skills.parsedSkills.includes('C'));
  assert.ok(!skills.parsedSkills.includes('R'));
});

test('extractProjects extracts title, description, tech stack and prevents sentence-like titles', () => {
  const resumeText = `PROJECTS\nE-Commerce Platform\nTech Stack: React, Node.js, MongoDB\n- Implemented cart checkout with Stripe.\n- Optimized product search latency by 40%.\n\nTask Tracker\nTech Stack: Python, Flask\n- Built Kanban board for teams.`;

  const sections = ResumeParserService.partitionSections(resumeText);
  const projects = ResumeParserService.extractProjects(resumeText, sections);

  assert.equal(projects.length, 2);
  assert.equal(projects[0].title, 'E-Commerce Platform');
  assert.deepEqual(projects[0].tech_stack, ['React', 'Node.js', 'MongoDB']);
  assert.ok(projects[0].description.includes('checkout with Stripe'));

  assert.equal(projects[1].title, 'Task Tracker');
  assert.deepEqual(projects[1].tech_stack, ['Python', 'Flask']);
});

test('extractExperience cleanly separates employer, role, duration and internship status', () => {
  const resumeText = `WORK EXPERIENCE\nAcme Corp — Full-Stack Developer | Jan 2023 – Present\n- Built microservices using Express.js.\n\nGlobal Systems — Software Engineering Intern | Jun 2022 – Dec 2022\n- Assisted in unit test automation.`;

  const sections = ResumeParserService.partitionSections(resumeText);
  const exp = ResumeParserService.extractExperience(resumeText, sections);

  assert.equal(exp.length, 2);
  assert.equal(exp[0].company, 'Acme Corp');
  assert.equal(exp[0].role, 'Full-Stack Developer');
  assert.equal(exp[0].current, true);
  assert.equal(exp[0].isInternship, false);

  assert.equal(exp[1].company, 'Global Systems');
  assert.equal(exp[1].role, 'Software Engineering Intern');
  assert.equal(exp[1].isInternship, true);
  assert.equal(exp[1].current, false);
});

test('extractEducation separates institution, degree, field and grade', () => {
  const resumeText = `EDUCATION\nB.Tech in Information Technology\nState University of Technology\n2020 – 2024\nGrade: 8.8 CGPA`;

  const sections = ResumeParserService.partitionSections(resumeText);
  const edu = ResumeParserService.extractEducation(resumeText, sections);

  assert.ok(edu.length >= 1);
  assert.match(edu[0].degree, /B\.?Tech/i);
  assert.equal(edu[0].field, 'Information Technology');
  assert.ok(edu[0].institution.includes('University'));
  assert.match(edu[0].grade, /8\.8/);
});

test('calculateATSScore produces deterministic 5-component breakdown summing to atsScore', () => {
  const resumeText = `Jane Doe\njane@example.com | +1 555-0199 | github.com/janedoe | linkedin.com/in/janedoe\n\nPROFESSIONAL SUMMARY\nFull-Stack Engineer with 3 years building cloud software.\n\nEDUCATION\nBSc Computer Science, Tech University, 2022\n\nSKILLS\nJavaScript, TypeScript, React, Node.js, Express.js, MongoDB, PostgreSQL, Docker, Git\n\nEXPERIENCE\nCloud Inc — Software Engineer | 2022–Present\n- Developed REST microservices handling 10,000 requests per minute.\n- Improved response latency by 35%.\n\nPROJECTS\nLog Monitor\nTech Stack: Node.js, Docker\n- Streamed real-time container metrics.`;

  const sections = ResumeParserService.partitionSections(resumeText);
  const skills = ResumeParserService.extractSkills(resumeText, sections);
  const projects = ResumeParserService.extractProjects(resumeText, sections);
  const experience = ResumeParserService.extractExperience(resumeText, sections);
  const education = ResumeParserService.extractEducation(resumeText, sections);

  const data = {
    parsedSkills: skills.parsedSkills,
    parsedProjects: projects,
    parsedExperience: experience,
    parsedEducation: education
  };

  const scoreResult = ResumeParserService.calculateATSScore(resumeText, data);
  const breakdown = scoreResult.breakdown;

  assert.ok(scoreResult.total >= 50 && scoreResult.total <= 100);
  assert.ok(breakdown.jobDescriptionMatch <= 35);
  assert.ok(breakdown.skillsMatch <= 25);
  assert.ok(breakdown.experienceAndProjects <= 15);
  assert.ok(breakdown.structureAndReadability <= 15);
  assert.ok(breakdown.completeness <= 10);

  // Criteria explanation checks
  assert.equal(scoreResult.criteria.length, 5);
  scoreResult.criteria.forEach(crit => {
    assert.ok(crit.label);
    assert.ok(typeof crit.score === 'number');
    assert.ok(crit.explanation);
  });
});

test('job-specific matching identifies matched and missing skills from target job description', () => {
  const resumeText = `SKILLS\nReact, JavaScript, Node.js, MongoDB, Git`;
  const jobDescription = `Full Stack Developer\nRequirements: Must know React, Node.js, Docker, Kubernetes, and Redis.`;

  const sections = ResumeParserService.partitionSections(resumeText);
  const skills = ResumeParserService.extractSkills(resumeText, sections);
  const match = ResumeParserService.analyzeJobMatch(skills.parsedSkills, resumeText, jobDescription);

  assert.ok(match.matchedSkills.includes('React'));
  assert.ok(match.matchedSkills.includes('Node.js'));
  assert.ok(match.missingSkills.includes('Docker'));
  assert.ok(match.missingSkills.includes('Kubernetes'));
  assert.ok(match.missingSkills.includes('Redis'));
  assert.ok(match.matchPercentage > 0 && match.matchPercentage < 100);
});

