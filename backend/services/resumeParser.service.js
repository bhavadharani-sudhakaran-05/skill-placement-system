const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');

const execFileAsync = promisify(execFile);
const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024;
const MAX_OCR_PAGES = 25;

function parserError(message, code, status = 422) {
  return Object.assign(new Error(message), { code, status });
}

function hasReadableText(value) {
  return Boolean(String(value || '').replace(/[\s\u200b\ufeff]/g, ''));
}

async function extractScannedPdfText(filePath, pageCount) {
  if (Number(pageCount) > MAX_OCR_PAGES) {
    throw parserError(`Scanned PDFs over ${MAX_OCR_PAGES} pages cannot be OCR processed.`, 'DOCUMENT_TOO_LARGE', 413);
  }

  let temporaryDirectory;
  try {
    temporaryDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'skillforge-resume-ocr-'));
    const imagePrefix = path.join(temporaryDirectory, 'page');
    try {
      await execFileAsync('pdftoppm', ['-f', '1', '-l', String(MAX_OCR_PAGES), '-r', '200', '-png', filePath, imagePrefix], {
        timeout: 30000,
        maxBuffer: 1024 * 1024
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw parserError('OCR is unavailable because the PDF rendering tools are not installed.', 'OCR_UNAVAILABLE', 503);
      }
      throw parserError('The scanned PDF could not be prepared for OCR.', 'OCR_FAILED', 422);
    }

    const pageImages = (await fs.promises.readdir(temporaryDirectory))
      .filter(name => /^page-\d+\.png$/i.test(name))
      .sort((left, right) => Number(left.match(/\d+/)[0]) - Number(right.match(/\d+/)[0]));
    if (!pageImages.length) throw parserError('The scanned PDF contains no readable pages.', 'INSUFFICIENT_TEXT', 422);

    const pageText = [];
    for (const imageName of pageImages) {
      try {
        const { stdout } = await execFileAsync('tesseract', [path.join(temporaryDirectory, imageName), 'stdout', '--psm', '6'], {
          timeout: 30000,
          maxBuffer: 2 * 1024 * 1024
        });
        if (hasReadableText(stdout)) pageText.push(stdout);
      } catch (error) {
        if (error.code === 'ENOENT') {
          throw parserError('OCR is unavailable because Tesseract is not installed.', 'OCR_UNAVAILABLE', 503);
        }
        throw parserError('The scanned PDF could not be read by OCR.', 'OCR_FAILED', 422);
      }
    }
    return pageText.join('\n\n');
  } finally {
    if (temporaryDirectory) await fs.promises.rm(temporaryDirectory, { recursive: true, force: true });
  }
}

class ResumeParserService {
  // Comprehensive Skill Taxonomy with Canonical Names & Aliases
  static skillTaxonomy = [
    // Programming Languages
    { name: 'JavaScript', category: 'Programming Languages', aliases: ['javascript', 'js', 'ecmascript'] },
    { name: 'TypeScript', category: 'Programming Languages', aliases: ['typescript', 'ts'] },
    { name: 'Python', category: 'Programming Languages', aliases: ['python', 'python3', 'py'] },
    { name: 'Java', category: 'Programming Languages', aliases: ['java', 'core java'] },
    { name: 'C++', category: 'Programming Languages', aliases: ['c++', 'cpp', 'c plus plus'] },
    { name: 'C#', category: 'Programming Languages', aliases: ['c#', 'csharp', 'c sharp'] },
    { name: 'C', category: 'Programming Languages', aliases: ['c language', 'c programming'], strictToken: true },
    { name: 'SQL', category: 'Programming Languages', aliases: ['sql', 'structured query language'] },
    { name: 'R', category: 'Programming Languages', aliases: ['r language', 'r programming', 'rstudio'], strictToken: true },
    { name: 'Go', category: 'Programming Languages', aliases: ['golang', 'go language'], strictToken: true },
    { name: 'Rust', category: 'Programming Languages', aliases: ['rust', 'rustlang'] },
    { name: 'PHP', category: 'Programming Languages', aliases: ['php', 'php7', 'php8'] },
    { name: 'Ruby', category: 'Programming Languages', aliases: ['ruby', 'ruby on rails'] },
    { name: 'Kotlin', category: 'Programming Languages', aliases: ['kotlin'] },
    { name: 'Swift', category: 'Programming Languages', aliases: ['swift'] },
    { name: 'Dart', category: 'Programming Languages', aliases: ['dart'] },

    // Frontend
    { name: 'React', category: 'Frontend', aliases: ['react', 'react.js', 'reactjs', 'react js'] },
    { name: 'Next.js', category: 'Frontend', aliases: ['next.js', 'nextjs', 'next js'] },
    { name: 'Angular', category: 'Frontend', aliases: ['angular', 'angular.js', 'angularjs', 'angular 2+'] },
    { name: 'Vue.js', category: 'Frontend', aliases: ['vue', 'vue.js', 'vuejs', 'vue js'] },
    { name: 'HTML5', category: 'Frontend', aliases: ['html', 'html5'] },
    { name: 'CSS3', category: 'Frontend', aliases: ['css', 'css3'] },
    { name: 'Tailwind CSS', category: 'Frontend', aliases: ['tailwind css', 'tailwindcss', 'tailwind'] },
    { name: 'Bootstrap', category: 'Frontend', aliases: ['bootstrap', 'bootstrap 5', 'bootstrap 4'] },
    { name: 'Redux', category: 'Frontend', aliases: ['redux', 'redux toolkit', 'rtk'] },
    { name: 'Sass', category: 'Frontend', aliases: ['sass', 'scss'] },
    { name: 'jQuery', category: 'Frontend', aliases: ['jquery'] },

    // Backend
    { name: 'Node.js', category: 'Backend', aliases: ['node.js', 'nodejs', 'node js', 'node'] },
    { name: 'Express.js', category: 'Backend', aliases: ['express.js', 'expressjs', 'express js', 'express'] },
    { name: 'Spring Boot', category: 'Backend', aliases: ['spring boot', 'springboot', 'spring framework'] },
    { name: 'Django', category: 'Backend', aliases: ['django', 'django rest framework', 'drf'] },
    { name: 'Flask', category: 'Backend', aliases: ['flask'] },
    { name: 'FastAPI', category: 'Backend', aliases: ['fastapi', 'fast api'] },
    { name: 'Nest.js', category: 'Backend', aliases: ['nest.js', 'nestjs', 'nest js'] },
    { name: '.NET', category: 'Backend', aliases: ['.net', 'asp.net', 'dotnet', '.net core'] },
    { name: 'GraphQL', category: 'Backend', aliases: ['graphql', 'apollo graphql'] },
    { name: 'REST APIs', category: 'Backend', aliases: ['rest api', 'rest apis', 'restful api', 'restful apis', 'rest services'] },
    { name: 'JWT Authentication', category: 'Backend', aliases: ['jwt authentication', 'jwt', 'json web tokens'] },

    // Databases
    { name: 'MongoDB', category: 'Databases', aliases: ['mongodb', 'mongo', 'mongoose'] },
    { name: 'PostgreSQL', category: 'Databases', aliases: ['postgresql', 'postgres', 'psql'] },
    { name: 'MySQL', category: 'Databases', aliases: ['mysql'] },
    { name: 'Redis', category: 'Databases', aliases: ['redis'] },
    { name: 'SQLite', category: 'Databases', aliases: ['sqlite', 'sqlite3'] },
    { name: 'Oracle Database', category: 'Databases', aliases: ['oracle database', 'oracle db', 'pl/sql'] },
    { name: 'Firebase', category: 'Databases', aliases: ['firebase', 'firestore', 'firebase realtime database'] },
    { name: 'Cassandra', category: 'Databases', aliases: ['cassandra', 'apache cassandra'] },
    { name: 'DynamoDB', category: 'Databases', aliases: ['dynamodb', 'aws dynamodb'] },

    // AI & Machine Learning
    { name: 'TensorFlow', category: 'AI & Machine Learning', aliases: ['tensorflow.js', 'tensorflowjs', 'tensorflow', 'tf.js', 'tf'] },
    { name: 'FaceAPI', category: 'AI & Machine Learning', aliases: ['faceapi.js', 'faceapi', 'face-api.js', 'face api'] },
    { name: 'PyTorch', category: 'AI & Machine Learning', aliases: ['pytorch', 'torch'] },
    { name: 'Machine Learning', category: 'AI & Machine Learning', aliases: ['machine learning', 'ml algorithms'] },
    { name: 'Deep Learning', category: 'AI & Machine Learning', aliases: ['deep learning', 'neural networks'] },
    { name: 'NLP', category: 'AI & Machine Learning', aliases: ['nlp', 'natural language processing'] },
    { name: 'Computer Vision', category: 'AI & Machine Learning', aliases: ['computer vision', 'opencv', 'cv'] },
    { name: 'Scikit-Learn', category: 'AI & Machine Learning', aliases: ['scikit-learn', 'scikit learn', 'sklearn'] },
    { name: 'Pandas', category: 'AI & Machine Learning', aliases: ['pandas'] },
    { name: 'NumPy', category: 'AI & Machine Learning', aliases: ['numpy'] },
    { name: 'Keras', category: 'AI & Machine Learning', aliases: ['keras'] },
    { name: 'Large Language Models', category: 'AI & Machine Learning', aliases: ['llm', 'llms', 'large language models', 'langchain'] },

    // Cloud & DevOps
    { name: 'AWS', category: 'Cloud & DevOps', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'] },
    { name: 'Google Cloud', category: 'Cloud & DevOps', aliases: ['google cloud', 'gcp', 'google cloud platform'] },
    { name: 'Azure', category: 'Cloud & DevOps', aliases: ['azure', 'microsoft azure'] },
    { name: 'Docker', category: 'Cloud & DevOps', aliases: ['docker', 'containerization', 'docker compose'] },
    { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['kubernetes', 'k8s'] },
    { name: 'CI/CD', category: 'Cloud & DevOps', aliases: ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'] },
    { name: 'Jenkins', category: 'Cloud & DevOps', aliases: ['jenkins'] },
    { name: 'GitHub Actions', category: 'Cloud & DevOps', aliases: ['github actions'] },
    { name: 'Linux', category: 'Cloud & DevOps', aliases: ['linux', 'unix', 'ubuntu'] },
    { name: 'Nginx', category: 'Cloud & DevOps', aliases: ['nginx'] },

    // Tools & Deployment
    { name: 'Git', category: 'Tools & Deployment', aliases: ['git', 'version control'], strictToken: true },
    { name: 'GitHub', category: 'Tools & Deployment', aliases: ['github'] },
    { name: 'GitLab', category: 'Tools & Deployment', aliases: ['gitlab'] },
    { name: 'Postman', category: 'Tools & Deployment', aliases: ['postman'] },
    { name: 'Figma', category: 'Tools & Deployment', aliases: ['figma'] },
    { name: 'Jira', category: 'Tools & Deployment', aliases: ['jira'] },
    { name: 'VS Code', category: 'Tools & Deployment', aliases: ['vs code', 'vscode', 'visual studio code'] },
    { name: 'Vercel', category: 'Tools & Deployment', aliases: ['vercel'] },
    { name: 'Render', category: 'Tools & Deployment', aliases: ['render', 'render.com'] },
    { name: 'IntelliJ IDEA', category: 'Tools & Deployment', aliases: ['intellij', 'intellij idea'] },

    // Core Concepts
    { name: 'Data Structures & Algorithms', category: 'Core Concepts', aliases: ['data structures and algorithms', 'data structures & algorithms', 'dsa', 'data structures'] },
    { name: 'Object-Oriented Programming (OOP)', category: 'Core Concepts', aliases: ['object-oriented programming (oop)', 'object-oriented programming', 'oop', 'oops'] },
    { name: 'DBMS', category: 'Core Concepts', aliases: ['dbms', 'database management systems', 'database management'] },
    { name: 'Caching', category: 'Core Concepts', aliases: ['caching', 'memcached'] },
    { name: 'Microservices', category: 'Core Concepts', aliases: ['microservices', 'microservice architecture'] },
    { name: 'Agile / Scrum', category: 'Core Concepts', aliases: ['agile', 'scrum', 'kanban'] }
  ];

  static softSkillsList = [
    'Communication', 'Problem-Solving', 'Problem Solving', 'Teamwork',
    'Leadership', 'Time Management', 'Critical Thinking', 'Adaptability',
    'Collaboration', 'Analytical Thinking', 'Presentation'
  ];

  static atsKeywords = [
    'achieved', 'improved', 'developed', 'managed', 'created', 'designed',
    'implemented', 'increased', 'decreased', 'reduced', 'led', 'coordinated',
    'launched', 'built', 'delivered', 'optimized', 'streamlined', 'architected',
    'spearheaded', 'orchestrated', 'engineered', 'automated', 'deployed'
  ];

  /** Normalize extracted document text without flattening paragraphs or lists. */
  static normalizeResumeText(value) {
    if (!value) return '';
    return String(value)
      .replace(/\r\n?/g, '\n')
      .replace(/[\u00ad\u200b\ufeff]/g, '')
      .replace(/[\u00a0\u2000-\u200a\u202f\u205f\u3000]/g, ' ')
      // Ligatures
      .replace(/\ufb01/g, 'fi')
      .replace(/\ufb02/g, 'fl')
      .replace(/\ufb00/g, 'ff')
      .replace(/\ufb03/g, 'ffi')
      .replace(/\ufb04/g, 'ffl')
      // Strip XML / SVG markup or PDF drawing instructions accidentally emitted
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(/<\/?(?:svg|path|g|rect|circle|text|tspan|defs|clippath)[^>]*>/gi, '')
      .replace(/\b(?:xmlns|viewBox|d=["'][^"']*["'])/gi, '')
      // Standardize bullet points at start of lines
      .replace(/^[ \t]*[•●○■▪▫✦★·✓✔\u2022\u25cf\u25e6\u25aa\u25ab\u2219\u00b7]\s*/gm, '- ')
      // Join wrapped hyphenated words
      .replace(/([A-Za-z])-[ \t]*\n[ \t]*([a-z])/g, '$1$2')
      // Remove page numbers and headers like "Page 2" or "Page 1 of 3"
      .replace(/^[ \t]*(?:page\s+)?\d+(?:\s+of\s+\d+)?[ \t]*$/gim, '')
      .replace(/^[ \t]*\d+\s*\|\s*Page[ \t]*$/gim, '')
      .split('\n')
      .map(line => line.replace(/[ \t]+$/g, '').trim())
      .filter(line => !/^(?:<<\/?|stream|endstream|xref|trailer|startxref|%%EOF)/i.test(line))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /** Render PDF page items with spatial Y-clustering and X-sorting to preserve multi-column flow */
  static renderPageWithCoordinates(pageData) {
    return pageData.getTextContent({ normalizeWhitespace: true }).then(textContent => {
      if (!textContent || !textContent.items || !textContent.items.length) return '';
      const items = textContent.items.map(it => ({
        str: it.str,
        x: it.transform[4],
        y: it.transform[5],
        w: it.width,
        h: it.height
      })).filter(it => it.str);

      items.sort((a, b) => b.y - a.y || a.x - b.x);

      const lines = [];
      let currentLine = [];
      let currentY = null;

      for (const item of items) {
        if (currentY === null) {
          currentY = item.y;
          currentLine.push(item);
        } else if (Math.abs(item.y - currentY) <= 3.5) {
          currentLine.push(item);
        } else {
          currentLine.sort((a, b) => a.x - b.x);
          lines.push(currentLine);
          currentLine = [item];
          currentY = item.y;
        }
      }
      if (currentLine.length) {
        currentLine.sort((a, b) => a.x - b.x);
        lines.push(currentLine);
      }

      const textLines = lines.map(lineItems => {
        let lineStr = '';
        let prevItem = null;
        for (const item of lineItems) {
          if (!lineStr) {
            lineStr = item.str;
          } else {
            const gap = item.x - (prevItem.x + (prevItem.w || 0));
            if (gap > 1.5 && !lineStr.endsWith(' ') && !item.str.startsWith(' ')) {
              lineStr += ' ';
            }
            lineStr += item.str;
          }
          prevItem = item;
        }
        return lineStr.trim();
      }).filter(Boolean);

      return textLines.join('\n');
    });
  }

  /** Extract text from supported document formats, using OCR for image-only PDFs. */
  static async extractDocument(filePath, originalName = filePath) {
    const extension = path.extname(String(originalName || filePath || '')).toLowerCase();
    if (!['.pdf', '.docx'].includes(extension)) {
      throw parserError('Unsupported resume format. Upload a PDF or DOCX file.', 'UNSUPPORTED_FORMAT', 415);
    }

    let stat;
    try {
      stat = await fs.promises.stat(filePath);
    } catch (error) {
      throw parserError('The uploaded resume file could not be read.', 'INVALID_DOCUMENT', 422);
    }
    if (!stat.isFile() || stat.size === 0) {
      throw parserError('The uploaded resume file is empty or invalid.', 'INVALID_DOCUMENT', 422);
    }
    if (stat.size > MAX_RESUME_FILE_SIZE) {
      throw parserError('The uploaded resume exceeds the 5 MB file limit.', 'FILE_TOO_LARGE', 413);
    }

    let extractedText = '';
    let extractionSource = extension.slice(1);
    let confidence = 0.98;
    if (extension === '.pdf') {
      const pdfBuffer = await fs.promises.readFile(filePath);
      const latin1 = pdfBuffer.toString('latin1');
      if (/\/Encrypt\s+\d+\s+\d+\s+R\b/i.test(latin1)) {
        throw parserError('The PDF is encrypted or password-protected. Please upload an unprotected copy.', 'PDF_ENCRYPTED', 422);
      }

      let pdfData;
      try {
        pdfData = await pdfParse(pdfBuffer, { pagerender: ResumeParserService.renderPageWithCoordinates });
        if (!pdfData || !pdfData.text || pdfData.text.trim().length < 50) {
          pdfData = await pdfParse(pdfBuffer);
        }
      } catch (error) {
        try {
          pdfData = await pdfParse(pdfBuffer);
        } catch (innerError) {
          const appearsImageOnly = /\/Subtype\s*\/Image\b/i.test(latin1);
          if (!appearsImageOnly) {
            throw parserError('The PDF could not be parsed. Please upload a valid PDF.', 'PDF_PARSE_FAILED', 422);
          }
          extractedText = await extractScannedPdfText(filePath);
          extractionSource = 'ocr';
          confidence = 0.65;
        }
      }
      if (pdfData) extractedText = pdfData.text || '';
      if (pdfData && !hasReadableText(this.normalizeResumeText(extractedText))) {
        extractedText = await extractScannedPdfText(filePath, pdfData.numpages);
        extractionSource = 'ocr';
        confidence = 0.65;
      }
    } else {
      try {
        const document = await mammoth.extractRawText({ path: filePath });
        extractedText = document.value || '';
      } catch (error) {
        throw parserError('The DOCX document could not be parsed. Please upload a valid DOCX file.', 'DOCX_PARSE_FAILED', 422);
      }
    }

    const normalizedText = this.normalizeResumeText(extractedText);
    if (!hasReadableText(normalizedText)) {
      throw parserError('No readable resume text was found in the document.', 'INSUFFICIENT_TEXT', 422);
    }
    return { text: normalizedText, source: extractionSource, confidence };
  }

  /** Partition the resume text into identified logical sections */
  static partitionSections(text) {
    const lines = text.split('\n');
    const sections = {
      header: [],
      summary: [],
      education: [],
      skills: [],
      experience: [],
      internships: [],
      projects: [],
      certifications: [],
      achievements: [],
      publications: [],
      additional: []
    };

    const sectionPatterns = [
      { key: 'summary', regex: /^(?:professional\s+summary|career\s+summary|summary|profile|about\s+me|executive\s+summary|career\s+objective|objective)$/i },
      { key: 'skills', regex: /^(?:technical\s+skills|skills\s*(?:&|and)\s*technologies|skills\s*(?:&|and)\s*tools|core\s+competencies|key\s+skills|skills|technologies|technical\s+expertise|areas\s+of\s+expertise)$/i },
      { key: 'experience', regex: /^(?:(?:professional|work|employment|career|practical|relevant)\s+experience|employment\s+history|career\s+history|work\s+history|career\s+journey|(?:work\s+)?experience\s*(?:&|and|\/)\s*internships?|internships?\s*(?:&|and|\/)\s*(?:work\s+)?experience)$/i },
      { key: 'internships', regex: /^(?:(?:professional|summer|industrial|vocational|winter|graduate|tech|engineering)?\s*internships?|internship\s+(?:experience|details|training|history|work|program)|industrial\s+training|vocational\s+training|intern\s+experience)$/i },
      { key: 'projects', regex: /^(?:academic\s+projects|personal\s+projects|key\s+projects|selected\s+projects|technical\s+projects|projects|what\s+i\s+have\s+built)$/i },
      { key: 'education', regex: /^(?:educational\s+background|academic\s+background|academic\s+qualifications|education\s*(?:&|and)\s*credentials|qualifications|education)$/i },
      { key: 'certifications', regex: /^(?:certifications?\s*(?:&|and)\s*licenses?|licenses?\s*(?:&|and)\s*certifications?|professional\s+certifications|certifications?|certificates?|licenses?)$/i },
      { key: 'achievements', regex: /^(?:honors\s*(?:&|and)\s*awards|awards\s*(?:&|and)\s*honors|key\s+achievements|achievements|accomplishments|awards)$/i },
      { key: 'publications', regex: /^(?:publications|research\s+papers|conference\s+proceedings)$/i },
      { key: 'additional', regex: /^(?:positions\s+of\s+responsibility|leadership|volunteer\s+experience|extra[- ]curricular\s+activities|languages)$/i }
    ];

    let currentSection = 'header';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        if (currentSection && sections[currentSection]) sections[currentSection].push('');
        continue;
      }

      // Check if line represents section headings (or column headings like EDUCATION | EXPERIENCE)
      const cleanLine = line.replace(/^[#*=_-\s]+|[#*=_:\s-]+$/g, '').trim();

      // Handle dual-column table heading lines like "EDUCATION | EXPERIENCE"
      if (cleanLine.includes('|')) {
        const parts = cleanLine.split('|').map(p => p.trim());
        const leftMatch = sectionPatterns.find(p => p.regex.test(parts[0]));
        if (leftMatch) {
          currentSection = leftMatch.key;
          continue;
        }
      }

      const match = sectionPatterns.find(p => p.regex.test(cleanLine));
      if (match && cleanLine.length < 50) {
        currentSection = match.key;
        continue;
      }

      if (sections[currentSection]) {
        sections[currentSection].push(line);
      } else {
        sections.header.push(line);
      }
    }

    const result = {};
    for (const [key, lineArr] of Object.entries(sections)) {
      result[key] = lineArr.join('\n').trim();
    }
    return result;
  }

  /** Extract candidate contact information */
  static extractContact(text, headerText) {
    const contact = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: ''
    };

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) contact.email = emailMatch[0];

    const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/);
    if (phoneMatch) contact.phone = phoneMatch[0];

    const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|pub)\/([a-zA-Z0-9_-]+)/i);
    if (linkedinMatch) contact.linkedin = linkedinMatch[0];

    const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
    if (githubMatch) contact.github = githubMatch[0];

    // Extract candidate name from the top header lines
    const headerLines = (headerText || text).split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of headerLines.slice(0, 5)) {
      if (!line.includes('@') && !phoneMatch?.includes(line) && !line.includes('http') && line.length < 50) {
        // Name usually has 2-4 words, capitalized
        const words = line.split(/\s+/);
        if (words.length >= 1 && words.length <= 4 && !/^(resume|curriculum|cv|profile)/i.test(line)) {
          contact.name = line.replace(/[^a-zA-Z\s.'-]/g, '').trim();
          break;
        }
      }
    }

    return contact;
  }

  /** Extract structured skills with categories, aliases, and source sections */
  static extractSkills(text, sections = {}) {
    const skillsSection = sections.skills || '';
    const projectsSection = sections.projects || '';
    const experienceSection = `${sections.experience || ''}\n${sections.internships || ''}`;

    const technicalSkillsMap = new Map();
    const softSkillsFound = new Set();

    // Check soft skills
    this.softSkillsList.forEach(soft => {
      const escaped = soft.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(text)) {
        softSkillsFound.add(soft);
      }
    });

    // Match technical skills
    for (const skill of this.skillTaxonomy) {
      let matched = false;
      let matchedSource = 'Skills';

      for (const alias of skill.aliases) {
        let regex;
        if (skill.strictToken && alias.length <= 2) {
          // Strict boundaries for C, R, Go, Git to prevent false positives in words like "customer", "for", "react"
          if (alias.toLowerCase() === 'c') {
            regex = /(?:\bC\s+language\b|\bC\s+programming\b|(?:^|[,;|/\s])C(?:$|[,;|/\s]))/i;
          } else if (alias.toLowerCase() === 'r') {
            regex = /(?:\bR\s+(?:programming|language|statistical)\b|\bRStudio\b|(?:^|[,;|/\s])R(?:$|[,;|/\s]))/i;
          } else if (alias.toLowerCase() === 'go') {
            regex = /(?:\bGo\s+language\b|\bgolang\b)/i;
          } else {
            regex = new RegExp(`\\b${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
          }
        } else {
          const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+.-])${escaped}(?:$|[^a-zA-Z0-9_#+.-])`, 'i');
        }

        // Test in skills section first (explicit)
        if (skillsSection && regex.test(skillsSection)) {
          matched = true;
          matchedSource = 'Skills';
          break;
        }
        // Test in projects section (inferred)
        if (projectsSection && regex.test(projectsSection)) {
          matched = true;
          matchedSource = 'Projects';
        }
        // Test in experience section
        if (!matched && experienceSection && regex.test(experienceSection)) {
          matched = true;
          matchedSource = 'Experience';
        }
        // Global fallback if no skills section partitioned
        if (!matched && !skillsSection && regex.test(text)) {
          matched = true;
          matchedSource = 'Resume Text';
        }
      }

      if (matched && !technicalSkillsMap.has(skill.name)) {
        technicalSkillsMap.set(skill.name, {
          name: skill.name,
          category: skill.category,
          source: matchedSource
        });
      }
    }

    const technical = Array.from(technicalSkillsMap.values());
    const soft = Array.from(softSkillsFound);
    const parsedSkills = technical.map(s => s.name);

    const categorized = {};
    for (const s of technical) {
      const cat = s.category || 'General Technical';
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push(s);
    }

    return {
      technical,
      categorized,
      soft,
      parsedSkills,
      inferred: technical.filter(s => s.source !== 'Skills').map(s => s.name),
      counts: {
        technical: technical.length,
        soft: soft.length,
        total: technical.length + soft.length
      }
    };
  }

  /** Extract project entries with title, tech stack, description, links, and dates */
  static extractProjects(text, sections = {}) {
    const rawProjectsText = sections.projects || '';
    if (!rawProjectsText) return [];

    const isProjectTitle = (l) => {
      let clean = l.replace(/\s+(github|live demo|demo|source|code)\b.*$/i, '').trim();
      clean = clean.replace(/\s*\|\s*$/, '').trim();
      if (!clean || clean.length < 3 || clean.length > 90) return false;
      if (/[.,;]$/.test(clean)) return false;
      if (/^[•\-*]/.test(clean)) return false;
      if (/^[a-z]/.test(clean)) return false;
      if (/^(?:and|to|for|with|in|on|of|by|from|using|which|that)\b/i.test(clean)) return false;
      if (/^(?:tech\s*stack|technologies|technology\s*stack|tools|built with)\b/i.test(clean)) return false;
      if (/^(?:github|live demo|demo|source|view project|code|\s*\|\s*)+$/i.test(clean)) return false;
      if (/^(?:developed|implemented|integrated|applied|designed|selected|built|created|used|worked|led|managed|spearheaded|engineered|architected|configured|improved|resolved|optimized)\b/i.test(clean)) return false;
      if (/^(?:achievements?|education|experience|certifications?|skills)\b/i.test(clean)) return false;
      return true;
    };

    const lines = rawProjectsText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedLineProjects = [];
    let current = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const isTech = /^(?:tech\s*stack|technologies|technology\s*stack|tools\s*used|built\s*with)\s*[:|-]?/i.test(line);

      if (isProjectTitle(line)) {
        if (current && !current.title) {
          current.title = line.replace(/\s+(github|live demo|demo|source|code)\b.*$/i, '').replace(/\s*\|\s*$/, '').trim();
          if (!current.link && /github|live demo|http/i.test(line)) {
            const m = line.match(/(https?:\/\/[^\s]+|github(?:\.com)?|live demo)/i);
            if (m) current.link = m[0];
          }
          continue;
        }
        if (current) {
          parsedLineProjects.push(current);
        }
        let title = line.replace(/\s+(github|live demo|demo|source|code)\b.*$/i, '').replace(/\s*\|\s*$/, '').trim();
        current = {
          title,
          link: /github|live demo|http/i.test(line) ? (line.match(/(https?:\/\/[^\s]+|github(?:\.com)?|live demo)/i) || [''])[0] : '',
          duration: '',
          techStack: [],
          descriptionLines: []
        };
        continue;
      }

      if (isTech && current && current.techStack.length > 0) {
        parsedLineProjects.push(current);
        current = {
          title: '',
          link: '',
          duration: '',
          techStack: [],
          descriptionLines: []
        };
      }

      if (!current) {
        current = {
          title: '',
          link: '',
          duration: '',
          techStack: [],
          descriptionLines: []
        };
      }

      if (/^https?:\/\/|github\.com\//i.test(line)) {
        if (!current.link) current.link = (line.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+/i) || [''])[0];
        continue;
      }

      if (/^(?:github|live demo|demo|source|view project|code|\s*\|\s*)+$/i.test(line)) {
        if (!current.link) current.link = line;
        continue;
      }

      if (isTech) {
        const techText = line.replace(/^(?:tech\s*stack|technologies|technology\s*stack|tools\s*used|built\s*with)\s*[:|-]?/i, '').trim();
        const rawTokens = techText.split(/[,|/•]/)
          .map(t => t.trim())
          .filter(t => t.length > 1 && !/^[•\-\*]$/.test(t) && t.toLowerCase() !== 'r')
          .map(t => {
            if (/^springboot$/i.test(t)) return 'Spring Boot';
            if (/^react$/i.test(t)) return 'React';
            if (/^react(?:\.js|js)$/i.test(t)) return 'React.js';
            if (/^node(?:\.js|js)?$/i.test(t)) return 'Node.js';
            if (/^express(?:\.js|js)?$/i.test(t)) return 'Express.js';
            if (/^tensorflow(?:\.js|js)?$/i.test(t)) return 'TensorFlow.js';
            if (/^faceapi(?:\.js)?$/i.test(t)) return 'FaceAPI';
            if (/^intellij$/i.test(t)) return 'IntelliJ IDEA';
            return t;
          });
        current.techStack.push(...rawTokens);
        continue;
      }

      const dateMatch = line.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\b20\d{2}\b/i);
      if (dateMatch && line.length < 50 && !line.startsWith('-')) {
        current.duration = line;
        continue;
      }

      current.descriptionLines.push(line.replace(/^[•\-\*]\s*/, ''));
    }

    if (current) parsedLineProjects.push(current);

    const validProjects = parsedLineProjects.filter(p => p.title || p.techStack.length > 0 || p.descriptionLines.length > 0);

    if (validProjects.length > 0) {
      return validProjects.map(p => {
        let stack = Array.from(new Set(p.techStack));
        if (!stack.length) {
          const extracted = this.extractSkills(p.descriptionLines.join(' '));
          stack = extracted.technical.slice(0, 6).map(t => t.name);
        }
        const title = p.title || (stack.length > 0 ? `${stack[0]} Project` : 'Project');
        return {
          title,
          name: title,
          description: p.descriptionLines.join(' ').trim() || title,
          tech_stack: stack,
          technologies: stack,
          link: p.link,
          duration: p.duration,
          confidence: 0.95
        };
      }).slice(0, 10);
    }

    // Fallback: block-based parser
    let rawBlocks = rawProjectsText.split(/\n\s*\n/).map(b => b.trim()).filter(b => b.length > 5);
    const mergedBlocks = [];
    for (let i = 0; i < rawBlocks.length; i++) {
      const bLines = rawBlocks[i].split('\n').map(l => l.trim()).filter(Boolean);
      const hasTitle = bLines.some(isProjectTitle);
      if (!hasTitle && i + 1 < rawBlocks.length) {
        rawBlocks[i + 1] = rawBlocks[i] + '\n' + rawBlocks[i + 1];
      } else if (!hasTitle && mergedBlocks.length > 0) {
        mergedBlocks[mergedBlocks.length - 1] += '\n' + rawBlocks[i];
      } else {
        mergedBlocks.push(rawBlocks[i]);
      }
    }

    const projects = [];
    for (const block of mergedBlocks) {
      const bLines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (!bLines.length) continue;

      let title = bLines.find(isProjectTitle) || (bLines[0].length < 80 ? bLines[0] : '');
      if (!title) continue;

      title = title.replace(/^[#*=_-\s]+|[#*=_:\s-]+$/g, '').trim();

      let techStack = [];
      let descriptionLines = [];
      let link = '';
      let duration = '';

      for (const line of bLines) {
        if (line === title) continue;
        if (/^https?:\/\/|github\.com\//i.test(line)) {
          link = (line.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+/i) || [''])[0];
          continue;
        }
        if (/^(?:github|live demo|demo|source|view project|code|\s*\|\s*)+$/i.test(line)) continue;
        if (/^(?:tech\s*stack|technologies|technology\s*stack|tools\s*used|built\s*with)\s*[:|-]?/i.test(line)) {
          const techText = line.replace(/^(?:tech\s*stack|technologies|technology\s*stack|tools\s*used|built\s*with)\s*[:|-]?/i, '').trim();
          techStack = techText.split(/[,|/•]/).map(t => t.trim()).filter(t => t.length > 1 && t.toLowerCase() !== 'r');
          continue;
        }
        const dateMatch = line.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\b20\d{2}\b/i);
        if (dateMatch && line.length < 50 && !line.startsWith('-')) {
          duration = line;
          continue;
        }
        descriptionLines.push(line.replace(/^[•\-\*]\s*/, ''));
      }

      if (!techStack.length) {
        const extracted = this.extractSkills(block);
        techStack = extracted.technical.slice(0, 6).map(t => t.name);
      }

      projects.push({
        title,
        name: title,
        description: descriptionLines.join(' ').trim() || title,
        tech_stack: techStack,
        technologies: techStack,
        link,
        duration,
        confidence: 0.92
      });
    }

    return projects.slice(0, 10);
  }

  static chunkProjectLines(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const chunks = [];
    let current = [];

    for (const line of lines) {
      const isHeader = !line.startsWith('-') && !line.startsWith('•') &&
        !line.toLowerCase().startsWith('tech') && line.length < 80 &&
        (line.includes(':') || !lines.find(l => l === line && l.length > 80));

      if (isHeader && current.length > 0 && current.some(l => l.startsWith('-') || l.length > 50)) {
        chunks.push(current.join('\n'));
        current = [line];
      } else {
        current.push(line);
      }
    }
    if (current.length) chunks.push(current.join('\n'));
    return chunks;
  }

  static isSentenceLikeTitle(title) {
    return !title || title.length > 90 || title.split(/\s+/).length > 10 ||
      /^(built|created|developed|implemented|designed|improved|used|worked|led|managed|spearheaded)\b/i.test(title);
  }

  /** Extract work experience and internship records */
  static extractExperience(text, sections = {}) {
    const rawExp = (sections.experience || '').trim();
    const rawIntern = (sections.internships || '').trim();

    const experience = [];
    const ROLE_KEYWORDS = /\b(intern|internship|trainee|developer|engineer|specialist|analyst|designer|manager|lead|architect|consultant|assistant|associate|coordinator|administrator|officer|programmer)\b/i;
    const COMPANY_KEYWORDS = /\b(centre|center|inc|inc\.|corp|corp\.|ltd|ltd\.|limited|llc|pvt|private|technologies|technology|solutions|systems|innovations?|labs?|studio|software|services|infotech|university|college|organization|group)\b/i;

    const parseBlock = (blockText, isFromInternSection) => {
      if (!blockText) return;
      const entries = blockText.split(/\n\s*\n/).filter(e => e.trim().length > 15);

      for (const entry of entries) {
        const lines = entry.split('\n').map(l => l.trim()).filter(Boolean);
        if (!lines.length) continue;

        let employer = '';
        let role = '';
        let duration = '';
        let startDate = '';
        let endDate = '';
        let isInternship = isFromInternSection;
        const responsibilities = [];

        // Check for duration line or pattern
        const durationPattern = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–to]+\s*(present|current|now|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\d{1,2}\/\d{4}|\d{4})\b/i;
        const dateMatch = entry.match(durationPattern);
        if (dateMatch) {
          duration = dateMatch[0].trim();
          startDate = dateMatch[1].trim();
          endDate = dateMatch[2].trim();
        }

        let firstLine = lines[0];
        if (dateMatch && firstLine.includes(dateMatch[0])) {
          firstLine = firstLine.replace(dateMatch[0], '').trim();
        }

        if (firstLine.includes('—') || firstLine.includes('–') || firstLine.includes('|')) {
          const parts = firstLine.split(/[—–|]/).map(p => p.trim());
          if (ROLE_KEYWORDS.test(parts[0]) && !ROLE_KEYWORDS.test(parts[1])) {
            role = parts[0];
            employer = parts[1];
          } else {
            employer = parts[0];
            role = parts[1] || '';
          }
          if (parts[2] && !duration) duration = parts[2];
        } else if (firstLine.toLowerCase().includes(' at ')) {
          const parts = firstLine.split(/\s+at\s+/i);
          role = parts[0].trim();
          employer = parts[1]?.trim() || '';
        } else if (ROLE_KEYWORDS.test(firstLine) && lines.length > 1 && !lines[1].startsWith('-') && !lines[1].startsWith('•')) {
          role = firstLine;
          employer = lines[1];
        } else if (lines.length > 1 && !lines[1].startsWith('-') && !lines[1].startsWith('•') && ROLE_KEYWORDS.test(lines[1])) {
          employer = firstLine;
          role = lines[1];
        } else if (lines.length > 1 && !lines[1].startsWith('-') && !lines[1].startsWith('•')) {
          employer = firstLine;
          role = lines[1];
        } else {
          employer = firstLine;
        }

        employer = employer.replace(durationPattern, '').trim();
        role = role.replace(durationPattern, '').trim();

        // If employer still looks like a role and role looks like a company, swap them
        if (ROLE_KEYWORDS.test(employer) && !ROLE_KEYWORDS.test(role) && role) {
          const temp = employer;
          employer = role;
          role = temp;
        }

        // Determine type
        let type = 'Full-Time';
        if (isInternship || /intern/i.test(role) || /intern/i.test(employer) || /intern(?:ship)?\b/i.test(entry.slice(0, 150))) {
          isInternship = true;
          type = 'Internship';
        } else if (/contract/i.test(role) || /contract/i.test(entry.slice(0, 150))) {
          type = 'Contract';
        } else if (/part[- ]time/i.test(role) || /part[- ]time/i.test(entry.slice(0, 150))) {
          type = 'Part-Time';
        }

        // Collect responsibilities
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line === role || line === employer || line === duration || dateMatch?.[0] === line) continue;
          if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
            responsibilities.push(line.replace(/^[-•*]\s*/, '').trim());
          } else if (/^\d+[.)]\s+/.test(line)) {
            responsibilities.push(line.replace(/^\d+[.)]\s+/, '').trim());
          } else if (line.length > 25 && !ROLE_KEYWORDS.test(line) && !COMPANY_KEYWORDS.test(line)) {
            responsibilities.push(line);
          }
        }

        // Extract technologies used in this entry
        const techUsed = [];
        for (const skill of this.skillTaxonomy) {
          for (const alias of skill.aliases) {
            const reg = new RegExp(`(?:^|[^a-zA-Z0-9_#+.-])${alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:$|[^a-zA-Z0-9_#+.-])`, 'i');
            if (reg.test(entry) && !techUsed.includes(skill.name)) {
              techUsed.push(skill.name);
              break;
            }
          }
        }

        experience.push({
          company: employer.replace(/[:|]/g, '').trim() || 'Organization',
          employer: employer.replace(/[:|]/g, '').trim() || 'Organization',
          role: role.replace(/[:|]/g, '').trim() || (isInternship ? 'Intern' : 'Professional'),
          type,
          duration,
          startDate: startDate || null,
          endDate: endDate || null,
          current: /present|current|now/i.test(endDate),
          isInternship,
          responsibilities,
          technologies: techUsed,
          description: responsibilities.join(' ').trim() || entry.slice(0, 300),
          confidence: 0.95
        });
      }
    };

    parseBlock(rawExp, false);
    parseBlock(rawIntern, true);

    // Fallback if neither section had entries
    if (experience.length === 0) {
      const fallbackPattern = /(?:^|\n)\s*(?:(?:professional|summer|industrial|vocational)?\s*internships?(?:\s+(?:experience|details|training|history|work))?|(?:professional|work|employment)\s+experience|experience)\s*:?\s*\n([\s\S]*?)(?=(?:\n\s*(?:projects?|academic\s+projects|education|skills|technical\s+skills|certifications?|achievements?)\b|$))/i;
      const match = text.match(fallbackPattern);
      if (match && match[1] && match[1].trim().length > 15) {
        const isInternHeading = /intern/i.test(match[0].slice(0, 60));
        parseBlock(match[1].trim(), isInternHeading);
      }
    }

    return experience.slice(0, 10);
  }

  /** Extract educational qualifications */
  static extractEducation(text, sections = {}) {
    const rawEdu = sections.education || text;
    const lines = rawEdu.split('\n').map(l => l.trim()).filter(Boolean);

    const degreePattern = /\b(b\.?tech|b\.?e\.?|b\.?sc|b\.?a|bba|bca|m\.?tech|m\.?e\.?|m\.?sc|mca|mba|ph\.?d|bachelor|master|diploma|hsc|sslc|higher\s+secondary(?!\s+school))\b/i;
    const instPattern = /\b(institute|university|college|school|academy)\b/i;
    const datePattern = /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\d{4})\s*[-–to]+\s*(present|current|expected|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\d{4}(?:\s*\(expected\))?)\b/i;
    const citiesPattern = /\b(Coimbatore|Theni|Namakkal|Chennai|Bangalore|Bengaluru|Hyderabad|Pune|Mumbai|Delhi|Madurai|Salem|Tiruchirappalli|Tiruppur|Erode|Kolkata|Ahmedabad|Noida|Gurgaon|Gurugram)\b/i;

    const entries = [];
    const dates = [];
    const locations = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      const dm = line.match(datePattern);
      if (dm && line.length < 50 && !degreePattern.test(line)) {
        dates.push(line);
        continue;
      }

      if (/^[A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?$/.test(line) && !instPattern.test(line) && !degreePattern.test(line) && line.length < 30) {
        locations.push(line);
        continue;
      }

      if (degreePattern.test(line) && !instPattern.test(line)) {
        const degMatch = line.match(degreePattern);
        const rawDeg = degMatch ? degMatch[0] : 'Degree';
        let degree = rawDeg;
        if (/^b\.?tech/i.test(rawDeg)) degree = 'B.Tech';
        else if (/^b\.?e/i.test(rawDeg)) degree = 'B.E.';
        else if (/^(hsc|higher\s+secondary)/i.test(rawDeg)) degree = 'Higher Secondary Certificate (HSC)';
        else if (/^sslc/i.test(rawDeg)) degree = 'SSLC (Secondary School Leaving Certificate)';

        let field = '';
        if (/b\.?tech\s+(?:in\s+)?([A-Za-z\s&]+?)(?:\s*[-–|]|$)/i.test(line)) {
          field = line.match(/b\.?tech\s+(?:in\s+)?([A-Za-z\s&]+?)(?:\s*[-–|]|$)/i)[1].trim();
        } else if (/\bin\s+([A-Za-z\s&]+?)(?:,|$|\d)/i.test(line)) {
          field = line.match(/\bin\s+([A-Za-z\s&]+?)(?:,|$|\d)/i)[1].trim();
        }
        field = field.replace(/^in\s+/i, '').trim();

        let grade = '';
        const gm = line.match(/\b(?:grade|cgpa|gpa|percentage)\s*[-:=]?\s*(\d+\.?\d*(?:\s*%|\s*\/\s*10)?)\b|\b(\d+\.?\d*)\s*(?:cgpa|gpa|%)(?:\b|$)/i) ||
                   line.match(/\b(?:cgpa|gpa|percentage)?\s*[-:=]?\s*(\d+\.?\d*(?:\s*%|\s*\/\s*10))/i);
        if (gm) {
          grade = (gm[1] || gm[2] || gm[0]).trim();
        } else {
          for (let j = i + 1; j <= Math.min(lines.length - 1, i + 3); j++) {
            if (degreePattern.test(lines[j]) && !instPattern.test(lines[j])) break;
            const gm2 = lines[j].match(/\b(?:grade|cgpa|gpa|percentage)\s*[-:=]?\s*(\d+\.?\d*(?:\s*%|\s*\/\s*10)?)\b|\b(\d+\.?\d*)\s*(?:cgpa|gpa|%)(?:\b|$)/i) ||
                        lines[j].match(/\b(?:cgpa|gpa|percentage)?\s*[-:=]?\s*(\d+\.?\d*(?:\s*%|\s*\/\s*10))/i);
            if (gm2) {
              grade = (gm2[1] || gm2[2] || gm2[0]).trim();
              break;
            }
          }
        }

        let institution = '';
        for (let k = i - 1; k >= Math.max(0, i - 4); k--) {
          if (instPattern.test(lines[k])) {
            institution = lines[k];
            break;
          }
        }
        if (!institution && i + 1 < lines.length && instPattern.test(lines[i + 1])) {
          institution = lines[i + 1];
        } else if (!institution) {
          const parts = line.split(/[,\-–|]/).map(p => p.trim());
          const candidate = parts.find(p => instPattern.test(p));
          if (candidate) institution = candidate;
        }

        let location = '';
        const cityMatch = (institution + ' ' + line).match(citiesPattern);
        if (cityMatch) {
          location = cityMatch[0];
          institution = institution.replace(new RegExp('\\b(School|College|University|Technology|Institute|Academy)\\s*,?\\s*' + cityMatch[0] + '\\b.*$', 'i'), '$1').trim();
        }

        let duration = '';
        const dmLine = line.match(datePattern);
        if (dmLine) {
          duration = dmLine[0].trim();
        }

        entries.push({
          institution: (institution || 'Institution').trim(),
          degree,
          field: field ? field.replace(/\b[a-z]/g, c => c.toUpperCase()) : '',
          year: duration || '',
          duration: duration || '',
          location: location || '',
          grade: grade.replace(/^[-–:]\s*/, '').trim(),
          confidence: 0.95
        });
      }
    }

    // Attach dates and locations in sequential order
    entries.forEach((entry, idx) => {
      if (!entry.duration && dates[idx]) {
        entry.duration = dates[idx];
        entry.year = dates[idx];
        entry.endDate = dates[idx];
      }
      if (!entry.location && locations[idx]) {
        entry.location = locations[idx];
      }
    });

    // Fallback: If no entries matched degreePattern, fall back to basic line check
    if (!entries.length) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/\b(b\.?tech|b\.?e\.?|b\.?sc|b\.?a|bba|bca|m\.?tech|m\.?e\.?|m\.?sc|mca|mba|ph\.?d|bachelor|master|diploma|sslc|hsc)\b/i);
        if (match) {
          entries.push({
            institution: (lines[i - 1] || 'Institution').trim(),
            degree: match[0],
            field: '',
            year: '',
            duration: '',
            grade: '',
            confidence: 0.85
          });
        }
      }
    }

    return entries.slice(0, 4);
  }

  /** Extract certifications */
  static extractCertifications(text, sections = {}) {
    const rawCert = sections.certifications || '';
    if (!rawCert) return [];

    const certifications = [];
    const lines = rawCert.split('\n').map(l => l.trim()).filter(l => l.length > 4);

    for (const line of lines) {
      let clean = line.replace(/^[-•*]\s*/, '').trim();

      // Skip lines that are purely dates
      if (/^(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}$/i.test(clean)) {
        continue;
      }

      let date = '';
      const dateMatch = clean.match(/\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\b20\d{2}\b/i);
      if (dateMatch) {
        date = dateMatch[0];
        clean = clean.replace(dateMatch[0], '').trim();
      }

      let name = clean;
      let issuer = '';

      const parenMatch = clean.match(/\(([^)]+)\)/);
      if (parenMatch) {
        issuer = parenMatch[1].trim();
        name = clean.replace(/\(([^)]+)\)/, '').trim();
      } else if (clean.includes('—') || clean.includes('–') || clean.includes('|') || clean.includes(' - ')) {
        const parts = clean.split(/\s+[—–]\s+|\s*\|\s*|\s+[-]\s+/).map(p => p.trim());
        name = parts[0];
        issuer = parts[1] || '';
        if (parts[2] && !date) date = parts[2];
      } else {
        issuer = this.extractIssuer(clean);
      }

      name = name.replace(/\s*\|\s*$/, '').trim();

      if (name && name.length >= 3) {
        certifications.push({
          name,
          issuer: issuer || 'Issuing Organization',
          date: date || '',
          confidence: 0.95
        });
      }
    }

    return certifications.slice(0, 10);
  }

  /** Extract achievements */
  static extractAchievements(text, sections = {}) {
    const rawAch = sections.achievements || '';
    if (!rawAch) return [];

    const lines = rawAch.split('\n')
      .map(l => l.replace(/^[-•*]\s*/, '').trim())
      .filter(l => l.length > 15);

    const isRealAchievement = (l) => {
      if (!l || l.length < 15) return false;
      if (/^(retain|verify|ensure|note|instruction|please|and|with|for|in|to|by)\b/i.test(l)) return false;
      if (/^(mern stack developer|full stack developer|software engineer|developer with)\b/i.test(l)) return false;
      if (!/^[A-Z]/.test(l)) return false;
      return /\b(hackathon|finalist|winner|award|leetcode|problems|badges?|rank|competition|olympiad|scholarship|recognized|solved|honors?)\b/i.test(l) || /^[A-Z][a-zA-Z\s0-9]+:/.test(l);
    };

    return lines
      .filter(isRealAchievement)
      .slice(0, 6)
      .map(title => ({ title, confidence: 0.95 }));
  }

  /** Job-specific skill and keyword analysis */
  static analyzeJobMatch(parsedSkills, resumeText, jobDescription) {
    if (!jobDescription || !jobDescription.trim()) {
      return {
        matchedSkills: [],
        missingSkills: [],
        partialSkills: [],
        matchPercentage: 0,
        matchedKeywords: [],
        missingKeywords: [],
        partialKeywords: [],
        targetRole: null
      };
    }

    const jdText = jobDescription.toLowerCase();
    const resumeLower = resumeText.toLowerCase();

    // Extract target role from first line of job description if short
    const firstLine = jobDescription.split('\n')[0].trim();
    const targetRole = firstLine.length < 60 && !firstLine.includes('.') ? firstLine : 'Target Position';

    // Identify required skills mentioned in JD
    const jdSkills = [];
    for (const skill of this.skillTaxonomy) {
      if (skill.aliases.some(a => new RegExp(`\\b${a.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(jdText))) {
        jdSkills.push(skill.name);
      }
    }

    const candidateSkillNames = new Set(parsedSkills.map(s => s.toLowerCase()));
    const matchedSkills = [];
    const missingSkills = [];

    jdSkills.forEach(skillName => {
      if (candidateSkillNames.has(skillName.toLowerCase()) || resumeLower.includes(skillName.toLowerCase())) {
        matchedSkills.push(skillName);
      } else {
        missingSkills.push(skillName);
      }
    });

    const matchPercentage = jdSkills.length > 0
      ? Math.round((matchedSkills.length / jdSkills.length) * 100)
      : Math.min(100, Math.round((parsedSkills.length / 10) * 100));

    // Keyword tokens
    const tokenizer = new natural.WordTokenizer();
    const jdTokens = [...new Set(tokenizer.tokenize(jdText).filter(t => t.length > 3 && !natural.stopwords.includes(t)))];
    const resumeTokens = new Set(tokenizer.tokenize(resumeLower));

    const matchedKeywords = jdTokens.filter(t => resumeTokens.has(t)).slice(0, 20);
    const missingKeywords = jdTokens.filter(t => !resumeTokens.has(t)).slice(0, 15);

    return {
      matchedSkills,
      missingSkills,
      partialSkills: [],
      matchPercentage,
      matchedKeywords,
      missingKeywords,
      partialKeywords: [],
      targetRole
    };
  }

  /**
   * Deterministic ATS Compatibility Score Calculation
   * A: Job Match / Relevance: 35 points
   * B: Skills Match: 25 points
   * C: Experience & Projects: 15 points
   * D: Structure & Readability: 15 points
   * E: Completeness & Contact: 10 points
   * Total: 100 points
   */
  static calculateATSScore(text, parsedData, jobDescription = '') {
    const isJobSpecific = Boolean(jobDescription && jobDescription.trim());
    const normalizedText = text.toLowerCase();

    // A. Job Match / Technical Relevance (35 pts)
    let scoreA = 0;
    if (isJobSpecific && parsedData.jobMatch) {
      const matchPct = parsedData.jobMatch.matchPercentage || 0;
      scoreA = Math.round((matchPct / 100) * 35);
    } else {
      // General Quality Assessment baseline
      let actionCount = 0;
      this.atsKeywords.forEach(verb => { if (normalizedText.includes(verb)) actionCount++; });
      const actionScore = Math.min(15, actionCount * 2);

      const metricsCount = (text.match(/\b\d+%|\$\d+|\d+\s*(?:users|customers|projects|members|clients)/gi) || []).length;
      const metricsScore = Math.min(10, metricsCount * 3);

      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const lengthScore = (wordCount >= 350 && wordCount <= 900) ? 10 : 5;

      scoreA = Math.min(35, actionScore + metricsScore + lengthScore);
    }

    // B. Skills Match (25 pts)
    const techCount = parsedData.parsedSkills?.length || 0;
    const scoreB = Math.min(25, Math.round((techCount / 10) * 25));

    // C. Experience & Projects (15 pts)
    const projCount = parsedData.parsedProjects?.length || 0;
    const expCount = parsedData.parsedExperience?.length || 0;
    const projPoints = Math.min(8, projCount * 4);
    const expPoints = Math.min(7, expCount * 4);
    // Student resumes with many projects can balance out missing experience
    const scoreC = Math.min(15, projCount >= 3 && expCount === 0 ? 15 : projPoints + expPoints);

    // D. Structure & Readability (15 pts)
    const recognizedSections = ['education', 'experience', 'skills', 'projects', 'summary']
      .filter(s => normalizedText.includes(s)).length;
    const sectionScore = Math.min(7, recognizedSections * 1.5);
    const bulletsCount = (text.match(/^[-•*]\s+/gm) || []).length;
    const bulletScore = bulletsCount >= 4 ? 4 : 2;
    const artifactScore = text.includes('<<') || text.includes('/Font') ? 0 : 4;
    const scoreD = Math.min(15, Math.round(sectionScore + bulletScore + artifactScore));

    // E. Completeness & Contact (10 pts)
    let scoreE = 0;
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) scoreE += 2.5;
    if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(text)) scoreE += 2.5;
    if (normalizedText.includes('linkedin') || normalizedText.includes('github')) scoreE += 2.5;
    if (parsedData.parsedEducation?.length > 0) scoreE += 2.5;

    const total = Math.min(100, Math.round(scoreA + scoreB + scoreC + scoreD + scoreE));

    return {
      total,
      breakdown: {
        jobDescriptionMatch: scoreA,
        skillsMatch: scoreB,
        experienceAndProjects: scoreC,
        structureAndReadability: scoreD,
        completeness: Math.round(scoreE)
      },
      criteria: [
        {
          label: isJobSpecific ? 'Job Description Match' : 'Relevance & Action Impact',
          score: scoreA,
          max: 35,
          explanation: isJobSpecific
            ? `Calculated based on matched required skills and keywords (${parsedData.jobMatch.matchPercentage}% match).`
            : 'General quality metric evaluated from action verbs, quantifiable achievements, and document length.'
        },
        {
          label: 'Technical Skills Depth',
          score: scoreB,
          max: 25,
          explanation: `${techCount} distinct technical skills detected across categories.`
        },
        {
          label: 'Experience & Projects',
          score: scoreC,
          max: 15,
          explanation: `${projCount} project(s) and ${expCount} experience/internship record(s) verified.`
        },
        {
          label: 'Structure & ATS Readability',
          score: scoreD,
          max: 15,
          explanation: 'Standard section headings, consistent list formatting, and clean text layout.'
        },
        {
          label: 'Contact & Completeness',
          score: Math.round(scoreE),
          max: 10,
          explanation: 'Verified contact points (email, phone, LinkedIn/GitHub) and education credentials.'
        }
      ]
    };
  }

  /** Calculate formatting score (0-100) */
  static calculateFormattingScore(text) {
    let score = 0;
    const lower = text.toLowerCase();

    // Section headers
    const sections = ['education', 'experience', 'skills', 'projects', 'summary', 'certifications'];
    const found = sections.filter(s => lower.includes(s)).length;
    score += Math.min(30, found * 6);

    // Bullet points
    const bullets = (text.match(/^[-•*]\s+/gm) || []).length;
    score += Math.min(25, bullets * 3);

    // Word count in ideal range (350-900)
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words >= 350 && words <= 850) score += 20;
    else if (words >= 200 && words <= 1200) score += 12;

    // Contact info
    if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)) score += 10;
    if (/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b/.test(text)) score += 5;
    if (lower.includes('linkedin') || lower.includes('github')) score += 10;

    return Math.min(100, Math.round(score));
  }

  /** Calculate keyword score (0-100) */
  static calculateKeywordScore(text, jobDescription = '') {
    if (jobDescription && jobDescription.trim()) {
      const tokenizer = new natural.WordTokenizer();
      const jdTokens = [...new Set(tokenizer.tokenize(jobDescription.toLowerCase()).filter(t => t.length > 3 && !natural.stopwords.includes(t)))];
      if (jdTokens.length) {
        const resumeLower = text.toLowerCase();
        const matched = jdTokens.filter(t => resumeLower.includes(t));
        return Math.min(100, Math.round((matched.length / jdTokens.length) * 100));
      }
    }

    // Default action verbs + tech keywords density
    let count = 0;
    const lower = text.toLowerCase();
    this.atsKeywords.forEach(verb => { if (lower.includes(verb)) count += 3; });
    return Math.min(100, Math.max(45, count + 30));
  }

  /** Generate prioritized actionable improvement suggestions */
  static generateSuggestions(text, parsedData, isJobSpecific = false) {
    const suggestions = [];
    const normalizedText = text.toLowerCase();

    // Check contact information
    if (!normalizedText.includes('linkedin')) {
      suggestions.push({
        type: 'contact',
        priority: 'medium',
        message: 'Add a clickable LinkedIn profile link in your header for recruiters to verify your background.'
      });
    }
    if (!normalizedText.includes('github')) {
      suggestions.push({
        type: 'contact',
        priority: 'medium',
        message: 'Include your GitHub profile link to provide visible proof of your code quality.'
      });
    }

    // Check skills
    if ((parsedData.parsedSkills?.length || 0) < 8) {
      suggestions.push({
        type: 'skills',
        priority: 'high',
        message: 'Your resume lists fewer than 8 technical skills. Include key frameworks, databases, and tools you have worked with.'
      });
    }

    // Check job-specific missing skills
    if (isJobSpecific && parsedData.jobMatch?.missingSkills?.length) {
      const missingList = parsedData.jobMatch.missingSkills.slice(0, 4).join(', ');
      suggestions.push({
        type: 'job-targeting',
        priority: 'high',
        message: `The target job description emphasizes: ${missingList}. If you have hands-on experience with these, incorporate them into your project descriptions.`
      });
    }

    // Check projects
    if ((parsedData.parsedProjects?.length || 0) < 2) {
      suggestions.push({
        type: 'projects',
        priority: 'high',
        message: 'Add at least 2 technical projects featuring modern tech stacks, architectural decisions, and links to source code.'
      });
    }

    // Check quantifiable achievements
    const numberPattern = /\b\d+%|\$\d+|\d+\s*(?:users|customers|projects|latency|reduction)/gi;
    if (!(text.match(numberPattern) || []).length) {
      suggestions.push({
        type: 'quantify',
        priority: 'high',
        message: 'Quantify your accomplishments with measurable numbers (e.g., "Reduced response latency by 25%", "Supported 1,000+ daily active users").'
      });
    }

    // Check action verbs
    const usedVerbs = this.atsKeywords.filter(v => normalizedText.includes(v));
    if (usedVerbs.length < 5) {
      suggestions.push({
        type: 'action-verbs',
        priority: 'medium',
        message: 'Start bullet points with strong action verbs like "Architected", "Engineered", "Optimized", and "Spearheaded".'
      });
    }

    // Check word count
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) {
      suggestions.push({
        type: 'length',
        priority: 'high',
        message: 'Your resume is under 300 words. Expand on your project features, responsibilities, and technical contributions.'
      });
    } else if (wordCount > 1000) {
      suggestions.push({
        type: 'length',
        priority: 'medium',
        message: 'Your resume exceeds 1,000 words. Consider condensing to 1-2 pages for improved ATS readability.'
      });
    }

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
  }

  /** Complete end-to-end analysis of resume text */
  static async analyzeResumeText(text, jobDescription = '') {
    const normalizedText = this.normalizeResumeText(text);
    const sections = this.partitionSections(normalizedText);

    // Extraction pipeline
    const contact = this.extractContact(normalizedText, sections.header);
    const skillsData = this.extractSkills(normalizedText, sections);
    const parsedProjects = this.extractProjects(normalizedText, sections);
    const parsedExperience = this.extractExperience(normalizedText, sections);
    const parsedEducation = this.extractEducation(normalizedText, sections);
    const parsedCertifications = this.extractCertifications(normalizedText, sections);
    const achievements = this.extractAchievements(normalizedText, sections);

    // Job matching
    const jobMatch = this.analyzeJobMatch(skillsData.parsedSkills, normalizedText, jobDescription);

    const tempResult = {
      parsedSkills: skillsData.parsedSkills,
      parsedProjects,
      parsedExperience,
      parsedEducation,
      parsedCertifications,
      jobMatch
    };

    // Calculate scores
    const atsScoreResult = this.calculateATSScore(normalizedText, tempResult, jobDescription);
    const formattingScore = this.calculateFormattingScore(normalizedText);
    const keywordScore = this.calculateKeywordScore(normalizedText, jobDescription);
    const skillMatchScore = jobMatch.targetRole && jobMatch.matchPercentage > 0
      ? jobMatch.matchPercentage
      : Math.min(100, Math.round((skillsData.parsedSkills.length / 12) * 100));

    // Diagnostics
    const sectionsDetected = Object.keys(sections).filter(k => sections[k] && sections[k].length > 0 && k !== 'header');
    const allSections = ['summary', 'education', 'skills', 'experience', 'projects', 'certifications', 'achievements'];
    const sectionsMissing = allSections.filter(s => !sectionsDetected.includes(s));

    // Suggestions
    const suggestions = this.generateSuggestions(normalizedText, tempResult, Boolean(jobDescription));

    const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;

    return {
      // Legacy backward compatible fields
      parsedSkills: skillsData.parsedSkills,
      parsedProjects,
      parsedExperience,
      parsedEducation,
      parsedCertifications,
      atsScore: atsScoreResult.total,
      skillMatchScore,
      formattingScore,
      keywordScore,
      scoreDetails: atsScoreResult.criteria,
      scoreBreakdown: atsScoreResult.breakdown,
      improvementSuggestions: suggestions,
      wordCount,

      // New schema fields
      scores: {
        ats: atsScoreResult.total,
        skillMatch: skillMatchScore,
        formatting: formattingScore,
        keywordMatch: keywordScore
      },
      scoreMode: jobDescription ? 'job-specific' : 'general',
      targetRole: jobMatch.targetRole,
      skills: {
        technical: skillsData.technical,
        categorized: skillsData.categorized,
        soft: skillsData.soft,
        matched: jobMatch.matchedSkills,
        missing: jobMatch.missingSkills,
        inferred: skillsData.inferred,
        counts: skillsData.counts
      },
      education: parsedEducation,
      experience: parsedExperience,
      projects: parsedProjects,
      certifications: parsedCertifications,
      achievements,
      keywords: {
        matched: jobMatch.matchedKeywords,
        missing: jobMatch.missingKeywords,
        partial: jobMatch.partialKeywords
      },
      recommendations: suggestions,
      diagnostics: {
        sectionsDetected,
        sectionsMissing,
        warnings: sectionsMissing.length > 2 ? [`Sections not detected: ${sectionsMissing.join(', ')}`] : [],
        confidence: {
          textExtraction: 0.98,
          sectionDetection: sectionsDetected.length >= 4 ? 0.95 : 0.82
        }
      },
      contact
    };
  }

  static extractIssuer(text) {
    const issuers = ['aws', 'google', 'microsoft', 'oracle', 'cisco', 'coursera', 'udemy', 'meta', 'ibm'];
    for (const issuer of issuers) {
      if (text.toLowerCase().includes(issuer)) {
        return issuer.toUpperCase();
      }
    }
    return '';
  }

  static extractDate(text) {
    const datePattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\b20\d{2}\b/i;
    const match = text.match(datePattern);
    return match ? match[0] : '';
  }

  static extractYear(text) {
    const yearPattern = /\b(19|20)\d{2}\b/;
    const match = text.match(yearPattern);
    return match ? match[0] : '';
  }

  static extractGrade(text) {
    const gradePattern = /\b\d+\.?\d*\s*(?:cgpa|gpa|%|percentage)/i;
    const match = text.match(gradePattern);
    return match ? match[0] : '';
  }

  static extractDuration(text) {
    const durationPattern = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\s*[-–to]+\s*(?:present|\w+\s*\d{4})/i;
    const match = text.match(durationPattern);
    return match ? match[0] : '';
  }
}

module.exports = ResumeParserService;
