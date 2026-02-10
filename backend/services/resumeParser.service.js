/**
 * ⭐ UNIQUE FEATURE 4: AI-Powered Resume Parsing & Optimization
 * Extracts skills, projects, certifications from resume
 * Provides ATS score and improvement suggestions
 */

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const Skill = require('../models/Skill');

class ResumeParserService {
  // Common skill keywords database
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

  // ATS keywords that improve score
  static atsKeywords = [
    'achieved', 'improved', 'developed', 'managed', 'created', 'designed',
    'implemented', 'increased', 'decreased', 'reduced', 'led', 'coordinated',
    'launched', 'built', 'delivered', 'optimized', 'streamlined'
  ];

  /**
   * Parse resume from PDF file
   */
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

  /**
   * Analyze resume text and extract information
   */
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

    // Calculate ATS score
    result.atsScore = this.calculateATSScore(text, result);
    
    // Generate improvement suggestions
    result.improvementSuggestions = this.generateSuggestions(text, result);

    return result;
  }

  /**
   * Extract skills from resume text
   */
  static extractSkills(text) {
    const foundSkills = new Set();
    
    // Check each skill category
    for (const [category, skills] of Object.entries(this.skillKeywords)) {
      for (const skill of skills) {
        if (text.includes(skill.toLowerCase())) {
          foundSkills.add(skill);
        }
      }
    }

    // Also use NLP tokenizer to find potential skills
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    
    // Look for capitalized technology names
    const techPattern = /\b[A-Z][a-zA-Z]*(?:\.[jJ][sS]|JS|DB)?\b/g;
    const matches = text.match(techPattern) || [];
    matches.forEach(match => {
      if (match.length > 2) {
        foundSkills.add(match);
      }
    });

    return Array.from(foundSkills).slice(0, 30); // Limit to 30 skills
  }

  /**
   * Extract projects from resume
   */
  static extractProjects(text) {
    const projects = [];
    
    // Look for project section
    const projectPatterns = [
      /projects?\s*:?\s*([\s\S]*?)(?=education|experience|skills|certifications|$)/i,
      /personal\s+projects?\s*:?\s*([\s\S]*?)(?=education|experience|skills|$)/i
    ];

    for (const pattern of projectPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const projectText = match[1];
        
        // Split by bullet points or newlines
        const projectItems = projectText.split(/[•\-\n]/).filter(p => p.trim().length > 20);
        
        for (let i = 0; i < Math.min(projectItems.length, 5); i++) {
          const item = projectItems[i].trim();
          if (item) {
            const technologies = this.extractSkills(item.toLowerCase());
            projects.push({
              name: item.split(/[:\-–]/)[0]?.trim().substring(0, 100) || `Project ${i + 1}`,
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

  /**
   * Extract certifications
   */
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
        const certItems = certText.split(/[•\-\n]/).filter(c => c.trim().length > 5);
        
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

  /**
   * Extract education details
   */
  static extractEducation(text) {
    const education = [];
    
    const eduPattern = /education\s*:?\s*([\s\S]*?)(?=experience|projects?|skills|certifications?|$)/i;
    const match = text.match(eduPattern);
    
    if (match && match[1]) {
      const eduText = match[1];
      
      // Look for degree patterns
      const degreePatterns = [
        /\b(B\.?Tech|B\.?E\.?|B\.?Sc|M\.?Tech|M\.?E\.?|M\.?Sc|MBA|PhD|Bachelor|Master|Diploma)\b/gi
      ];

      const eduItems = eduText.split(/\n/).filter(e => e.trim().length > 10);
      
      for (const item of eduItems.slice(0, 3)) {
        for (const pattern of degreePatterns) {
          if (pattern.test(item)) {
            education.push({
              institution: item.split(/[,\-–]/)[0]?.trim() || '',
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

  /**
   * Extract work experience
   */
  static extractExperience(text) {
    const experience = [];
    
    const expPattern = /experience\s*:?\s*([\s\S]*?)(?=education|projects?|skills|certifications?|$)/i;
    const match = text.match(expPattern);
    
    if (match && match[1]) {
      const expText = match[1];
      const expItems = expText.split(/\n\n/).filter(e => e.trim().length > 20);
      
      for (const item of expItems.slice(0, 5)) {
        experience.push({
          company: item.split(/[,\-–\n]/)[0]?.trim().substring(0, 100) || '',
          role: item.split(/[,\-–\n]/)[1]?.trim().substring(0, 100) || '',
          duration: this.extractDuration(item),
          description: item.substring(0, 500)
        });
      }
    }

    return experience;
  }

  /**
   * Calculate ATS (Applicant Tracking System) Score
   */
  static calculateATSScore(text, parsedData) {
    let score = 0;
    const normalizedText = text.toLowerCase();

    // Skills score (30 points)
    const skillCount = parsedData.parsedSkills.length;
    score += Math.min(30, skillCount * 3);

    // Action verbs score (20 points)
    let actionVerbCount = 0;
    this.atsKeywords.forEach(verb => {
      if (normalizedText.includes(verb)) actionVerbCount++;
    });
    score += Math.min(20, actionVerbCount * 2);

    // Quantified achievements (15 points)
    const numberPattern = /\b\d+%|\$\d+|\d+\s*(users|customers|projects|team|members)/gi;
    const quantifiedAchievements = (text.match(numberPattern) || []).length;
    score += Math.min(15, quantifiedAchievements * 3);

    // Sections present (15 points)
    const sections = ['education', 'experience', 'skills', 'projects'];
    sections.forEach(section => {
      if (normalizedText.includes(section)) score += 3.75;
    });

    // Length score (10 points) - ideal 400-800 words
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 400 && wordCount <= 800) {
      score += 10;
    } else if (wordCount >= 200 && wordCount < 400) {
      score += 5;
    } else if (wordCount > 800 && wordCount <= 1200) {
      score += 7;
    }

    // Contact info (5 points)
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/;
    if (emailPattern.test(text)) score += 2.5;
    if (phonePattern.test(text)) score += 2.5;

    // LinkedIn/GitHub (5 points)
    if (normalizedText.includes('linkedin')) score += 2.5;
    if (normalizedText.includes('github')) score += 2.5;

    return Math.round(Math.min(100, score));
  }

  /**
   * Generate improvement suggestions
   */
  static generateSuggestions(text, parsedData) {
    const suggestions = [];
    const normalizedText = text.toLowerCase();

    // Check for action verbs
    const usedActionVerbs = this.atsKeywords.filter(v => normalizedText.includes(v));
    if (usedActionVerbs.length < 5) {
      suggestions.push({
        type: 'action-verbs',
        priority: 'high',
        message: 'Add more action verbs like "achieved", "developed", "implemented" to describe your accomplishments'
      });
    }

    // Check for quantified achievements
    const numberPattern = /\b\d+%|\$\d+|\d+\s*(users|customers|projects)/gi;
    if (!(text.match(numberPattern) || []).length) {
      suggestions.push({
        type: 'quantify',
        priority: 'high',
        message: 'Add quantified achievements (e.g., "Increased performance by 40%", "Led a team of 5")'
      });
    }

    // Check for skills count
    if (parsedData.parsedSkills.length < 8) {
      suggestions.push({
        type: 'skills',
        priority: 'medium',
        message: 'Add more relevant technical skills to your resume (aim for 10-15 key skills)'
      });
    }

    // Check for projects
    if (parsedData.parsedProjects.length < 2) {
      suggestions.push({
        type: 'projects',
        priority: 'medium',
        message: 'Include at least 2-3 projects with technologies used and outcomes achieved'
      });
    }

    // Check for certifications
    if (parsedData.parsedCertifications.length === 0) {
      suggestions.push({
        type: 'certifications',
        priority: 'low',
        message: 'Consider adding relevant certifications to stand out'
      });
    }

    // Check for LinkedIn/GitHub
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

    // Length check
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

  // Helper functions
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
    const durationPattern = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\s*[-–to]+\s*(present|\w+\s*\d{4})/i;
    const match = text.match(durationPattern);
    return match ? match[0] : '';
  }

  /**
   * Calculate formatting score (0-100)
   */
  static calculateFormattingScore(text) {
    let score = 0;

    // Check for section headers
    const sections = ['education', 'experience', 'skills', 'projects', 'certifications', 'summary', 'objective'];
    let sectionsFound = 0;
    sections.forEach(s => { if (text.toLowerCase().includes(s)) sectionsFound++; });
    score += Math.min(30, sectionsFound * 6);

    // Check for consistent bullet points
    const bullets = (text.match(/[•\-\*]/g) || []).length;
    score += Math.min(20, bullets * 2);

    // Word count in ideal range (300-800)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 800) score += 20;
    else if (wordCount >= 200 && wordCount <= 1200) score += 10;

    // Contact info present
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/.test(text);
    if (hasEmail) score += 10;
    if (hasPhone) score += 10;

    // LinkedIn / GitHub
    if (text.toLowerCase().includes('linkedin')) score += 5;
    if (text.toLowerCase().includes('github')) score += 5;

    return Math.round(Math.min(100, score));
  }

  /**
   * Calculate keyword density score (0-100)
   */
  static calculateKeywordScore(text) {
    let score = 0;
    const lower = text.toLowerCase();

    // Action verbs
    let actionCount = 0;
    this.atsKeywords.forEach(v => { if (lower.includes(v)) actionCount++; });
    score += Math.min(35, actionCount * 4);

    // Technical keywords from all categories
    let techCount = 0;
    for (const skills of Object.values(this.skillKeywords)) {
      for (const skill of skills) {
        if (lower.includes(skill.toLowerCase())) techCount++;
      }
    }
    score += Math.min(40, techCount * 3);

    // Quantified results
    const quantified = (text.match(/\b\d+%|\$\d+|\d+\s*(users|customers|projects|team|members|clients)/gi) || []).length;
    score += Math.min(25, quantified * 5);

    return Math.round(Math.min(100, score));
  }
}

module.exports = ResumeParserService;
