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

test('scores are measurable and job-specific scores stay unavailable without a job description', async () => {
  const fixture = validCases[0];
  await withAiResult(fixture.result, async () => {
    const generic = await ResumeAnalysisService.analyzeResumeText(fixture.text);
    assert.equal(typeof generic.atsScore, 'number');
    assert.equal(typeof generic.formattingScore, 'number');
    assert.equal(generic.skillMatchScore, null);
    assert.equal(generic.keywordScore, null);
    assert.match(generic.scoreDetails[0].explanation, /not an ATS compatibility guarantee/i);

    const targeted = await ResumeAnalysisService.analyzeResumeText(fixture.text, 'React JavaScript engineering role');
    assert.equal(typeof targeted.skillMatchScore, 'number');
    assert.equal(typeof targeted.keywordScore, 'number');
  });
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
