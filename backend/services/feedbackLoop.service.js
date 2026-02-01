/**
 * ⭐ UNIQUE FEATURE 7: Feedback Loop Learning Model
 * Placement results feed back into system
 * Recommendation accuracy improves over time
 */

const Feedback = require('../models/Feedback');
const User = require('../models/User');
const Job = require('../models/Job');
const Course = require('../models/Course');

class FeedbackLoopService {
  /**
   * Record placement outcome for learning
   */
  static async recordPlacementOutcome(data) {
    const {
      userId,
      jobId,
      wasPlaced,
      company,
      role,
      salary,
      placementDate
    } = data;

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get pre-placement metrics
    const preSkillReadinessScore = user.skillReadinessScore?.overall || 0;

    const feedback = new Feedback({
      type: 'placement-outcome',
      userId,
      relatedEntities: { jobId },
      placementOutcome: {
        wasPlaced,
        company,
        role,
        salary,
        placementDate,
        preSkillReadinessScore,
        preSkillGapScore: 0, // Could be calculated
        recommendationScore: 0
      },
      metadata: {
        userProfile: {
          college: user.studentProfile?.college,
          department: user.studentProfile?.department,
          cgpa: user.studentProfile?.cgpa,
          skillCount: user.skills?.length || 0
        }
      }
    });

    await feedback.save();

    // Update job placement stats
    if (wasPlaced && jobId) {
      await Job.findByIdAndUpdate(jobId, {
        $push: {
          placements: {
            userId,
            hiredAt: placementDate || new Date(),
            offeredSalary: salary
          }
        },
        $inc: { 'analytics.hired': 1 }
      });
    }

    return feedback;
  }

  /**
   * Record course effectiveness feedback
   */
  static async recordCourseEffectiveness(data) {
    const {
      userId,
      courseId,
      skillsBefore,
      skillsAfter,
      contentQuality,
      practicalRelevance,
      helpedInPlacement
    } = data;

    // Calculate skill improvement
    let totalImprovement = 0;
    if (skillsBefore && skillsAfter) {
      const beforeSum = skillsBefore.reduce((s, sk) => s + sk.level, 0);
      const afterSum = skillsAfter.reduce((s, sk) => s + sk.level, 0);
      totalImprovement = afterSum - beforeSum;
    }

    const feedback = new Feedback({
      type: 'course-effectiveness',
      userId,
      relatedEntities: { courseId },
      courseEffectiveness: {
        courseCompleted: true,
        skillsBefore,
        skillsAfter,
        skillImprovement: totalImprovement,
        contentQuality,
        practicalRelevance,
        overallRating: Math.round((contentQuality + practicalRelevance) / 2),
        helpedInPlacement,
        wouldRecommend: contentQuality >= 4
      }
    });

    await feedback.save();

    // Update course effectiveness metrics
    await this.updateCourseEffectiveness(courseId);

    return feedback;
  }

  /**
   * Record recommendation accuracy feedback
   */
  static async recordRecommendationFeedback(data) {
    const {
      userId,
      recommendationType,
      relatedId,
      wasRelevant,
      wasActedUpon,
      outcome,
      accuracyRating
    } = data;

    const feedback = new Feedback({
      type: 'recommendation-accuracy',
      userId,
      relatedEntities: {
        ...(recommendationType === 'job' && { jobId: relatedId }),
        ...(recommendationType === 'course' && { courseId: relatedId })
      },
      recommendationAccuracy: {
        recommendationType,
        wasRelevant,
        wasActedUpon,
        outcome,
        accuracyRating
      }
    });

    await feedback.save();
    return feedback;
  }

  /**
   * Update recommendation model based on feedback
   * This runs periodically to improve recommendations
   */
  static async updateRecommendationModel() {
    console.log('Starting recommendation model update...');

    // Get unprocessed feedback
    const feedbacks = await Feedback.find({ isProcessed: false }).limit(1000);

    if (feedbacks.length === 0) {
      console.log('No new feedback to process');
      return;
    }

    // Analyze placement outcomes
    const placementFeedbacks = feedbacks.filter(f => f.type === 'placement-outcome');
    const placementInsights = this.analyzePlacementFeedbacks(placementFeedbacks);

    // Analyze course effectiveness
    const courseFeedbacks = feedbacks.filter(f => f.type === 'course-effectiveness');
    const courseInsights = this.analyzeCourseEffectiveness(courseFeedbacks);

    // Analyze recommendation accuracy
    const recFeedbacks = feedbacks.filter(f => f.type === 'recommendation-accuracy');
    const recInsights = this.analyzeRecommendationAccuracy(recFeedbacks);

    // Update model performance record
    const modelPerformance = new ModelPerformance({
      modelType: 'job-recommendation',
      version: `v${Date.now()}`,
      metrics: {
        accuracy: recInsights.accuracy,
        precision: recInsights.precision
      },
      trainingData: {
        sampleSize: feedbacks.length,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        }
      },
      feedbackIncorporated: {
        totalFeedbacks: feedbacks.length,
        positiveOutcomes: placementInsights.successCount,
        negativeOutcomes: placementInsights.failureCount
      }
    });

    await modelPerformance.save();

    // Mark feedbacks as processed
    await Feedback.updateMany(
      { _id: { $in: feedbacks.map(f => f._id) } },
      { isProcessed: true, processedAt: new Date() }
    );

    // Apply insights to improve recommendations
    await this.applyInsights(placementInsights, courseInsights, recInsights);

    console.log(`Processed ${feedbacks.length} feedbacks`);
    return {
      processed: feedbacks.length,
      placementInsights,
      courseInsights,
      recInsights
    };
  }

  /**
   * Analyze placement feedbacks for patterns
   */
  static analyzePlacementFeedbacks(feedbacks) {
    const successfulPlacements = feedbacks.filter(f => f.placementOutcome?.wasPlaced);
    const failedPlacements = feedbacks.filter(f => !f.placementOutcome?.wasPlaced);

    // Calculate average scores for successful vs failed placements
    const avgSuccessScore = successfulPlacements.length > 0
      ? successfulPlacements.reduce((s, f) => s + (f.placementOutcome?.preSkillReadinessScore || 0), 0) / successfulPlacements.length
      : 0;

    const avgFailScore = failedPlacements.length > 0
      ? failedPlacements.reduce((s, f) => s + (f.placementOutcome?.preSkillReadinessScore || 0), 0) / failedPlacements.length
      : 0;

    // Identify skill patterns in successful placements
    const successSkillPatterns = {};
    successfulPlacements.forEach(f => {
      const skillCount = f.metadata?.userProfile?.skillCount || 0;
      const bucket = Math.floor(skillCount / 5) * 5;
      successSkillPatterns[bucket] = (successSkillPatterns[bucket] || 0) + 1;
    });

    return {
      successCount: successfulPlacements.length,
      failureCount: failedPlacements.length,
      successRate: feedbacks.length > 0 ? (successfulPlacements.length / feedbacks.length) * 100 : 0,
      avgSuccessScore,
      avgFailScore,
      minScoreForSuccess: avgSuccessScore - 10, // Threshold recommendation
      successSkillPatterns
    };
  }

  /**
   * Analyze course effectiveness patterns
   */
  static analyzeCourseEffectiveness(feedbacks) {
    const effectiveCourses = feedbacks.filter(f => 
      f.courseEffectiveness?.skillImprovement > 0 || f.courseEffectiveness?.helpedInPlacement
    );

    // Group by course
    const courseStats = {};
    feedbacks.forEach(f => {
      const courseId = f.relatedEntities?.courseId?.toString();
      if (courseId) {
        if (!courseStats[courseId]) {
          courseStats[courseId] = {
            totalFeedbacks: 0,
            totalImprovement: 0,
            helpedCount: 0
          };
        }
        courseStats[courseId].totalFeedbacks++;
        courseStats[courseId].totalImprovement += f.courseEffectiveness?.skillImprovement || 0;
        if (f.courseEffectiveness?.helpedInPlacement) {
          courseStats[courseId].helpedCount++;
        }
      }
    });

    return {
      totalCourses: Object.keys(courseStats).length,
      effectiveCount: effectiveCourses.length,
      courseStats,
      avgImprovement: feedbacks.length > 0
        ? feedbacks.reduce((s, f) => s + (f.courseEffectiveness?.skillImprovement || 0), 0) / feedbacks.length
        : 0
    };
  }

  /**
   * Analyze recommendation accuracy
   */
  static analyzeRecommendationAccuracy(feedbacks) {
    const relevant = feedbacks.filter(f => f.recommendationAccuracy?.wasRelevant);
    const actedUpon = feedbacks.filter(f => f.recommendationAccuracy?.wasActedUpon);
    const positive = feedbacks.filter(f => f.recommendationAccuracy?.outcome === 'positive');

    return {
      total: feedbacks.length,
      relevantCount: relevant.length,
      actedUponCount: actedUpon.length,
      positiveOutcomes: positive.length,
      accuracy: feedbacks.length > 0 ? (relevant.length / feedbacks.length) * 100 : 0,
      precision: actedUpon.length > 0 ? (positive.length / actedUpon.length) * 100 : 0,
      avgRating: feedbacks.length > 0
        ? feedbacks.reduce((s, f) => s + (f.recommendationAccuracy?.accuracyRating || 3), 0) / feedbacks.length
        : 3
    };
  }

  /**
   * Apply insights to improve system
   */
  static async applyInsights(placementInsights, courseInsights, recInsights) {
    // Update course effectiveness scores
    for (const [courseId, stats] of Object.entries(courseInsights.courseStats)) {
      if (stats.totalFeedbacks >= 5) { // Only update with enough data
        const avgImprovement = stats.totalImprovement / stats.totalFeedbacks;
        const placementSuccessRate = (stats.helpedCount / stats.totalFeedbacks) * 100;

        await Course.findByIdAndUpdate(courseId, {
          'effectiveness.averageSkillImprovement': avgImprovement,
          'effectiveness.placementSuccessRate': placementSuccessRate,
          'effectiveness.lastCalculated': new Date()
        });
      }
    }

    // Log insights for model tuning
    console.log('Applied insights:', {
      minScoreForPlacement: placementInsights.minScoreForSuccess,
      courseEffectiveness: courseInsights.avgImprovement,
      recommendationAccuracy: recInsights.accuracy
    });
  }

  /**
   * Update course effectiveness metrics
   */
  static async updateCourseEffectiveness(courseId) {
    const feedbacks = await Feedback.find({
      type: 'course-effectiveness',
      'relatedEntities.courseId': courseId
    }).limit(100);

    if (feedbacks.length >= 5) {
      const avgImprovement = feedbacks.reduce((s, f) => 
        s + (f.courseEffectiveness?.skillImprovement || 0), 0) / feedbacks.length;
      
      const helpedCount = feedbacks.filter(f => f.courseEffectiveness?.helpedInPlacement).length;

      await Course.findByIdAndUpdate(courseId, {
        'effectiveness.averageSkillImprovement': avgImprovement,
        'effectiveness.placementSuccessRate': (helpedCount / feedbacks.length) * 100,
        'effectiveness.studentsPlacedAfterCourse': helpedCount,
        'effectiveness.lastCalculated': new Date()
      });
    }
  }

  /**
   * Get analytics insights
   */
  static async getAnalyticsInsights() {
    // Placement success by skill readiness score
    const placementByScore = await Feedback.aggregate([
      { $match: { type: 'placement-outcome' } },
      {
        $bucket: {
          groupBy: '$placementOutcome.preSkillReadinessScore',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            placed: { $sum: { $cond: ['$placementOutcome.wasPlaced', 1, 0] } }
          }
        }
      }
    ]);

    // Course effectiveness ranking
    const courseRanking = await Course.find({ isActive: true })
      .select('title effectiveness ratings')
      .sort({ 'effectiveness.placementSuccessRate': -1 })
      .limit(10);

    // Recent model performance
    const modelPerformances = await ModelPerformance.find()
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      placementByScore,
      topCourses: courseRanking,
      modelPerformances
    };
  }
}

module.exports = FeedbackLoopService;
