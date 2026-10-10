const freshGraduate = {
  name: 'fresh graduate without employment',
  text: `Alex Rivera\nalex@example.test\nPROFILE\nRecent computer science graduate interested in accessible web applications.\nACADEMIC BACKGROUND\nBSc Computer Science, North University, 2025\nPROJECTS\nCampus Map: Built an accessible campus map with React and JavaScript.\nSKILLS\nReact, JavaScript, Git`,
  result: {
    contact: { name: 'Alex Rivera', email: 'alex@example.test', evidence: 'Alex Rivera alex@example.test' },
    summary: { text: 'Recent computer science graduate interested in accessible web applications.', evidence: 'Recent computer science graduate interested in accessible web applications.', confidence: 0.95 },
    education: [{ institution: 'North University', degree: 'BSc', field: 'Computer Science', endDate: '2025', evidence: 'BSc Computer Science, North University, 2025', confidence: 0.94 }],
    projects: [{ title: 'Campus Map', description: 'Built an accessible campus map with React and JavaScript.', technologies: ['React', 'JavaScript'], evidence: 'Campus Map: Built an accessible campus map with React and JavaScript.', confidence: 0.94 }],
    skills: [
      { name: 'React', category: 'framework', source: 'explicit', evidence: 'React, JavaScript, Git', confidence: 0.96 },
      { name: 'JavaScript', category: 'technical', source: 'explicit', evidence: 'JavaScript, Git', confidence: 0.96 },
      { name: 'Git', category: 'tools', source: 'explicit', evidence: 'Git', confidence: 0.9 }
    ]
  },
  expected: { projects: 1, experience: 0, education: 1, skills: 3 }
};

const experiencedProfessional = {
  name: 'professional with multiple employers and roles',
  text: `Morgan Lee\nWORK HISTORY\nNorthwind Labs — Software Engineer | 2021–2023\nBuilt a billing dashboard used by internal teams.\nCedar Systems — Senior Engineer | 2023–Present\nLed API migration and reduced deployment downtime.`,
  result: {
    experience: [
      { employer: 'Northwind Labs', role: 'Software Engineer', startDate: '2021', endDate: '2023', description: 'Built a billing dashboard used by internal teams.', evidence: 'Northwind Labs — Software Engineer | 2021–2023 Built a billing dashboard used by internal teams.', confidence: 0.92 },
      { employer: 'Cedar Systems', role: 'Senior Engineer', startDate: '2023', endDate: 'Present', current: true, description: 'Led API migration and reduced deployment downtime.', evidence: 'Cedar Systems — Senior Engineer | 2023–Present Led API migration and reduced deployment downtime.', confidence: 0.94 }
    ]
  },
  expected: { projects: 0, experience: 2, education: 0, skills: 0 }
};

const manyProjectsAndCertifications = {
  name: 'many projects and certifications',
  text: `PROJECTS\nOrchard: Built a crop tracker in Python.\nHarbor: Built a shipping dashboard in React.\nBeacon: Created a status monitor with Node.js.\nCERTIFICATIONS\nCloud Basics, North Institute, 2024\nData Foundations, West Academy, 2023`,
  result: {
    projects: [
      { title: 'Orchard', description: 'Built a crop tracker in Python.', technologies: ['Python'], evidence: 'Orchard: Built a crop tracker in Python.', confidence: 0.92 },
      { title: 'Harbor', description: 'Built a shipping dashboard in React.', technologies: ['React'], evidence: 'Harbor: Built a shipping dashboard in React.', confidence: 0.91 },
      { title: 'Beacon', description: 'Created a status monitor with Node.js.', technologies: ['Node.js'], evidence: 'Beacon: Created a status monitor with Node.js.', confidence: 0.9 }
    ],
    certifications: [
      { name: 'Cloud Basics', issuer: 'North Institute', date: '2024', evidence: 'Cloud Basics, North Institute, 2024', confidence: 0.94 },
      { name: 'Data Foundations', issuer: 'West Academy', date: '2023', evidence: 'Data Foundations, West Academy, 2023', confidence: 0.93 }
    ]
  },
  expected: { projects: 3, experience: 0, education: 0, skills: 0, certifications: 2 }
};

const noOptionalSections = {
  name: 'resume without projects or certifications',
  text: `SUMMARY\nCustomer support specialist with experience resolving account questions.\nEXPERIENCE\nHarbor Services — Support Associate\nResolved billing questions and documented customer requests.`,
  result: {
    summary: { text: 'Customer support specialist with experience resolving account questions.', evidence: 'Customer support specialist with experience resolving account questions.', confidence: 0.9 },
    experience: [{ employer: 'Harbor Services', role: 'Support Associate', description: 'Resolved billing questions and documented customer requests.', evidence: 'Harbor Services — Support Associate Resolved billing questions and documented customer requests.', confidence: 0.91 }]
  },
  expected: { projects: 0, experience: 1, education: 0, skills: 0, certifications: 0 }
};

const nonstandardHeadings = {
  name: 'non-standard section labels',
  text: `CAREER JOURNEY\nLumen Studio — Designer\nCreated product illustrations.\nWHAT I HAVE BUILT\nPortfolio Refresh: Reworked a portfolio using Figma.\nCORE COMPETENCIES\nFigma, prototyping`,
  result: {
    experience: [{ employer: 'Lumen Studio', role: 'Designer', description: 'Created product illustrations.', evidence: 'Lumen Studio — Designer Created product illustrations.', confidence: 0.9 }],
    projects: [{ title: 'Portfolio Refresh', description: 'Reworked a portfolio using Figma.', technologies: ['Figma'], evidence: 'Portfolio Refresh: Reworked a portfolio using Figma.', confidence: 0.9 }],
    skills: [{ name: 'Figma', category: 'tools', source: 'explicit', evidence: 'Figma, prototyping', confidence: 0.9 }]
  },
  expected: { projects: 1, experience: 1, education: 0, skills: 1 }
};

const wrappedMultipage = {
  name: 'wrapped bullets and repeated page headers',
  text: `Taylor Quinn | taylor@example.test\nEXPERIENCE\nPine Works — Analyst\nImproved the reporting process by consolidating weekly reports\ninto one documented workflow.\nTaylor Quinn | taylor@example.test\nPage 2\nPROJECTS\nTransit Review: Analyzed regional transit schedules.`,
  result: {
    contact: { name: 'Taylor Quinn', email: 'taylor@example.test', evidence: 'Taylor Quinn taylor@example.test', confidence: 0.9 },
    experience: [{ employer: 'Pine Works', role: 'Analyst', description: 'Improved the reporting process by consolidating weekly reports into one documented workflow.', evidence: 'Pine Works — Analyst Improved the reporting process by consolidating weekly reports into one documented workflow.', confidence: 0.91 }],
    projects: [{ title: 'Transit Review', description: 'Analyzed regional transit schedules.', evidence: 'Transit Review: Analyzed regional transit schedules.', confidence: 0.88 }]
  },
  expected: { projects: 1, experience: 1, education: 0, skills: 0 }
};

const unusualLayout = {
  name: 'table-like and column-ordered text',
  text: `EDUCATION | EXPERIENCE\nWest College, BA History | Civic Archive, Research Assistant\n2019 | 2020-2022\nPROJECTS | SKILLS\nArchive Search: Built a records search | SQL, Python`,
  result: {
    education: [{ institution: 'West College', degree: 'BA', field: 'History', endDate: '2019', evidence: 'West College, BA History', confidence: 0.82 }],
    experience: [{ employer: 'Civic Archive', role: 'Research Assistant', startDate: '2020', endDate: '2022', evidence: 'Civic Archive, Research Assistant 2020-2022', confidence: 0.83 }],
    projects: [{ title: 'Archive Search', description: 'Built a records search', technologies: ['SQL', 'Python'], evidence: 'Archive Search: Built a records search', confidence: 0.84 }],
    skills: [
      { name: 'SQL', category: 'technical', source: 'explicit', evidence: 'SQL, Python', confidence: 0.9 },
      { name: 'Python', category: 'technical', source: 'explicit', evidence: 'SQL, Python', confidence: 0.9 }
    ]
  },
  expected: { projects: 1, experience: 1, education: 1, skills: 2 }
};

const duplicateSkillsAndArtifacts = {
  name: 'duplicate skills and broken extraction artifacts',
  text: `SKILLS\nJavaScript, JavaScript, React.js\nEXPERIENCE\nBrightline — Developer\nMaintained a React.js interface.\n--- ---`,
  result: {
    skills: [
      { name: 'JavaScript', category: 'technical', source: 'explicit', evidence: 'JavaScript, JavaScript, React.js', confidence: 0.95 },
      { name: 'JavaScript', category: 'technical', source: 'explicit', evidence: 'JavaScript, JavaScript, React.js', confidence: 0.95 },
      { name: 'React.js', category: 'framework', source: 'explicit', evidence: 'JavaScript, JavaScript, React.js', confidence: 0.9 }
    ],
    experience: [{ employer: 'Brightline', role: 'Developer', description: 'Maintained a React.js interface.', evidence: 'Brightline — Developer Maintained a React.js interface.', confidence: 0.89 }]
  },
  expected: { projects: 0, experience: 1, education: 0, skills: 2 }
};

const incompleteDates = {
  name: 'incomplete dates and missing details',
  text: `EXPERIENCE\nMaple Lab — Intern\nPrepared weekly sample summaries.\nEDUCATION\nDiploma in Design, Central School`,
  result: {
    experience: [{ employer: 'Maple Lab', role: 'Intern', description: 'Prepared weekly sample summaries.', evidence: 'Maple Lab — Intern Prepared weekly sample summaries.', confidence: 0.9 }],
    education: [{ institution: 'Central School', degree: 'Diploma', field: 'Design', evidence: 'Diploma in Design, Central School', confidence: 0.88 }]
  },
  expected: { projects: 0, experience: 1, education: 1, skills: 0 }
};

module.exports = {
  validCases: [freshGraduate, experiencedProfessional, manyProjectsAndCertifications, noOptionalSections, nonstandardHeadings, wrappedMultipage, unusualLayout, duplicateSkillsAndArtifacts, incompleteDates],
  malformedInputs: ['', '   ', '\u0000'.repeat(200), 'x'.repeat(140)]
};
