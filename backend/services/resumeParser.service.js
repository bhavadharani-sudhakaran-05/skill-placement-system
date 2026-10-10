const fs = require('fs');
const os = require('os');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const execFileAsync = promisify(execFile);
const MIN_TEXT_LENGTH = 120;
const MIN_WORDS = 25;
const MAX_OCR_PAGES = 8;

function createError(message, code, status = 422) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function normalizeResumeText(input) {
  const lines = String(input || '')
    .replace(/\u0000/g, '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u00a0\u2007\u202f]/g, ' ')
    .split('\n')
    .map(line => line.replace(/[\t ]+/g, ' ').trim());

  const lineCounts = new Map();
  lines.filter(Boolean).forEach(line => {
    const key = line.toLowerCase();
    lineCounts.set(key, (lineCounts.get(key) || 0) + 1);
  });

  const cleaned = [];
  const retainedHeaders = new Set();
  for (const line of lines) {
    if (!line) {
      if (cleaned.length && cleaned[cleaned.length - 1] !== '') cleaned.push('');
      continue;
    }
    if (/^page\s+\d+(?:\s+(?:of|\/)\s+\d+)?$/i.test(line)) continue;
    const headerLike = line.length < 100 && (/@/.test(line) || /https?:\/\//i.test(line) || /\b(?:confidential|curriculum vitae|resume)\b/i.test(line));
    if (headerLike && lineCounts.get(line.toLowerCase()) > 1) {
      if (retainedHeaders.has(line.toLowerCase())) continue;
      retainedHeaders.add(line.toLowerCase());
    }

    const previous = cleaned[cleaned.length - 1];
    if (previous && /[A-Za-z]-$/.test(previous) && /^[a-z]/.test(line)) {
      cleaned[cleaned.length - 1] = previous.slice(0, -1) + line;
    } else {
      cleaned.push(line);
    }
  }

  return cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function runOcr(filePath) {
  const workDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'skillforge-resume-ocr-'));
  const prefix = path.join(workDir, 'page');
  const pdfToPpm = process.env.PDFTOPPM_CMD || 'pdftoppm';
  const tesseract = process.env.TESSERACT_CMD || 'tesseract';

  try {
    await execFileAsync(pdfToPpm, [
      '-f', '1', '-l', String(MAX_OCR_PAGES), '-r', '180', '-png', filePath, prefix
    ], { timeout: 30000, windowsHide: true, maxBuffer: 1024 * 1024 });
    const images = (await fs.promises.readdir(workDir))
      .filter(name => /^page-\d+\.png$/i.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .slice(0, MAX_OCR_PAGES);
    if (!images.length) throw new Error('No PDF pages could be rendered.');

    const pages = [];
    for (const image of images) {
      const { stdout } = await execFileAsync(tesseract, [path.join(workDir, image), 'stdout', '-l', 'eng'], {
        timeout: 30000,
        windowsHide: true,
        maxBuffer: 2 * 1024 * 1024
      });
      pages.push(stdout);
    }
    return { text: pages.join('\n\n'), pages: images.length };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createError('This PDF appears to be scanned, and OCR is unavailable. Install Poppler and Tesseract or upload a text-based PDF/DOCX.', 'OCR_UNAVAILABLE', 422);
    }
    if (error.killed || error.code === 'ETIMEDOUT') {
      throw createError('OCR took too long to process this PDF. Please upload a text-based PDF or DOCX.', 'OCR_TIMEOUT', 422);
    }
    throw createError('OCR could not read this scanned PDF. Please upload a clearer document.', 'OCR_FAILED', 422);
  } finally {
    await fs.promises.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

class ResumeParserService {
  static async extractDocument(filePath, originalName = path.basename(filePath)) {
    const extension = path.extname(originalName).toLowerCase();
    const buffer = await fs.promises.readFile(filePath);
    let text;
    let source = 'text';

    if (extension === '.pdf') {
      if (buffer.subarray(0, 5).toString() !== '%PDF-') {
        throw createError('The uploaded file is not a valid PDF.', 'INVALID_DOCUMENT');
      }
      const pdfMarkers = buffer.toString('latin1');
      if (!/\/Type\s*\/Page(?:\s|\/|>)/.test(pdfMarkers) || !/%%EOF\s*$/.test(pdfMarkers)) {
        throw createError('The PDF appears to be corrupted or incomplete. Please upload a valid PDF.', 'PDF_PARSE_FAILED');
      }
      let pdf;
      try {
        pdf = await pdfParse(buffer);
      } catch (error) {
        try {
          const ocr = await runOcr(filePath);
          text = ocr.text;
          source = 'ocr';
        } catch (ocrError) {
          if (['OCR_UNAVAILABLE', 'OCR_TIMEOUT'].includes(ocrError.code)) throw ocrError;
          throw createError('The PDF could not be read by the text parser or OCR. Please upload a valid, unencrypted PDF.', 'PDF_PARSE_FAILED');
        }
      }
      if (pdf) text = pdf.text || '';
      if (source !== 'ocr' && text.replace(/\s/g, '').length < MIN_TEXT_LENGTH) {
        const ocr = await runOcr(filePath);
        text = ocr.text;
        source = 'ocr';
      }
    } else if (extension === '.docx') {
      if (buffer.length < 4 || buffer.subarray(0, 2).toString() !== 'PK') {
        throw createError('The uploaded file is not a valid DOCX document.', 'INVALID_DOCUMENT');
      }
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value;
      } catch (error) {
        throw createError('The DOCX document could not be read. Please save it again and retry.', 'DOCX_PARSE_FAILED');
      }
    } else {
      throw createError('Unsupported resume format. Upload a PDF or DOCX file.', 'UNSUPPORTED_FORMAT', 415);
    }

    const normalizedText = normalizeResumeText(text);
    const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
    if (normalizedText.length < MIN_TEXT_LENGTH || wordCount < MIN_WORDS) {
      throw createError('We could not extract enough readable resume text. Please upload a clearer PDF or DOCX.', 'INSUFFICIENT_TEXT');
    }
    return {
      text: normalizedText,
      wordCount,
      source
    };
  }

  static normalizeResumeText(text) {
    return normalizeResumeText(text);
  }
}

module.exports = ResumeParserService;
