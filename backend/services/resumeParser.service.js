

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');
const Skill = require('../models/Skill');

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
 
  static skillKeywords = {
    'programming-language': [
      'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'golang', 'rust',
      'typescript', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl'
    ],
    'framework': [
      'react', 'reactjs', 'angular', 'vue', 'vuejs', 'node', 'nodejs', 'express',
      'django', 'flask', 'spring', 'springboot', '.net', 'laravel', 'rails',
      'next.js', 'nextjs', 'nuxt', 'fastapi', 'nest', 'nestjs'
    ],
    'database': [
      'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sql server',
      'sqlite', 'cassandra', 'dynamodb', 'firebase', 'supabase', 'neo4j'
    ],
    'cloud': [
      'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digitalocean',
      'cloudflare', 'vercel', 'netlify', 'ec2', 's3', 'lambda'
    ],
    'devops': [
      'docker', 'kubernetes', 'k8s', 'jenkins', 'gitlab ci', 'github actions',
      'terraform', 'ansible', 'nginx', 'apache', 'linux', 'ci/cd'
    ],
    'data-science': [
      'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
      'pandas', 'numpy', 'scikit-learn', 'nlp', 'computer vision', 'opencv'
    ],
    'tools': [
      'git', 'github', 'gitlab', 'jira', 'confluence', 'slack', 'postman',
      'figma', 'adobe', 'vs code', 'intellij', 'eclipse'
    ],
    'soft-skills': [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'critical thinking', 'time management', 'presentation', 'agile', 'scrum'
    ]
  };


  static atsKeywords = [
    'achieved', 'improved', 'developed', 'managed', 'created', 'designed',
    'implemented', 'increased', 'decreased', 'reduced', 'led', 'coordinated',
    'launched', 'built', 'delivered', 'optimized', 'streamlined'
  ];

 
  static normalizeResumeText(value) {
    return String(value || '')
      .replace(/\r\n?/g, '\n')
      .replace(/[\u00ad\u200b\ufeff]/g, '')
      .replace(/([A-Za-z])-[ \t]*\n[ \t]*([a-z])/g, '$1$2')
      .replace(/^[ \t]*(?:page\s+)?\d+(?:\s+of\s+\d+)?[ \t]*$/gim, '')
      .split('\n')
      .map(line => line.replace(/[ \t]+$/g, '').trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

 
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
      let pdfData;
      try {
        pdfData = await pdfParse(pdfBuffer);
      } catch (error) {
        const appearsImageOnly = /\/Subtype\s*\/Image\b/i.test(pdfBuffer.toString('latin1'));
        if (!appearsImageOnly) {
          throw parserError('The PDF could not be parsed. Please upload a valid PDF.', 'PDF_PARSE_FAILED', 422);
        }
        extractedText = await extractScannedPdfText(filePath);
        extractionSource = 'ocr';
        confidence = 0.65;
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

  
  static async parseResume(filePath) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text;

      return await this.analyzeResumeText(text);
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw new Error('Failed to parse resume: ' + error.message);
    }
  }

  
  static async analyzeResumeText(text) {
    const normalizedText = text.toLowerCase();
    
    const result = {
      parsedSkills: this.extractSkills(normalizedText),
      parsedProjects: this.extractProjects(text),
      parsedCertifications: this.extractCertifications(text),
      parsedEducation: this.extractEducation(text),
      parsedExperience: this.extractExperience(text),
      atsScore: 0,
      improvementSuggestions: []
    };

  
    result.atsScore = this.calculateATSScore(text, result);
    
   
    result.improvementSuggestions = this.generateSuggestions(text, result);

    return result;
  }

  
  static extractSkills(text) {
    const foundSkills = new Set();
    
    
    for (const [category, skills] of Object.entries(this.skillKeywords)) {
      for (const skill of skills) {
        if (text.includes(skill.toLowerCase())) {
          foundSkills.add(skill);
        }
      }
    }


    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    
   
    const techPattern = /\b[A-Z][a-zA-Z]*(?:\.[jJ][sS]|JS|DB)?\b/g;
    const matches = text.match(techPattern) || [];
    matches.forEach(match => {
      if (match.length > 2) {
        foundSkills.add(match);
      }
    });

    return Array.from(foundSkills).slice(0, 30);  
  }

  /**
   * Extract projects from resume
   */
  static extractProjects(text) {
    const projects = [];
    
    
    const projectPatterns = [
      /projects?\s*:?\s*([\s\S]*?)(?=education|experience|skills|certifications|$)/i,
      /personal\s+projects?\s*:?\s*([\s\S]*?)(?=education|experience|skills|$)/i
    ];

    for (const pattern of projectPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const projectText = match[1];
        
        
        const projectItems = projectText.split(/[ΓÇó\-\n]/).filter(p => p.trim().length > 20);
        
        for (let i = 0; i < Math.min(projectItems.length, 5); i++) {
          const item = projectItems[i].trim();
          if (item) {
            const technologies = this.extractSkills(item.toLowerCase());
            projects.push({
              name: item.split(/[:\-ΓÇô]/)[0]?.trim().substring(0, 100) || `Project ${i + 1}`,
              description: item.substring(0, 300),
              technologies: technologies.slice(0, 10),
              duration: ''
            });
          }
        }
        break;
      }
    }

    return projects;
  }

  
  static extractCertifications(text) {
    const certifications = [];
    
    const certPatterns = [
      /certifications?\s*:?\s*([\s\S]*?)(?=projects?|education|experience|skills|$)/i,
      /certificates?\s*:?\s*([\s\S]*?)(?=projects?|education|experience|skills|$)/i
    ];

    const certKeywords = [
      'certified', 'certification', 'certificate', 'aws', 'azure', 'google',
      'comptia', 'cisco', 'oracle', 'microsoft', 'coursera', 'udemy', 'udacity'
    ];

    for (const pattern of certPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const certText = match[1];
        const certItems = certText.split(/[ΓÇó\-\n]/).filter(c => c.trim().length > 5);
        
        for (let i = 0; i < Math.min(certItems.length, 10); i++) {
          const item = certItems[i].trim();
          if (item && certKeywords.some(k => item.toLowerCase().includes(k))) {
            certifications.push({
              name: item.substring(0, 100),
              issuer: this.extractIssuer(item),
              date: this.extractDate(item)
            });
          }
        }
        break;
      }
    }

    return certifications;
  }

 
  static extractEducation(text) {
    const education = [];
    
    const eduPattern = /education\s*:?\s*([\s\S]*?)(?=experience|projects?|skills|certifications?|$)/i;
    const match = text.match(eduPattern);
    
    if (match && match[1]) {
      const eduText = match[1];
      
     
      const degreePatterns = [
        /\b(B\.?Tech|B\.?E\.?|B\.?Sc|M\.?Tech|M\.?E\.?|M\.?Sc|MBA|PhD|Bachelor|Master|Diploma)\b/gi
      ];

      const eduItems = eduText.split(/\n/).filter(e => e.trim().length > 10);
      
      for (const item of eduItems.slice(0, 3)) {
        for (const pattern of degreePatterns) {
          if (pattern.test(item)) {
            education.push({
              institution: item.split(/[,\-ΓÇô]/)[0]?.trim() || '',
              degree: (item.match(pattern) || [''])[0],
              field: '',
              year: this.extractYear(item),
              grade: this.extractGrade(item)
            });
            break;
          }
        }
      }
    }

    return education;
  }

 
  static extractExperience(text) {
    const experience = [];
    
    const expPattern = /experience\s*:?\s*([\s\S]*?)(?=education|projects?|skills|certifications?|$)/i;
    const match = text.match(expPattern);
    
    if (match && match[1]) {
      const expText = match[1];
      const expItems = expText.split(/\n\n/).filter(e => e.trim().length > 20);
      
      for (const item of expItems.slice(0, 5)) {
        experience.push({
          company: item.split(/[,\-ΓÇô\n]/)[0]?.trim().substring(0, 100) || '',
          role: item.split(/[,\-ΓÇô\n]/)[1]?.trim().substring(0, 100) || '',
          duration: this.extractDuration(item),
          description: item.substring(0, 500)
        });
      }
    }

    return experience;
  }

  
  static calculateATSScore(text, parsedData) {
    let score = 0;
    const normalizedText = text.toLowerCase();

    const skillCount = parsedData.parsedSkills.length;
    score += Math.min(30, skillCount * 3);

    let actionVerbCount = 0;
    this.atsKeywords.forEach(verb => {
      if (normalizedText.includes(verb)) actionVerbCount++;
    });
    score += Math.min(20, actionVerbCount * 2);

   
    const numberPattern = /\b\d+%|\$\d+|\d+\s*(users|customers|projects|team|members)/gi;
    const quantifiedAchievements = (text.match(numberPattern) || []).length;
    score += Math.min(15, quantifiedAchievements * 3);

   
    const sections = ['education', 'experience', 'skills', 'projects'];
    sections.forEach(section => {
      if (normalizedText.includes(section)) score += 3.75;
    });

    
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 400 && wordCount <= 800) {
      score += 10;
    } else if (wordCount >= 200 && wordCount < 400) {
      score += 5;
    } else if (wordCount > 800 && wordCount <= 1200) {
      score += 7;
    }

   
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/;
    if (emailPattern.test(text)) score += 2.5;
    if (phonePattern.test(text)) score += 2.5;

   
    if (normalizedText.includes('linkedin')) score += 2.5;
    if (normalizedText.includes('github')) score += 2.5;

    return Math.round(Math.min(100, score));
  }

 
  static generateSuggestions(text, parsedData) {
    const suggestions = [];
    const normalizedText = text.toLowerCase();

   
    const usedActionVerbs = this.atsKeywords.filter(v => normalizedText.includes(v));
    if (usedActionVerbs.length < 5) {
      suggestions.push({
        type: 'action-verbs',
        priority: 'high',
        message: 'Add more action verbs like "achieved", "developed", "implemented" to describe your accomplishments'
      });
    }

   
    const numberPattern = /\b\d+%|\$\d+|\d+\s*(users|customers|projects)/gi;
    if (!(text.match(numberPattern) || []).length) {
      suggestions.push({
        type: 'quantify',
        priority: 'high',
        message: 'Add quantified achievements (e.g., "Increased performance by 40%", "Led a team of 5")'
      });
    }

    if (parsedData.parsedSkills.length < 8) {
      suggestions.push({
        type: 'skills',
        priority: 'medium',
        message: 'Add more relevant technical skills to your resume (aim for 10-15 key skills)'
      });
    }

   
    if (parsedData.parsedProjects.length < 2) {
      suggestions.push({
        type: 'projects',
        priority: 'medium',
        message: 'Include at least 2-3 projects with technologies used and outcomes achieved'
      });
    }

    if (parsedData.parsedCertifications.length === 0) {
      suggestions.push({
        type: 'certifications',
        priority: 'low',
        message: 'Consider adding relevant certifications to stand out'
      });
    }

    if (!normalizedText.includes('linkedin')) {
      suggestions.push({
        type: 'linkedin',
        priority: 'medium',
        message: 'Add your LinkedIn profile URL'
      });
    }
    if (!normalizedText.includes('github')) {
      suggestions.push({
        type: 'github',
        priority: 'medium',
        message: 'Add your GitHub profile to showcase your code'
      });
    }


    const wordCount = text.split(/\s+/).length;
    if (wordCount < 300) {
      suggestions.push({
        type: 'length',
        priority: 'high',
        message: 'Your resume seems too short. Add more details about your experience and projects'
      });
    } else if (wordCount > 1000) {
      suggestions.push({
        type: 'length',
        priority: 'medium',
        message: 'Consider condensing your resume to 1-2 pages for better readability'
      });
    }

    return suggestions.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });
  }

 
  static extractIssuer(text) {
    const issuers = ['aws', 'google', 'microsoft', 'oracle', 'cisco', 'coursera', 'udemy'];
    for (const issuer of issuers) {
      if (text.toLowerCase().includes(issuer)) {
        return issuer.charAt(0).toUpperCase() + issuer.slice(1);
      }
    }
    return '';
  }

  static extractDate(text) {
    const datePattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\d{4}\b/i;
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
    const durationPattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\s*[-ΓÇôto]+\s*(present|\w+\s*\d{4})/i;
    const match = text.match(durationPattern);
    return match ? match[0] : '';
  }

  
  static calculateFormattingScore(text) {
    let score = 0;

   
    const sections = ['education', 'experience', 'skills', 'projects', 'certifications', 'summary', 'objective'];
    let sectionsFound = 0;
    sections.forEach(s => { if (text.toLowerCase().includes(s)) sectionsFound++; });
    score += Math.min(30, sectionsFound * 6);

   
    const bullets = (text.match(/[ΓÇó\-\*]/g) || []).length;
    score += Math.min(20, bullets * 2);

  
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 800) score += 20;
    else if (wordCount >= 200 && wordCount <= 1200) score += 10;

    
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(text);
    if (hasEmail) score += 10;
    if (hasPhone) score += 10;

  
    if (text.toLowerCase().includes('linkedin')) score += 5;
    if (text.toLowerCase().includes('github')) score += 5;

    return Math.round(Math.min(100, score));
  }

 
  static calculateKeywordScore(text) {
    let score = 0;
    const lower = text.toLowerCase();

  
    let actionCount = 0;
    this.atsKeywords.forEach(v => { if (lower.includes(v)) actionCount++; });
    score += Math.min(35, actionCount * 4);

    
    let techCount = 0;
    for (const skills of Object.values(this.skillKeywords)) {
      for (const skill of skills) {
        if (lower.includes(skill.toLowerCase())) techCount++;
      }
    }
    score += Math.min(40, techCount * 3);

  
    const quantified = (text.match(/\b\d+%|\$\d+|\d+\s*(users|customers|projects|team|members|clients)/gi) || []).length;
    score += Math.min(25, quantified * 5);

    return Math.round(Math.min(100, score));
  }
}

module.exports = ResumeParserService;
