/**
 * ⭐ UNIQUE FEATURE 1: AI-Based Skill Gap Analyzer
 * Analyzes student's current skills vs industry requirements
 * Identifies missing skills and provides recommendations
 */

const User = require('../models/User');
const Skill = require('../models/Skill');
const Job = require('../models/Job');

class SkillGapService {
  /**
   * Analyze skill gap between user skills and job requirements
   */
  static async analyzeGap(userId, jobId) {
    const user = await User.findById(userId);
    const job = await Job.findById(jobId);

    if (!user || !job) {
      throw new Error('User or Job not found');
    }

    const userSkills = user.skills.map(s => ({
      name: s.name.toLowerCase(),
      level: s.proficiencyLevel,
      score: s.proficiencyScore
    }));

    const requiredSkills = job.requiredSkills.map(s => ({
      name: s.name.toLowerCase(),
      importance: s.importance,
      minimumProficiency: s.minimumProficiency,
      weight: s.weight
    }));

    // Analyze matching and missing skills
    const analysis = {
      matchingSkills: [],
      partialMatchSkills: [],
      missingSkills: [],
      overallMatchScore: 0,
      recommendations: []
    };

    let totalWeight = 0;
    let matchedWeight = 0;

    for (const required of requiredSkills) {
      const userSkill = userSkills.find(s => 
        s.name === required.name || 
        s.name.includes(required.name) || 
        required.name.includes(s.name)
      );

      totalWeight += required.weight;

      if (userSkill) {
        const proficiencyMatch = this.compareProficiency(userSkill.level, required.minimumProficiency);
        
        if (proficiencyMatch >= 100) {
          analysis.matchingSkills.push({
            skill: required.name,
            userLevel: userSkill.level,
            requiredLevel: required.minimumProficiency,
            status: 'matched'
          });
          matchedWeight += required.weight;
        } else {
          analysis.partialMatchSkills.push({
            skill: required.name,
            userLevel: userSkill.level,
            requiredLevel: required.minimumProficiency,
            gapPercentage: 100 - proficiencyMatch,
            status: 'partial'
          });
          matchedWeight += (required.weight * proficiencyMatch / 100);
        }
      } else {
        analysis.missingSkills.push({
          skill: required.name,
          importance: required.importance,
          requiredLevel: required.minimumProficiency,
          status: 'missing'
        });
      }
    }

    // Calculate overall match score
    analysis.overallMatchScore = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 0;

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Compare proficiency levels
   */
  static compareProficiency(userLevel, requiredLevel) {
    const levels = {
      'beginner': 1,
      'intermediate': 2,
      'advanced': 3,
      'expert': 4
    };

    const userScore = levels[userLevel] || 0;
    const requiredScore = levels[requiredLevel] || 2;

    if (userScore >= requiredScore) return 100;
    return (userScore / requiredScore) * 100;
  }

  /**
   * Generate learning recommendations based on skill gap
   */
  static generateRecommendations(analysis) {
    const recommendations = [];

    // Prioritize must-have missing skills
    const mustHaveSkills = analysis.missingSkills
      .filter(s => s.importance === 'must-have')
      .map(s => ({
        type: 'critical',
        skill: s.skill,
        message: `Learn ${s.skill} - This is a must-have skill for this role`,
        priority: 1
      }));

    // Partial match improvements
    const partialImprovements = analysis.partialMatchSkills
      .sort((a, b) => b.gapPercentage - a.gapPercentage)
      .map(s => ({
        type: 'improvement',
        skill: s.skill,
        message: `Improve ${s.skill} from ${s.userLevel} to ${s.requiredLevel}`,
        priority: 2
      }));

    // Nice-to-have skills
    const niceToHaveSkills = analysis.missingSkills
      .filter(s => s.importance === 'nice-to-have')
      .map(s => ({
        type: 'optional',
        skill: s.skill,
        message: `Consider learning ${s.skill} to stand out`,
        priority: 3
      }));

    return [...mustHaveSkills, ...partialImprovements, ...niceToHaveSkills];
  }

  /**
   * ⭐ UNIQUE FEATURE 3: Calculate Skill Readiness Score (0-100)
   */
  static async calculateReadinessScore(user) {
    const scores = {
      technical: 0,
      softSkills: 0,
      domainKnowledge: 0,
      projectExperience: 0,
      certifications: 0,
      overall: 0
    };

    // Technical skills score (based on skill count and proficiency)
    const technicalSkills = user.skills.filter(s => 
      ['programming-language', 'framework', 'database', 'cloud', 'devops'].includes(s.category)
    );
    if (technicalSkills.length > 0) {
      const avgTechScore = technicalSkills.reduce((sum, s) => sum + s.proficiencyScore, 0) / technicalSkills.length;
      scores.technical = Math.min(100, avgTechScore + (technicalSkills.length * 2));
    }

    // Soft skills score
    const softSkills = user.skills.filter(s => s.category === 'soft-skills');
    scores.softSkills = Math.min(100, softSkills.length * 15 + 
      softSkills.reduce((sum, s) => sum + s.proficiencyScore, 0) / Math.max(1, softSkills.length));

    // Domain knowledge score
    const domainSkills = user.skills.filter(s => s.category === 'domain-knowledge');
    scores.domainKnowledge = Math.min(100, domainSkills.length * 20 + 
      domainSkills.reduce((sum, s) => sum + s.proficiencyScore, 0) / Math.max(1, domainSkills.length));

    // Project experience score
    const projects = user.resumeData?.parsedProjects || [];
    scores.projectExperience = Math.min(100, projects.length * 15 + 
      (user.studentProfile?.cgpa || 0) * 5);

    // Certifications score
    const certifications = user.resumeData?.parsedCertifications || [];
    scores.certifications = Math.min(100, certifications.length * 20);

    // Assessment bonus
    const assessments = user.assessmentHistory || [];
    const avgAssessmentScore = assessments.length > 0 
      ? assessments.reduce((sum, a) => sum + (a.score || 0), 0) / assessments.length 
      : 0;

    // Course completion bonus
    const completedCourses = (user.courseProgress || []).filter(c => c.progress === 100);
    const courseBonus = completedCourses.length * 5;

    // Calculate overall score
    scores.overall = Math.round(
      (scores.technical * 0.35) +
      (scores.softSkills * 0.15) +
      (scores.domainKnowledge * 0.15) +
      (scores.projectExperience * 0.20) +
      (scores.certifications * 0.15) +
      (avgAssessmentScore * 0.1) +
      courseBonus
    );

    scores.overall = Math.min(100, scores.overall);

    return scores;
  }

  /**
   * Bulk analyze skill gaps for multiple jobs
   */
  static async analyzeMultipleJobs(userId, jobIds) {
    const analyses = await Promise.all(
      jobIds.map(jobId => this.analyzeGap(userId, jobId).catch(e => null))
    );
    
    return analyses.filter(a => a !== null);
  }

  /**
   * Get industry skill trends
   */
  static async getSkillTrends() {
    const skills = await Skill.find({ isActive: true })
      .sort({ 'industryDemand.score': -1 })
      .limit(20);

    return skills.map(s => ({
      name: s.name,
      category: s.category,
      demandScore: s.industryDemand.score,
      trend: s.industryDemand.trend
    }));
  }
}

module.exports = SkillGapService;
