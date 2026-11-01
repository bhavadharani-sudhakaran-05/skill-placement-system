const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const express = require('express');
const ResumeParserService = require('../services/resumeParser.service');
const ResumeAnalysisService = require('../services/resumeAnalysis.service');
const ResumeAiService = require('../services/resumeAi.service');
const upload = require('../middleware/upload.middleware');
const { validCases, malformedInputs } = require('./fixtures/resume-cases');

function withAiResult(result, operation) {
  const original = ResumeAiService.extractResume;
  ResumeAiService.extractResume = async () => result;
  return Promise.resolve().then(operation).finally(() => { ResumeAiService.extractResume = original; });
}

function createOnePixelScannedPdf() {
  const pixels = zlib.deflateSync(Buffer.from([255, 255, 255]));
  const imageStream = Buffer.concat([
    Buffer.from(`<< /Type /XObject /Subtype /Image /Width 1 /Height 1 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${pixels.length} >>\nstream\n`, 'ascii'),
    pixels,
    Buffer.from('\nendstream', 'ascii')
  ]);
  const content = Buffer.from('q 300 0 0 300 0 0 cm /Im0 Do Q', 'ascii');
  const contentStream = Buffer.concat([Buffer.from(`<< /Length ${content.length} >>\nstream\n`, 'ascii'), content, Buffer.from('\nendstream', 'ascii')]);
  const objects = [
    Buffer.from('<< /Type /Catalog /Pages 2 0 R >>', 'ascii'),
    Buffer.from('<< /Type /Pages /Kids [3 0 R] /Count 1 >>', 'ascii'),
    Buffer.from('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 300] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>', 'ascii'),
    imageStream,
    contentStream
  ];
  const chunks = [Buffer.from('%PDF-1.4\n', 'ascii')];
  const offsets = [0];
  let position = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(position);
    const head = Buffer.from(`${index + 1} 0 obj\n`, 'ascii');
    const tail = Buffer.from('\nendobj\n', 'ascii');
    chunks.push(head, object, tail);
    position += head.length + object.length + tail.length;
  });
  const xrefOffset = position;
  const xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, ...offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`)].join('');
  chunks.push(Buffer.from(`${xref}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`, 'ascii'));
  return Buffer.concat(chunks);
}

test('synthetic resume cases preserve variable record counts and source evidence', async () => {
  for (const fixture of validCases) {
    const normalizedText = ResumeParserService.normalizeResumeText(fixture.text);
    const data = ResumeAnalysisService.validateStructuredResult(fixture.result, normalizedText);
    assert.equal(data.projects.length, fixture.expected.projects, fixture.name);
    assert.equal(data.experience.length, fixture.expected.experience, fixture.name);
    assert.equal(data.education.length, fixture.expected.education, fixture.name);
    assert.equal(data.skills.length, fixture.expected.skills, fixture.name);
    if (fixture.expected.certifications !== undefined) {
      assert.equal(data.certifications.length, fixture.expected.certifications, fixture.name);
    }
    if (fixture.name === 'many projects and certifications') {
      assert.deepEqual(data.certifications.map(item => [item.name, item.issuer, item.date]), [
        ['Cloud Basics', 'North Institute', '2024'],
        ['Data Foundations', 'West Academy', '2023'],
        ['Applied Analytics', 'South Institute', '2022']
      ]);
      assert.equal(data.projects[0].title, 'Orchard');
      assert.equal(data.projects[0].tech_stack[0], 'Python');
      assert.match(data.projects[0].description, /crop tracker.*seasonal reports/i);
    }
    for (const record of [...data.projects, ...data.experience, ...data.education, ...data.certifications]) {
      assert.ok(record.evidence, `${fixture.name} record should retain source evidence`);
    }
  }
});

test('normalization keeps paragraph and bullet boundaries while joining wrapped hyphenated words', () => {
  const normalizedText = ResumeParserService.normalizeResumeText('SKILLS\r\n- prob-\r\nlem solving\r\n\r\nEXPERIENCE\r\nPage 2\r\nBuilt a system');
  assert.match(normalizedText, /problem solving/);
  assert.match(normalizedText, /\n\nEXPERIENCE/);
  assert.doesNotMatch(normalizedText, /Page 2/);
});

test('duplicate skill variants are normalized and unsupported facts are discarded', () => {
  const source = 'SKILLS\nJavaScript, React.js, JavaScript\nPROJECTS\nHarbor: Built a shipping dashboard in React.';
  const result = {
    skills: [
      { name: 'JavaScript', evidence: 'JavaScript, React.js', confidence: 0.9 },
      { name: 'JS', evidence: 'JavaScript, React.js', confidence: 0.9 },
      { name: 'Kubernetes', evidence: 'JavaScript, React.js', confidence: 0.9 }
    ],
    projects: [
      { title: 'Harbor', description: 'Built a shipping dashboard in React.', evidence: 'Harbor: Built a shipping dashboard in React.', confidence: 0.9 },
      { title: 'Unmentioned Project', description: 'Invented work.', evidence: 'Harbor: Built a shipping dashboard in React.', confidence: 0.9 }
    ]
  };
  const data = ResumeAnalysisService.validateStructuredResult(result, source);
  assert.deepEqual(data.skills.map(skill => skill.name), ['JavaScript']);
  assert.equal(data.projects.length, 1);
  assert.equal(data.projects[0].description, 'Built a shipping dashboard in React.');
});

test('valid projects survive PDF extraction separating the title and Tech Stack lines', () => {
  const source = `PROJECTS
Harbor Dashboard
PDF extracted description continuation
Tech Stack: React, JavaScript
Built a shipping dashboard for regional delivery status.`;
  const result = {
    projects: [{
      title: 'Harbor Dashboard',
      tech_stack: ['React', 'JavaScript'],
      description: 'Built a shipping dashboard for regional delivery status.',
      link: '',
      evidence: 'Harbor Dashboard PDF extracted description continuation Tech Stack: React, JavaScript Built a shipping dashboard for regional delivery status.',
      confidence: 0.9
    }]
  };

  const data = ResumeAnalysisService.validateStructuredResult(result, source);
  assert.equal(data.projects.length, 1);
  assert.deepEqual(data.projects[0], {
    title: 'Harbor Dashboard',
    tech_stack: ['React', 'JavaScript'],
    description: 'Built a shipping dashboard for regional delivery status.',
    link: '',
    evidence: 'Harbor Dashboard PDF extracted description continuation Tech Stack: React, JavaScript Built a shipping dashboard for regional delivery status.',
    confidence: 0.9,
    startDate: '',
    endDate: ''
  });
});

test('single-letter and generic English words are not accepted as skills', () => {
  const source = 'SKILLS\nR, Team, Python';
  const result = {
    skills: [
      { name: 'R', category: 'technical', source: 'explicit', evidence: 'R, Team, Python', confidence: 0.9 },
      { name: 'Team', category: 'soft', source: 'explicit', evidence: 'R, Team, Python', confidence: 0.9 },
      { name: 'Python', category: 'technical', source: 'explicit', evidence: 'R, Team, Python', confidence: 0.9 }
    ]
  };
  const data = ResumeAnalysisService.validateStructuredResult(result, source);
  assert.deepEqual(data.skills.map(skill => skill.name), ['Python']);

  const rLanguageSource = 'SKILLS\nR programming';
  const rLanguage = ResumeAnalysisService.validateStructuredResult({
    skills: [{ name: 'R', category: 'technical', source: 'explicit', evidence: 'R programming', confidence: 0.9 }]
  }, rLanguageSource);
  assert.deepEqual(rLanguage.skills.map(skill => skill.name), ['R']);
});

test('Skill Match counts distinct technical skills independently from job description coverage', async () => {
  const fixture = validCases[0];
  await withAiResult({ ...fixture.result, atsScore: 100, formattingScore: 100, skillMatchScore: 100, keywordScore: 100 }, async () => {
    const generic = await ResumeAnalysisService.analyzeResumeText(fixture.text);
    assert.equal(typeof generic.atsScore, 'number');
    assert.equal(typeof generic.formattingScore, 'number');
    assert.equal(generic.skillMatchScore, 15);
    assert.equal(generic.keywordScore, null);
    assert.match(generic.scoreDetails[0].explanation, /not an ATS compatibility guarantee/i);
    assert.match(generic.scoreDetails[0].explanation, /40%.*30%.*20%.*10%/);
    assert.match(generic.scoreDetails[1].explanation, /35%.*25%.*20%.*20%/);

    const targeted = await ResumeAnalysisService.analyzeResumeText(fixture.text, 'React JavaScript engineering role');
    assert.equal(targeted.skillMatchScore, generic.skillMatchScore);
    assert.equal(typeof targeted.keywordScore, 'number');
  });
});

test('Skill Match excludes soft skills and duplicate technical skills and caps at 100', async () => {
  const source = `Avery Stone\nSKILLS\n${Array.from({ length: 22 }, (_, index) => `Technology${index}`).join(', ')}, JavaScript, JS, collaboration`;
  const skills = Array.from({ length: 22 }, (_, index) => ({ name: `Technology${index}`, category: 'technical', evidence: `Technology${index}` }));
  skills.push(
    { name: 'JavaScript', category: 'technical', evidence: 'JavaScript' },
    { name: 'JS', category: 'technical', evidence: 'JavaScript' },
    { name: 'Collaboration', category: 'soft', evidence: 'collaboration' }
  );
  const result = await withAiResult({ skills }, () => ResumeAnalysisService.analyzeResumeText(source));
  assert.equal(result.skillMatchScore, 100);
});

test('AI prompt injects each uploaded resume dynamically and forbids model-generated scores', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.RESUME_AI_MODEL;
  const previousFetch = global.fetch;
  const requests = [];
  try {
    process.env.GEMINI_API_KEY = 'unit-test-only-key';
    global.fetch = async (_url, options) => {
      requests.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{}' }] }, finishReason: 'STOP' }] }) };
    };

    const firstResume = 'Synthetic Applicant Alpha\nPROJECTS\nNorthstar: Tech Stack: Python';
    const secondResume = 'Synthetic Applicant Beta\nCERTIFICATIONS\nSample Cloud Credential';
    await ResumeAiService.extractResume(firstResume);
    await ResumeAiService.extractResume(secondResume);

    const prompts = requests.map(request => request.contents[0].parts[0].text);
    assert.equal(prompts.length, 2);
    assert.ok(prompts[0].includes(firstResume));
    assert.ok(prompts[1].includes(secondResume));
    assert.ok(!prompts[0].includes(secondResume));
    assert.ok(!prompts[1].includes(firstResume));
    assert.match(prompts[0], /Return only one valid JSON object/i);
    assert.match(prompts[0], /standalone line directly above its Tech Stack\/TechStack/i);
    assert.match(prompts[0], /technologies only in tech_stack/i);
    assert.match(prompts[0], /full name, issuer, and date/i);
    assert.match(prompts[0], /Never return ATS.*scores/i);
    for (const scoreField of ['atsScore', 'formattingScore', 'skillMatchScore', 'keywordScore']) {
      assert.doesNotMatch(prompts[0], new RegExp(`"${scoreField}"\\s*:`));
    }
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.RESUME_AI_MODEL;
    else process.env.RESUME_AI_MODEL = previousModel;
  }
});

test('overlong extracted resume text is rejected instead of silently truncating analyzed content', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = global.fetch;
  let called = false;
  try {
    process.env.GEMINI_API_KEY = 'unit-test-only-key';
    global.fetch = async () => { called = true; throw new Error('fetch should not be called'); };
    await assert.rejects(ResumeAiService.extractResume('x'.repeat(30001)), error => error.code === 'AI_SOURCE_TOO_LARGE');
    assert.equal(called, false);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test('empty or malformed text is rejected instead of generating resume facts', async () => {
  for (const text of malformedInputs) {
    await assert.rejects(ResumeAnalysisService.analyzeResumeText(text), error => error.code === 'INSUFFICIENT_TEXT');
  }
});

test('resume file validation requires a matching supported extension and MIME type', () => {
  assert.equal(upload.isSupportedResumeFile('candidate.pdf', 'application/pdf'), true);
  assert.equal(upload.isSupportedResumeFile('candidate.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), true);
  assert.equal(upload.isSupportedResumeFile('candidate.doc', 'application/msword'), false);
  assert.equal(upload.isSupportedResumeFile('candidate.pdf', 'text/plain'), false);
  assert.equal(upload.isSupportedResumeFile('../candidate.pdf', 'application/pdf'), true);
});

test('empty, corrupted, and unsupported documents return clear parser errors', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'skillforge-resume-test-'));
  try {
    const emptyDocx = path.join(dir, 'empty.docx');
    const malformedPdf = path.join(dir, 'broken.pdf');
    const unsupported = path.join(dir, 'notes.txt');
    await fs.writeFile(emptyDocx, '');
    await fs.writeFile(malformedPdf, '%PDF-not-a-real-pdf');
    await fs.writeFile(unsupported, 'plain text');
    await assert.rejects(ResumeParserService.extractDocument(emptyDocx), error => error.code === 'INVALID_DOCUMENT');
    await assert.rejects(ResumeParserService.extractDocument(unsupported), error => error.code === 'UNSUPPORTED_FORMAT');
    await assert.rejects(ResumeParserService.extractDocument(malformedPdf), error => error.code === 'PDF_PARSE_FAILED');
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('AI integration reports missing credentials, timeout, and malformed JSON without network access', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.RESUME_AI_MODEL;
  const previousFetch = global.fetch;
  try {
    delete process.env.GEMINI_API_KEY;
    await assert.rejects(ResumeAiService.extractResume('synthetic resume text'), error => error.code === 'AI_NOT_CONFIGURED');

    process.env.GEMINI_API_KEY = 'test-only-key';
    global.fetch = async () => { throw Object.assign(new Error('timeout'), { name: 'AbortError' }); };
    await assert.rejects(ResumeAiService.extractResume('synthetic resume text'), error => error.code === 'AI_TIMEOUT');

    global.fetch = async () => ({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{bad json' }] }, finishReason: 'STOP' }] }) });
    await assert.rejects(ResumeAiService.extractResume('synthetic resume text'), error => error.code === 'AI_INVALID_RESPONSE');
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.RESUME_AI_MODEL;
    else process.env.RESUME_AI_MODEL = previousModel;
  }
});

test('Gemini model defaults to gemini-3.8-flash and RESUME_AI_MODEL overrides it', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.RESUME_AI_MODEL;
  const previousFetch = global.fetch;
  const requestedPaths = [];
  try {
    process.env.GEMINI_API_KEY = 'unit-test-key';
    delete process.env.RESUME_AI_MODEL;
    global.fetch = async url => {
      requestedPaths.push(new URL(url).pathname);
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{}' }] }, finishReason: 'STOP' }] }) };
    };

    await ResumeAiService.extractResume('synthetic resume text');
    process.env.RESUME_AI_MODEL = 'gemini-test-override';
    await ResumeAiService.extractResume('synthetic resume text');

    assert.match(requestedPaths[0], /\/models\/gemini-3\.8-flash:generateContent$/);
    assert.match(requestedPaths[1], /\/models\/gemini-test-override:generateContent$/);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.RESUME_AI_MODEL;
    else process.env.RESUME_AI_MODEL = previousModel;
  }
});

test('Gemini provider errors distinguish model, authentication, quota, and rate limits', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousModel = process.env.RESUME_AI_MODEL;
  const previousFetch = global.fetch;
  const cases = [
    {
      status: 404,
      payload: { error: { code: 404, status: 'NOT_FOUND', message: 'models/gemini-missing is not found for API version v1beta.' } },
      code: 'AI_MODEL_UNAVAILABLE',
      calls: 1
    },
    {
      status: 400,
      payload: { error: { code: 400, status: 'INVALID_ARGUMENT', message: 'API key not valid. Please pass a valid API key.' } },
      code: 'AI_AUTH_FAILED',
      calls: 1
    },
    {
      status: 429,
      payload: {
        error: {
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          message: 'Quota exceeded for requests per day.',
          details: [{
            type: 'type.googleapis.com/google.rpc.QuotaFailure',
            violations: [{ quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier', description: 'Daily quota exceeded.' }]
          }]
        }
      },
      code: 'AI_QUOTA_EXHAUSTED',
      calls: 1
    },
    {
      status: 429,
      payload: {
        error: {
          code: 429,
          status: 'RESOURCE_EXHAUSTED',
          message: 'Rate limit exceeded for requests per minute.',
          details: [{
            type: 'type.googleapis.com/google.rpc.QuotaFailure',
            violations: [{ quotaId: 'GenerateRequestsPerMinutePerProjectPerModel-FreeTier' }]
          }]
        }
      },
      code: 'AI_RATE_LIMITED',
      calls: 2
    }
  ];

  try {
    process.env.GEMINI_API_KEY = 'unit-test-key';
    delete process.env.RESUME_AI_MODEL;

    for (const scenario of cases) {
      let calls = 0;
      global.fetch = async () => {
        calls += 1;
        return { ok: false, status: scenario.status, json: async () => scenario.payload };
      };

      await assert.rejects(ResumeAiService.extractResume('synthetic resume text'), error => {
        assert.equal(error.code, scenario.code);
        assert.doesNotMatch(error.message, /unit-test-key|generativelanguage\.googleapis\.com/);
        return true;
      });
      assert.equal(calls, scenario.calls, `${scenario.code} retry count`);
    }
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
    if (previousModel === undefined) delete process.env.RESUME_AI_MODEL;
    else process.env.RESUME_AI_MODEL = previousModel;
  }
});

test('requested AI schema keeps projects, internship, certifications, and backend scores grounded', async () => {
  const source = `PROJECTS
Orchard GitHub
Tech Stack: Python
- Built a crop tracker for local growers and documented seasonal harvest notes.
Harbor
Tech Stack: React, JavaScript
- Created a shipping dashboard for viewing regional delivery status.
Beacon
Tech Stack: Node.js
- Developed a status monitor that summarizes service health reports.
EXPERIENCE
Maple Lab ΓÇö Intern, Summer 2024
- Prepared weekly sample summaries for the research team.
CERTIFICATIONS
Cloud Basics ΓÇö North Institute ΓÇö 2024
Data Foundations ΓÇö West Academy ΓÇö 2023
Accessibility Essentials`;
  const modelResult = {
    name: 'Alex Rivera', name_evidence: 'Alex Rivera',
    contact: { email: '', phone: '', links: [], evidence: 'Alex Rivera' },
    education: [],
    skills: { languages: ['Python', 'JavaScript'], frameworks: ['React'], databases: [], tools: ['r'], core_subjects: [], concepts: [], soft_skills: [] },
    experience: [{ company: 'Maple Lab', role: 'Intern', duration: 'Summer 2024', responsibilities: ['Prepared weekly sample summaries for the research team.'], evidence: 'Maple Lab ΓÇö Intern, Summer 2024 Prepared weekly sample summaries for the research team.', confidence: 0.9 }],
    projects: [
      { title: 'Orchard GitHub', tech_stack: ['Python'], description: 'Built a crop tracker for local growers and documented seasonal harvest notes.', link: 'GitHub', evidence: 'Orchard GitHub Tech Stack: Python Built a crop tracker for local growers and documented seasonal harvest notes.', confidence: 0.9 },
      { title: 'Harbor', tech_stack: ['React', 'JavaScript'], description: 'Created a shipping dashboard for viewing regional delivery status.', evidence: 'Harbor Tech Stack: React, JavaScript Created a shipping dashboard for viewing regional delivery status.', confidence: 0.9 },
      { title: 'Beacon', tech_stack: ['Node.js'], description: 'Developed a status monitor that summarizes service health reports.', evidence: 'Beacon Tech Stack: Node.js Developed a status monitor that summarizes service health reports.', confidence: 0.9 }
    ],
    achievements: [],
    certifications: [
      { name: 'Cloud Basics', issuer: 'North Institute', date: '2024', evidence: 'Cloud Basics ΓÇö North Institute ΓÇö 2024', confidence: 0.9 },
      { name: 'Data Foundations', issuer: 'West Academy', date: '2023', evidence: 'Data Foundations ΓÇö West Academy ΓÇö 2023', confidence: 0.9 },
      { name: 'Accessibility Essentials', issuer: '', date: '', evidence: 'Accessibility Essentials', confidence: 0.9 }
    ],
    scores: { ats_score: 1, skill_match: 2, formatting: 3, keywords: 4 },
    suggestions: []
  };

  const result = await withAiResult(modelResult, () => ResumeAnalysisService.analyzeResumeText(source));
  assert.deepEqual(result.parsedProjects.map(project => project.title), ['Orchard', 'Harbor', 'Beacon']);
  assert.equal(result.parsedProjects.length, 3);
  assert.match(result.parsedProjects[0].description, /documented seasonal harvest notes/);
  assert.deepEqual(result.parsedProjects[0].tech_stack, ['Python']);
  assert.equal(result.parsedProjects[0].title, 'Orchard');
  assert.equal(result.parsedProjects[0].link, '');
  assert.equal(result.parsedExperience.length, 1);
  assert.equal(result.parsedExperience[0].employer, 'Maple Lab');
  assert.equal(result.parsedCertifications.length, 3);
  assert.equal(result.parsedCertifications[2].name, 'Accessibility Essentials');
  assert.equal(result.parsedCertifications[2].issuer, '');
  assert.equal(result.parsedCertifications[2].date, '');
  assert.ok(!result.parsedSkills.some(skill => skill.toLowerCase() === 'r'));
  assert.notEqual(result.atsScore, 1);
  assert.match(result.scoreDetails[0].explanation, /not an ATS compatibility guarantee/i);
});

test('AI request embeds only the current resume text and rejects silent truncation', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = global.fetch;
  const currentText = 'Synthetic current resume content with unique marker CURRENT-UPLOAD-2749.';
  let requestBody;
  try {
    process.env.GEMINI_API_KEY = 'test-only-key';
    global.fetch = async (_url, options) => {
      requestBody = JSON.parse(options.body);
      return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '{\"projects\":[],\"certifications\":[]}' }] }, finishReason: 'STOP' }] }) };
    };
    await ResumeAiService.extractResume(currentText);
    const prompt = requestBody.contents[0].parts[0].text;
    assert.match(prompt, /CURRENT-UPLOAD-2749/);
    assert.doesNotMatch(prompt, /\\{\\{resume_text\\}\\}/);
    await assert.rejects(ResumeAiService.extractResume('x'.repeat(30001)), error => error.status === 413);
  } finally {
    global.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});

test('resume endpoints remain protected by existing authentication middleware', async () => {
  const app = express();
  app.use('/api/resume', require('../routes/resume.routes'));
  const server = app.listen(0);
  try {
    await new Promise(resolve => server.once('listening', resolve));
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/resume`);
    const payload = await response.json();
    assert.equal(response.status, 401);
    assert.equal(payload.success, false);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test('synthetic scanned PDF invokes OCR when configured and degrades clearly when unavailable', async t => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'skillforge-scanned-test-'));
  const pdfPath = path.join(dir, 'synthetic-scan.pdf');
  try {
    await fs.writeFile(pdfPath, createOnePixelScannedPdf());
    try {
      await ResumeParserService.extractDocument(pdfPath);
      assert.fail('A blank scanned page should not produce invented resume text.');
    } catch (error) {
      if (error.code === 'OCR_UNAVAILABLE') {
        t.skip('Poppler or Tesseract is not installed; OCR unavailable state was returned.');
      } else {
        assert.equal(error.code, 'INSUFFICIENT_TEXT');
      }
    }
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('optional local resume regression checks three projects and one internship without sending the file to AI', {
  skip: !(process.env.RESUME_REGRESSION_FILE && process.env.RESUME_REGRESSION_RESULT_FILE)
}, async () => {
  const resumePath = path.resolve(process.env.RESUME_REGRESSION_FILE);
  const resultPath = path.resolve(process.env.RESUME_REGRESSION_RESULT_FILE);
  const extracted = await ResumeParserService.extractDocument(resumePath);
  const savedResult = JSON.parse(await fs.readFile(resultPath, 'utf8'));
  const structured = savedResult.data?.structuredData || savedResult.structuredData || savedResult;
  const validated = ResumeAnalysisService.validateStructuredResult(structured, extracted.text);
  assert.equal(validated.projects.length, 3);
  assert.equal(validated.experience.filter(item => /intern/i.test(item.role)).length, 1);
});
