/**
 * ⭐ UNIQUE FEATURE 6: College & Recruiter Analytics Dashboard
 * Skill trends, placement probability, course effectiveness
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const Feedback = require('../models/Feedback');
const Assessment = require('../models/Assessment');

class AnalyticsService {
  /**
   * Get comprehensive college analytics dashboard
   */
  static async getCollegeDashboard(collegeId) {
    // Get all students from this college
    const students = await User.find({
      role: 'student',
      'studentProfile.college': collegeId
    });

    const studentIds = students.map(s => s._id);

    // Overall statistics
    const stats = {
      totalStudents: students.length,
      placedStudents: 0,
      avgSkillReadiness: 0,
      avgCGPA: 0,
      departmentWise: {},
      skillTrends: [],
      placementProbability: {},
      courseEffectiveness: [],
      monthlyProgress: []
    };

    // Calculate averages
    let totalSkillReadiness = 0;
    let totalCGPA = 0;
    let cgpaCount = 0;

    students.forEach(student => {
      totalSkillReadiness += student.skillReadinessScore?.overall || 0;
      if (student.studentProfile?.cgpa) {
        totalCGPA += student.studentProfile.cgpa;
        cgpaCount++;
      }

      // Department wise count
      const dept = student.studentProfile?.department || 'Unknown';
      if (!stats.departmentWise[dept]) {
        stats.departmentWise[dept] = { total: 0, placed: 0, avgScore: 0, totalScore: 0 };
      }
      stats.departmentWise[dept].total++;
      stats.departmentWise[dept].totalScore += student.skillReadinessScore?.overall || 0;

      // Count placed students
      const isPlaced = student.applicationHistory?.some(a => 
        ['offered', 'hired'].includes(a.status)
      );
      if (isPlaced) {
        stats.placedStudents++;
        stats.departmentWise[dept].placed++;
      }
    });

    stats.avgSkillReadiness = students.length > 0 
      ? Math.round(totalSkillReadiness / students.length) 
      : 0;
    stats.avgCGPA = cgpaCount > 0 
      ? Math.round((totalCGPA / cgpaCount) * 100) / 100 
      : 0;

    // Calculate department averages
    for (const dept of Object.keys(stats.departmentWise)) {
      const d = stats.departmentWise[dept];
      d.avgScore = d.total > 0 ? Math.round(d.totalScore / d.total) : 0;
      d.placementRate = d.total > 0 ? Math.round((d.placed / d.total) * 100) : 0;
      delete d.totalScore;
    }

    // Skill trends across students
    stats.skillTrends = await this.getSkillTrends(studentIds);

    // Placement probability by score ranges
    stats.placementProbability = await this.getPlacementProbability();

    // Course effectiveness
    stats.courseEffectiveness = await this.getCourseEffectiveness();

    // Monthly progress
    stats.monthlyProgress = await this.getMonthlyProgress(studentIds);

    return stats;
  }

  /**
   * Get recruiter analytics dashboard
   */
  static async getRecruiterDashboard(recruiterId) {
    // Get jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: recruiterId });
    const jobIds = jobs.map(j => j._id);

    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'active').length,
      totalApplications: 0,
      totalHired: 0,
      avgMatchScore: 0,
      skillDemand: {},
      applicationFunnel: {
        applied: 0,
        shortlisted: 0,
        interviewed: 0,
        offered: 0,
        hired: 0
      },
      topCandidates: [],
      hiringTrends: []
    };

    // Aggregate job statistics
    let totalMatchScore = 0;
    let matchScoreCount = 0;

    jobs.forEach(job => {
      const applicants = job.applicants || [];
      stats.totalApplications += applicants.length;

      applicants.forEach(app => {
        stats.applicationFunnel[app.status] = (stats.applicationFunnel[app.status] || 0) + 1;
        if (app.matchScore) {
          totalMatchScore += app.matchScore;
          matchScoreCount++;
        }
      });

      // Track hired count
      stats.totalHired += (job.placements || []).length;

      // Skill demand tracking
      (job.requiredSkills || []).forEach(skill => {
        const name = skill.name;
        if (!stats.skillDemand[name]) {
          stats.skillDemand[name] = { count: 0, importance: {} };
        }
        stats.skillDemand[name].count++;
        stats.skillDemand[name].importance[skill.importance] = 
          (stats.skillDemand[name].importance[skill.importance] || 0) + 1;
      });
    });

    stats.avgMatchScore = matchScoreCount > 0 
      ? Math.round(totalMatchScore / matchScoreCount) 
      : 0;

    // Get top candidates across all jobs
    stats.topCandidates = await this.getTopCandidates(jobIds);

    // Hiring trends over time
    stats.hiringTrends = await this.getHiringTrends(recruiterId);

    return stats;
  }

  /**
   * Get skill trends for a group of students
   */
  static async getSkillTrends(studentIds) {
    const students = await User.find({ _id: { $in: studentIds } });
    
    const skillCounts = {};
    const skillLevels = {};

    students.forEach(student => {
      (student.skills || []).forEach(skill => {
        const name = skill.name;
        skillCounts[name] = (skillCounts[name] || 0) + 1;
        
        if (!skillLevels[name]) {
          skillLevels[name] = { beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
        }
        skillLevels[name][skill.proficiencyLevel]++;
      });
    });

    // Sort by count and return top skills
    return Object.entries(skillCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / Math.max(1, studentIds.length)) * 100),
        levelDistribution: skillLevels[name]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }

  /**
   * Get placement probability by skill readiness score
   */
  static async getPlacementProbability() {
    const buckets = [
      { range: '0-20', min: 0, max: 20 },
      { range: '21-40', min: 21, max: 40 },
      { range: '41-60', min: 41, max: 60 },
      { range: '61-80', min: 61, max: 80 },
      { range: '81-100', min: 81, max: 100 }
    ];

    const result = {};

    for (const bucket of buckets) {
      const students = await User.find({
        role: 'student',
        'skillReadinessScore.overall': { $gte: bucket.min, $lte: bucket.max }
      });

      const placed = students.filter(s => 
        s.applicationHistory?.some(a => ['offered', 'hired'].includes(a.status))
      ).length;

      result[bucket.range] = {
        total: students.length,
        placed,
        probability: students.length > 0 
          ? Math.round((placed / students.length) * 100) 
          : 0
      };
    }

    return result;
  }

  /**
   * Get course effectiveness metrics
   */
  static async getCourseEffectiveness() {
    const courses = await Course.find({ isActive: true })
      .select('title effectiveness ratings enrollments')
      .sort({ 'effectiveness.placementSuccessRate': -1 })
      .limit(10);

    return courses.map(course => ({
      id: course._id,
      title: course.title,
      rating: course.ratings?.average || 0,
      enrollments: course.enrollments?.total || 0,
      completions: course.enrollments?.completions || 0,
      completionRate: course.enrollments?.total > 0
        ? Math.round((course.enrollments.completions / course.enrollments.total) * 100)
        : 0,
      skillImprovement: course.effectiveness?.averageSkillImprovement || 0,
      placementSuccessRate: course.effectiveness?.placementSuccessRate || 0
    }));
  }

  /**
   * Get monthly progress data
   */
  static async getMonthlyProgress(studentIds) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const feedbacks = await Feedback.find({
      userId: { $in: studentIds },
      type: 'placement-outcome',
      createdAt: { $gte: sixMonthsAgo }
    });

    // Group by month
    const monthly = {};
    feedbacks.forEach(f => {
      const month = f.createdAt.toISOString().slice(0, 7);
      if (!monthly[month]) {
        monthly[month] = { placements: 0, total: 0 };
      }
      monthly[month].total++;
      if (f.placementOutcome?.wasPlaced) {
        monthly[month].placements++;
      }
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({
        month,
        placements: data.placements,
        applications: data.total
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get top candidates for recruiter's jobs
   */
  static async getTopCandidates(jobIds) {
    const jobs = await Job.find({ _id: { $in: jobIds } })
      .populate('applicants.userId', 'name email skills skillReadinessScore');

    const candidates = [];
    
    jobs.forEach(job => {
      (job.applicants || []).forEach(app => {
        if (app.userId && app.matchScore >= 60) {
          candidates.push({
            userId: app.userId._id,
            name: app.userId.name,
            email: app.userId.email,
            jobTitle: job.title,
            matchScore: app.matchScore,
            skillReadiness: app.userId.skillReadinessScore?.overall || 0,
            status: app.status
          });
        }
      });
    });

    return candidates
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  /**
   * Get hiring trends for a recruiter
   */
  static async getHiringTrends(recruiterId) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const jobs = await Job.find({
      postedBy: recruiterId,
      createdAt: { $gte: sixMonthsAgo }
    });

    const monthly = {};
    
    jobs.forEach(job => {
      const month = job.createdAt.toISOString().slice(0, 7);
      if (!monthly[month]) {
        monthly[month] = { posted: 0, applications: 0, hired: 0 };
      }
      monthly[month].posted++;
      monthly[month].applications += (job.applicants || []).length;
      monthly[month].hired += (job.placements || []).length;
    });

    return Object.entries(monthly)
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get admin overview analytics
   */
  static async getAdminOverview() {
    const [
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalCourses,
      activeJobs,
      recentPlacements
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Course.countDocuments({ isActive: true }),
      Job.countDocuments({ status: 'active' }),
      Feedback.countDocuments({
        type: 'placement-outcome',
        'placementOutcome.wasPlaced': true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Get skill demand trends
    const skillDemand = await Skill.find({ isActive: true })
      .sort({ 'industryDemand.score': -1 })
      .limit(10)
      .select('name category industryDemand');

    return {
      overview: {
        totalStudents,
        totalRecruiters,
        totalJobs,
        totalCourses,
        activeJobs,
        recentPlacements
      },
      skillDemand: skillDemand.map(s => ({
        name: s.name,
        category: s.category,
        score: s.industryDemand.score,
        trend: s.industryDemand.trend
      }))
    };
  }
}

module.exports = AnalyticsService;
