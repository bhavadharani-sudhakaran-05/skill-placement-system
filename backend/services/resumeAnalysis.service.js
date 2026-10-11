const ResumeAiService = require('./resumeAi.service');

const arrayFields = ['education', 'experience', 'projects', 'skills', 'certifications', 'awards', 'achievements', 'publications', 'additionalSections', 'recommendations'];
const stopWords = new Set(['and', 'the', 'for', 'with', 'from', 'into', 'that', 'this', 'your', 'you', 'our', 'are', 'will', 'have', 'has', 'not', 'all', 'can', 'who', 'what', 'their', 'they', 'about', 'work', 'role', 'team', 'job', 'must', 'should', 'using', 'use', 'years', 'year', 'experience', 'ability', 'skills', 'skill', 'including', 'such', 'strong', 'good', 'also', 'within', 'across', 'required', 'preferred']);

function normalized(value) {
  return String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function supportedBySource(evidence, source) {
  const quote = normalized(evidence);
  const body = normalized(source);
  if (!quote) return false;
  if (body.includes(quote)) return true;
  if (quote.length < 4) return false;
  const tokens = [...new Set(quote.split(' ').filter(token => token.length > 2))];
  if (tokens.length < 3) return false;
  const matches = tokens.filter(token => body.includes(token)).length;
  return matches / tokens.length >= 0.8;
}

function supportedContent(value, source) {
  const quote = normalized(value);
  const body = normalized(source);
  if (!quote) return false;
  if (body.includes(quote)) return true;
  const tokens = [...new Set(quote.split(' ').filter(token => token.length > 2))];
  if (tokens.length < 3) return false;
  return tokens.filter(token => body.includes(token)).length / tokens.length >= 0.65;
}

function text(value, max = 1200) {
  return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max) : '';
}

function cleanArray(value, max = 80) {
  return Array.isArray(value) ? value.map(item => text(item, 500)).filter(Boolean).slice(0, max) : [];
}

function cleanRecord(record, source, fields) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const evidence = text(record.evidence, 600);
  if (!supportedBySource(evidence, source)) return null;
  const result = { evidence, confidence: Math.max(0, Math.min(1, Number(record.confidence) || 0)) };
  fields.forEach(field => {
    if (field.endsWith('[]')) {
      const key = field.slice(0, -2);
      result[key] = cleanArray(record[key]).filter(value => supportedContent(value, source));
    } else {
      const candidate = text(record[field], field === 'description' ? 3000 : 500);
      result[field] = ['category', 'source'].includes(field) || !candidate || supportedContent(candidate, source) ? candidate : '';
    }
  });
  if (result.description && !supportedContent(result.description, source)) {
    const phrases = result.description.split(/[.!?;\n]+/).map(phrase => text(phrase, 3000)).filter(Boolean);
    const grounded = phrases.filter(phrase => supportedContent(phrase, source));
    result.description = grounded.join('. ');
  }
  const hasSupportedValue = fields.some(field => {
    const value = result[field.endsWith('[]') ? field.slice(0, -2) : field];
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  if (!hasSupportedValue) return null;
  return result;
}

function records(raw, source, fields) {
  if (!Array.isArray(raw)) return [];
  return raw.map(record => cleanRecord(record, source, fields)).filter(Boolean);
}

function adaptRequestedSchema(raw) {
  const categories = raw.skills && !Array.isArray(raw.skills) && typeof raw.skills === 'object' ? raw.skills : null;
  if (!categories) return raw;

  const skillCategories = {
    languages: 'technical', frameworks: 'framework', databases: 'technical', tools: 'tools',
    core_subjects: 'domain', concepts: 'domain', soft_skills: 'soft'
  };
  const skills = Object.entries(skillCategories).flatMap(([key, category]) =>
    (Array.isArray(categories[key]) ? categories[key] : []).map(item => {
      const name = typeof item === 'string' ? item : text(item?.name, 100);
      return { name, category, source: 'explicit', evidence: typeof item === 'object' ? item.evidence : name, confidence: typeof item === 'object' ? item.confidence : 0.8 };
    })
  );

  const contact = raw.contact && typeof raw.contact === 'object' ? raw.contact : {};
  const links = Array.isArray(contact.links) ? contact.links.map(value => text(value, 300)).filter(Boolean) : [];
  const linkedin = links.find(link => /linkedin\\.com/i.test(link)) || '';
  const github = links.find(link => /github\\.com/i.test(link)) || '';
  const experience = Array.isArray(raw.experience) ? raw.experience.map(item => ({
    ...item,
    employer: item?.company || '',
    duration: item?.duration || '',
    description: Array.isArray(item?.responsibilities) ? item.responsibilities.join(' ') : '',
    responsibilities: Array.isArray(item?.responsibilities) ? item.responsibilities : []
  })) : [];
  const education = Array.isArray(raw.education) ? raw.education.map(item => ({
    ...item, grade: item?.score || item?.grade || '', duration: item?.duration || ''
  })) : [];
  const projects = Array.isArray(raw.projects) ? raw.projects.map(item => ({
    ...item,
    technologies: Array.isArray(item?.tech_stack) ? item.tech_stack : (Array.isArray(item?.technologies) ? item.technologies : [])
  })) : [];

  return {
    ...raw,
    contact: {
      ...contact,
      name: raw.name || contact.name || '',
      linkedin,
      github,
      evidence: contact.evidence || raw.name_evidence || ''
    },
    education,
    experience,
    projects,
    skills,
    certifications: Array.isArray(raw.certifications) ? raw.certifications : [],
    achievements: Array.isArray(raw.achievements) ? raw.achievements.map(item => typeof item === 'string'
      ? { title: item, evidence: item }
      : item) : [],
    recommendations: Array.isArray(raw.suggestions) ? raw.suggestions : (Array.isArray(raw.recommendations) ? raw.recommendations : [])
  };
}

function classifyHeading(value) {
  const heading = normalized(value).replace(/\\s+/g, ' ');
  if (/^(professional )?(work )?experience$|^(employment|work) history$|^internships?$/.test(heading)) return 'experience';
  if (/^(academic )?projects?$|^(personal|selected) projects?$/.test(heading)) return 'projects';
  if (/^(education|qualifications|academic background)$/.test(heading)) return 'education';
  if (/^(certifications?|licenses?)$/.test(heading)) return 'certifications';
  if (/^(technical )?skills$|^core competencies$/.test(heading)) return 'skills';
  return '';
}

function sectionForEvidence(source, evidence) {
  const body = normalized(source);
  const quote = normalized(evidence);
  const evidenceOffset = quote ? body.indexOf(quote) : -1;
  if (evidenceOffset < 0) return '';
  let offset = 0;
  let section = '';
  for (const line of String(source || '').split(/\\r?\\n/)) {
    const kind = classifyHeading(line.replace(/[:|]+/g, ' ').trim());
    if (kind) section = kind;
    const lineLength = normalized(line).length;
    if (evidenceOffset <= offset + lineLength) return section;
    offset += lineLength + 1;
  }
  return section;
}

function sentenceLikeProjectTitle(value) {
  const title = text(value, 500).trim();
  return !title || title.length > 100 || title.split(/\\s+/).length > 12 || /[.!?]$/.test(title) ||
    /^(built|created|developed|implemented|designed|improved|used|worked|led|managed|worked on|utilized|leveraged)\\b/i.test(title);
}

function supportsRSkill(source) {
  const lines = String(source || '').split(/\\r?\\n/);
  let inSkills = false;
  for (const line of lines) {
    const kind = classifyHeading(line.replace(/[:|]+/g, ' ').trim());
    if (kind) inSkills = kind === 'skills';
    if (inSkills && /(?:^|[,;|/\\s])R(?:$|[,;|/\\s])/i.test(line) && /\\bR\\s+(?:programming|language)\\b|\\bRStudio\\b/i.test(source)) return true;
  }
  return false;
}

function canonicalSkillName(value) {
  const normalizedName = normalized(value);
  const known = {
    js: 'JavaScript', javascript: 'JavaScript', 'react js': 'React', reactjs: 'React', 'react js library': 'React',
    node: 'Node.js', nodejs: 'Node.js', 'node js': 'Node.js', ts: 'TypeScript', typescript: 'TypeScript',
    'next js': 'Next.js', nextjs: 'Next.js', 'vue js': 'Vue.js', vuejs: 'Vue.js', 'c plus plus': 'C++',
    'c sharp': 'C#', postgresql: 'PostgreSQL', postgres: 'PostgreSQL', mongodb: 'MongoDB', mongo: 'MongoDB',
    'amazon web services': 'AWS', aws: 'AWS', 'google cloud platform': 'Google Cloud', gcp: 'Google Cloud'
  };
  if (known[normalizedName]) return known[normalizedName];
  return text(value, 80).replace(/\s+/g, ' ').replace(/\b[a-z]/g, letter => letter.toUpperCase());
}

const genericSkillWords = new Set([
  ...stopWords,
  'team', 'teams', 'work', 'professional', 'proficient', 'proficiency', 'knowledge',
  'familiar', 'various', 'using', 'used', 'development', 'responsibilities', 'duties'
]);

function isSupportedSkillName(name, evidence, source) {
  const key = normalized(name);
  if (!key || genericSkillWords.has(key)) return false;
  if (key !== 'r') return key.length >= 2;
  return /\bR\s+(?:programming|language|statistical|data analysis)\b|\bRStudio\b|\b(?:ggplot2|dplyr|tidyverse)\b/i.test(`${evidence}\n${source}`);
}

function validateStructuredResult(raw, source) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Object.assign(new Error('The AI response did not match the expected resume data shape.'), { code: 'AI_SCHEMA_INVALID', status: 502 });
  raw = adaptRequestedSchema(raw);
  const contact = {};
  const rawContact = raw.contact && typeof raw.contact === 'object' ? raw.contact : {};
  const contactEvidence = text(rawContact.evidence, 600);
  if (supportedBySource(contactEvidence, source)) {
    ['name', 'email', 'phone', 'location', 'linkedin', 'github'].forEach(key => {
      const candidate = text(rawContact[key], 300);
      if (candidate && supportedBySource(candidate, source)) contact[key] = candidate;
    });
    contact.evidence = contactEvidence;
  }

  const summaryRaw = raw.summary && typeof raw.summary === 'object' ? raw.summary : {};
  const summaryText = text(summaryRaw.text, 3000);
  const summary = summaryText && supportedBySource(text(summaryRaw.evidence, 600), source) && supportedContent(summaryText, source)
    ? { text: summaryText, evidence: text(summaryRaw.evidence, 600), confidence: Math.max(0, Math.min(1, Number(summaryRaw.confidence) || 0)) }
    : null;

  const education = records(raw.education, source, ['institution', 'degree', 'field', 'startDate', 'endDate', 'duration', 'grade', 'description']);
  const experience = records(raw.experience, source, ['employer', 'role', 'location', 'startDate', 'endDate', 'duration', 'description', 'responsibilities[]', 'accomplishments[]'])
    .filter(item => sectionForEvidence(source, item.evidence) !== 'projects');
  experience.forEach(item => {
    item.current = /present|current|now/i.test(item.endDate || '');
  });
  const projects = records(raw.projects, source, ['title', 'description', 'technologies[]', 'startDate', 'endDate', 'link']);
  const validProjects = projects.filter(project => {
    const title = normalized(project.title);
    if (!title || sentenceLikeProjectTitle(project.title) || /^(?:project|projects|technical skills|skills|technology|technologies|tools|frameworks?|tech stack|technology stack|stack|languages|database|databases)$/i.test(title)) return false;
    if (sectionForEvidence(source, project.evidence) === 'experience') return false;
    const titleTokens = title.split(' ').filter(Boolean);
    const technologyTokens = new Set((project.technologies || []).flatMap(name => normalized(name).split(' ')));
    const titleIsOnlyTechnologies = titleTokens.length > 0 && titleTokens.every(token => technologyTokens.has(token));
    if (titleIsOnlyTechnologies) return false;
    return Boolean(project.description || project.technologies?.length);
  });
  const certifications = records(raw.certifications, source, ['name', 'issuer', 'date']).filter(item => item.name);
  const simpleRecordFields = ['title', 'description', 'date'];
  const awards = records(raw.awards, source, simpleRecordFields);
  const achievements = records(raw.achievements, source, simpleRecordFields);
  const publications = records(raw.publications, source, simpleRecordFields);
  const additionalSections = Array.isArray(raw.additionalSections) ? raw.additionalSections.slice(0, 80).map(section => {
    if (!section || typeof section !== 'object') return null;
    const entries = records(section.entries, source, simpleRecordFields);
    const heading = text(section.heading, 100);
    return heading && entries.length ? { heading, entries } : null;
  }).filter(Boolean) : [];

  const seenSkills = new Set();
  const skills = records(raw.skills, source, ['name', 'category', 'source'])
    .map(skill => ({ ...skill, name: canonicalSkillName(skill.name), source: skill.source === 'inferred' ? 'inferred' : 'explicit' }))
    .filter(skill => {
      const key = normalized(skill.name);
      if (!isSupportedSkillName(skill.name, skill.evidence, source) || seenSkills.has(key)) return false;
      if (!supportedBySource(skill.evidence, source)) return false;
      seenSkills.add(key);
      return true;
    });

  const recommendations = Array.isArray(raw.recommendations) ? raw.recommendations.slice(0, 40).map(item => {
    if (!item || typeof item !== 'object') return null;
    const message = text(item.message, 700);
    if (!message) return null;
    const evidence = cleanArray(item.evidence, 10).filter(quote => supportedBySource(quote, source));
    const conditionalAdvice = /^(consider|if\b|when\b|you may|review\b|add\b|include\b|for clarity|to improve|no .* (?:was|were) (?:identified|detected))/i.test(message);
    if (!evidence.length && !item.requiresUserEvidence && !conditionalAdvice) return null;
    return {
      type: text(item.category, 80) || 'resume-review',
      priority: ['low', 'medium', 'high'].includes(item.priority) ? item.priority : 'medium',
      message,
      evidence,
      requiresUserEvidence: Boolean(item.requiresUserEvidence)
    };
  }).filter(Boolean) : [];

  return {
    contact,
    summary,
    education,
    experience,
    projects: validProjects,
    skills,
    certifications,
    awards,
    achievements,
    publications,
    additionalSections,
    recommendations
  };
}

function makeScores(source, data, jobDescription) {
  const words = source.split(/\s+/).filter(Boolean).length;
  const lines = source.split('\n').filter(line => line.trim());
  if (words < 25) return { ats: null, formatting: null, skillMatch: null, keywords: null, criteria: [] };
  const readableRatio = source.replace(/[^\x09\x0a\x0d\x20-\x7e]/g, '').length / Math.max(source.length, 1);
  const reasonableLineRatio = lines.filter(line => line.length <= 180).length / Math.max(lines.length, 1);
  const recognizedHeading = /^(professional\s+)?(summary|profile|experience|employment history|work history|projects?|academic projects|education|qualifications|skills|technical skills|achievements|awards|certifications|publications)\s*:??$/im.test(source);
  const listLines = lines.filter(line => /^\s*(?:[-*•▪◦]|\d+[.)])\s+/.test(line));
  const listConsistency = listLines.length < 2 ? 1 : (() => {
    const markers = listLines.map(line => line.trim().match(/^([-*•▪◦]|\d+[.)])/)[0]);
    const common = Math.max(...[...new Set(markers)].map(marker => markers.filter(value => value === marker).length));
    return common / markers.length;
  })();
  const artifactRatio = Math.max(0, 1 - ((source.match(/[|]{3,}|[_]{4,}|(?:\b[A-Za-z]\s){8,}/g) || []).length / Math.max(lines.length, 1)));
  const extractionScore = Math.round(100 * (0.4 * readableRatio + 0.3 * reasonableLineRatio + 0.2 * (recognizedHeading ? 1 : 0.5) + 0.1 * artifactRatio));
  const formattingScore = Math.round(100 * (0.35 * reasonableLineRatio + 0.25 * (recognizedHeading ? 1 : 0.5) + 0.2 * listConsistency + 0.2 * artifactRatio));

  let skillMatch = null;
  let keywordScore = null;
  if (typeof jobDescription === 'string' && jobDescription.trim()) {
    const jobTerms = [...new Set(normalized(jobDescription).split(' ').filter(word => word.length > 2 && !stopWords.has(word)))];
    if (jobTerms.length) {
      const resumeSkillText = normalized(data.skills.map(skill => skill.name).join(' '));
      const resumeText = normalized(source);
      const skillTerms = jobTerms.filter(term => resumeSkillText.includes(term));
      const matchedTerms = jobTerms.filter(term => resumeText.includes(term));
      skillMatch = Math.round(100 * skillTerms.length / jobTerms.length);
      keywordScore = Math.round(100 * matchedTerms.length / jobTerms.length);
    }
  }

  const criteria = [
    { score: extractionScore, label: 'ATS parsing checks', explanation: '40% readable extracted text, 30% lines at or below 180 characters, 20% recognizable section heading, and 10% low extraction-artifact rate. This is not an ATS compatibility guarantee.' },
    { score: formattingScore, label: 'Formatting checks', explanation: '35% line length readability, 25% recognizable section separation, 20% consistent list markers, and 20% low extraction-artifact rate.' },
    { score: skillMatch, label: 'Job skill coverage', explanation: jobTermsExplanation(jobDescription, 'Coverage is explicit skills found in the supplied job description.') },
    { score: keywordScore, label: 'Job keyword coverage', explanation: jobTermsExplanation(jobDescription, 'Coverage is distinct non-generic terms from the supplied job description found in extracted resume text.') }
  ];
  return { ats: extractionScore, formatting: formattingScore, skillMatch, keywords: keywordScore, criteria };
}

function jobTermsExplanation(jobDescription, present) {
  return jobDescription && jobDescription.trim() ? present : 'Unavailable: provide a real job description to calculate a job-specific score.';
}

function addGroundedSuggestions(data, scores) {
  const suggestions = [...data.recommendations];
  const add = (type, priority, message, evidence = [], requiresUserEvidence = false) => {
    if (!suggestions.some(item => item.type === type && item.message === message)) suggestions.push({ type, priority, message, evidence, requiresUserEvidence });
  };
  if (!data.summary) add('summary', 'low', 'No professional summary was identified. Add one only if it helps explain your relevant background.');
  if (!data.education.length && !data.experience.length && !data.projects.length) {
    add('content-review', 'high', 'The document yielded no verifiable education, experience, or project entries. Review the extracted text or upload a clearer copy.');
  }
  const allDescriptions = [...data.experience, ...data.projects].flatMap(item => [item.description, ...(item.responsibilities || []), ...(item.accomplishments || [])]).filter(Boolean);
  const vague = allDescriptions.find(description => description.trim().split(/\s+/).length < 8);
  if (vague) add('impact-detail', 'medium', 'Some descriptions are brief. If you have real evidence, clarify your contribution, approach, or outcome; do not add unverified metrics.', [vague], true);
  if (scores.skillMatch == null) add('job-targeting', 'low', 'Job-specific skill and keyword coverage is unavailable until you provide a job description.');
  return suggestions;
}

class ResumeAnalysisService {
  static async analyzeResumeText(source, jobDescription = '') {
    const safeSource = String(source || '').trim();
    if (safeSource.length < 120 || safeSource.split(/\s+/).filter(Boolean).length < 25) {
      throw Object.assign(new Error('The resume text does not contain enough readable information to analyze.'), { code: 'INSUFFICIENT_TEXT', status: 422 });
    }
    const aiResult = await ResumeAiService.extractResume(safeSource);
    const structuredData = validateStructuredResult(aiResult, safeSource);
    const scores = makeScores(safeSource, structuredData, jobDescription);
    const improvementSuggestions = addGroundedSuggestions(structuredData, scores);
    const wordCount = safeSource.split(/\s+/).filter(Boolean).length;

    return {
      structuredData,
      parsedSkills: structuredData.skills.map(skill => skill.name),
      parsedProjects: structuredData.projects,
      parsedCertifications: structuredData.certifications,
      parsedEducation: structuredData.education,
      parsedExperience: structuredData.experience,
      atsScore: scores.ats,
      skillMatchScore: scores.skillMatch,
      formattingScore: scores.formatting,
      keywordScore: scores.keywords,
      scoreDetails: scores.criteria,
      wordCount,
      improvementSuggestions
    };
  }

  static validateStructuredResult(raw, source) {
    return validateStructuredResult(raw, source);
  }

  static adaptRequestedSchema(raw) {
    return adaptRequestedSchema(raw);
  }
}

module.exports = ResumeAnalysisService;
