/**
 * ⭐ UNIQUE FEATURE 2: Personalized Placement Recommendation Engine
 * Recommends suitable jobs, internships, and courses
 * Based on student performance, interests, and application history
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const SkillGapService = require('./skillGap.service');

class RecommendationService {
  /**
   * Get personalized job recommendations for a user
   */
  static async getJobRecommendations(userId, options = {}) {
    const { limit = 10, includeInternships = true } = options;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get user's skills
    const userSkills = user.skills.map(s => s.name.toLowerCase());
    const userInterests = (user.interests || []).map(i => i.domain.toLowerCase());
    const preferredLocations = user.careerPreferences?.preferredLocations || [];
    const preferredRoles = user.careerPreferences?.preferredRoles || [];

    // Get active jobs
    let jobQuery = { status: 'active', isActive: true };
    if (!includeInternships) {
      jobQuery.jobType = { $ne: 'internship' };
    }

    const jobs = await Job.find(jobQuery).limit(100);

    // Score each job
    const scoredJobs = await Promise.all(jobs.map(async (job) => {
      const score = await this.calculateJobMatchScore(user, job, {
        userSkills,
        userInterests,
        preferredLocations,
        preferredRoles
      });
      return { job, score };
    }));

    // Sort by score and return top results
    const recommendations = scoredJobs
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, limit)
      .map(({ job, score }) => ({
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.jobType,
        salary: job.salary,
        requiredSkills: job.requiredSkills.map(s => s.name),
        matchScore: score.total,
        matchDetails: score,
        applicationDeadline: job.applicationDeadline
      }));

    return recommendations;
  }

  /**
   * Calculate match score between user and job
   */
  static async calculateJobMatchScore(user, job, { userSkills, userInterests, preferredLocations, preferredRoles }) {
    const score = {
      skillMatch: 0,
      interestMatch: 0,
      locationMatch: 0,
      roleMatch: 0,
      experienceMatch: 0,
      applicationSuccessBonus: 0,
      total: 0
    };

    // Skill Match (40% weight)
    const requiredSkills = job.requiredSkills.map(s => s.name.toLowerCase());
    const matchingSkills = userSkills.filter(s => 
      requiredSkills.some(rs => rs.includes(s) || s.includes(rs))
    );
    score.skillMatch = (matchingSkills.length / Math.max(1, requiredSkills.length)) * 40;

    // Interest Match (15% weight)
    const jobCategories = (job.categories || []).map(c => c.toLowerCase());
    const interestOverlap = userInterests.filter(i => 
      jobCategories.some(c => c.includes(i) || i.includes(c))
    );
    score.interestMatch = interestOverlap.length > 0 ? 15 : 0;

    // Location Match (15% weight)
    if (preferredLocations.length === 0 || user.careerPreferences?.willingToRelocate) {
      score.locationMatch = 10;
    } else if (job.location?.city && preferredLocations.some(l => 
      l.toLowerCase() === job.location.city.toLowerCase()
    )) {
      score.locationMatch = 15;
    } else if (job.workMode === 'remote') {
      score.locationMatch = 12;
    }

    // Role Match (15% weight)
    const jobTitle = job.title.toLowerCase();
    const roleMatch = preferredRoles.some(r => 
      jobTitle.includes(r.toLowerCase()) || r.toLowerCase().includes(jobTitle.split(' ')[0])
    );
    score.roleMatch = roleMatch ? 15 : 5;

    // Experience Match (10% weight)
    const userYears = new Date().getFullYear() - (user.studentProfile?.year || 0);
    const expMatch = userYears >= (job.experience?.minimum || 0);
    score.experienceMatch = expMatch ? 10 : 3;

    // Application Success Bonus (5% weight)
    const successfulApps = (user.applicationHistory || [])
      .filter(a => ['offered', 'hired'].includes(a.status));
    const similarSuccessfulApp = successfulApps.some(app => {
      // Check if user was successful in similar role
      return true; // Simplified for now
    });
    score.applicationSuccessBonus = similarSuccessfulApp ? 5 : 0;

    // Calculate total
    score.total = Math.round(
      score.skillMatch + 
      score.interestMatch + 
      score.locationMatch + 
      score.roleMatch + 
      score.experienceMatch + 
      score.applicationSuccessBonus
    );

    return score;
  }

  /**
   * Get personalized course recommendations
   */
  static async getCourseRecommendations(userId, options = {}) {
    const { limit = 10, focusOnGaps = true } = options;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get user's current skills
    const userSkills = user.skills.map(s => ({
      name: s.name.toLowerCase(),
      level: s.proficiencyLevel
    }));

    // Get courses
    const courses = await Course.find({ isActive: true }).limit(100);

    // If focusing on skill gaps, get top job recommendations first
    let targetSkills = [];
    if (focusOnGaps) {
      const jobRecs = await this.getJobRecommendations(userId, { limit: 5 });
      // Extract commonly required skills from top jobs
      const skillCounts = {};
      jobRecs.forEach(job => {
        job.requiredSkills.forEach(skill => {
          skillCounts[skill.toLowerCase()] = (skillCounts[skill.toLowerCase()] || 0) + 1;
        });
      });
      targetSkills = Object.entries(skillCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([skill]) => skill);
    }

    // Score each course
    const scoredCourses = courses.map(course => {
      const score = this.calculateCourseMatchScore(course, userSkills, targetSkills, user);
      return { course, score };
    });

    // Sort and return
    const recommendations = scoredCourses
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, limit)
      .map(({ course, score }) => ({
        courseId: course._id,
        title: course.title,
        provider: course.provider,
        skillsTaught: course.skillsTaught.map(s => s.name),
        difficulty: course.difficulty,
        duration: course.duration,
        pricing: course.pricing,
        rating: course.ratings.average,
        matchScore: score.total,
        matchReason: score.reason
      }));

    return recommendations;
  }

  /**
   * Calculate course match score
   */
  static calculateCourseMatchScore(course, userSkills, targetSkills, user) {
    const score = {
      skillGapFill: 0,
      levelAppropriate: 0,
      ratingScore: 0,
      effectivenessScore: 0,
      total: 0,
      reason: ''
    };

    const courseSkills = course.skillsTaught.map(s => s.name.toLowerCase());
    const userSkillNames = userSkills.map(s => s.name);

    // Skill Gap Fill (40% weight)
    const gapSkills = courseSkills.filter(cs => 
      !userSkillNames.some(us => us.includes(cs) || cs.includes(us))
    );
    const targetOverlap = gapSkills.filter(gs => 
      targetSkills.some(ts => ts.includes(gs) || gs.includes(ts))
    );
    
    if (targetOverlap.length > 0) {
      score.skillGapFill = 40;
      score.reason = `Teaches ${targetOverlap.slice(0, 3).join(', ')} which you need`;
    } else if (gapSkills.length > 0) {
      score.skillGapFill = 20;
      score.reason = `Learn new skills: ${gapSkills.slice(0, 3).join(', ')}`;
    }

    // Level Appropriate (25% weight)
    const avgUserLevel = this.getAverageLevel(userSkills);
    const levelMatch = this.matchDifficulty(avgUserLevel, course.difficulty);
    score.levelAppropriate = levelMatch * 25;

    // Rating Score (20% weight)
    score.ratingScore = ((course.ratings?.average || 3) / 5) * 20;

    // Effectiveness Score from feedback loop (15% weight)
    score.effectivenessScore = ((course.effectiveness?.placementSuccessRate || 50) / 100) * 15;

    // Calculate total
    score.total = Math.round(
      score.skillGapFill + 
      score.levelAppropriate + 
      score.ratingScore + 
      score.effectivenessScore
    );

    return score;
  }

  /**
   * Get skill recommendations (what to learn next)
   */
  static async getSkillRecommendations(userId, options = {}) {
    const { limit = 10 } = options;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const userSkills = user.skills.map(s => s.name.toLowerCase());

    // Get trending skills
    const trendingSkills = await Skill.find({ 
      isActive: true,
      'industryDemand.trend': { $in: ['rising', 'stable'] }
    })
    .sort({ 'industryDemand.score': -1 })
    .limit(50);

    // Get skills from top job matches
    const jobRecs = await this.getJobRecommendations(userId, { limit: 10 });
    const jobSkillCounts = {};
    jobRecs.forEach(job => {
      job.requiredSkills.forEach(skill => {
        if (!userSkills.includes(skill.toLowerCase())) {
          jobSkillCounts[skill] = (jobSkillCounts[skill] || 0) + 1;
        }
      });
    });

    // Score and rank skills
    const skillRecommendations = trendingSkills
      .filter(skill => !userSkills.includes(skill.name.toLowerCase()))
      .map(skill => {
        let score = skill.industryDemand.score;
        
        // Boost if needed for top jobs
        if (jobSkillCounts[skill.name]) {
          score += jobSkillCounts[skill.name] * 10;
        }
        
        // Boost if rising trend
        if (skill.industryDemand.trend === 'rising') {
          score += 15;
        }

        return {
          skillId: skill._id,
          name: skill.name,
          category: skill.category,
          demandScore: skill.industryDemand.score,
          trend: skill.industryDemand.trend,
          score,
          reason: jobSkillCounts[skill.name] 
            ? `Required by ${jobSkillCounts[skill.name]} matching jobs`
            : `High industry demand (${skill.industryDemand.trend} trend)`
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return skillRecommendations;
  }

  // Helper methods
  static getAverageLevel(skills) {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    if (skills.length === 0) return 'beginner';
    
    const avg = skills.reduce((sum, s) => sum + (levels[s.level] || 1), 0) / skills.length;
    if (avg >= 3.5) return 'expert';
    if (avg >= 2.5) return 'advanced';
    if (avg >= 1.5) return 'intermediate';
    return 'beginner';
  }

  static matchDifficulty(userLevel, courseLevel) {
    const levels = { beginner: 1, intermediate: 2, advanced: 3 };
    const userNum = levels[userLevel] || 1;
    const courseNum = levels[courseLevel] || 2;
    
    // Best match is course at user level or slightly above
    const diff = courseNum - userNum;
    if (diff === 0 || diff === 1) return 1;
    if (diff === -1) return 0.7;
    return 0.4;
  }
}

module.exports = RecommendationService;
