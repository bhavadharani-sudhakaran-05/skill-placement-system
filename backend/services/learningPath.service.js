/**
 * ⭐ UNIQUE FEATURE 5: Adaptive Learning Path Generator
 * Creates personalized learning paths based on skill gaps
 * Orders topics from beginner to advanced
 */

const User = require('../models/User');
const Skill = require('../models/Skill');
const Course = require('../models/Course');
const LearningPath = require('../models/LearningPath');
const SkillGapService = require('./skillGap.service');
const RecommendationService = require('./recommendation.service');

class LearningPathService {
  /**
   * Generate personalized learning path for a user
   */
  static async generatePersonalizedPath(userId, targetRole) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Get user's current skills
    const currentSkills = user.skills.map(s => ({
      name: s.name,
      level: s.proficiencyLevel,
      score: s.proficiencyScore
    }));

    // Get required skills for target role
    const targetSkills = await this.getSkillsForRole(targetRole);

    // Analyze skill gap
    const skillGap = this.analyzeSkillGap(currentSkills, targetSkills);

    // Get relevant courses
    const courses = await Course.find({ isActive: true });

    // Build learning stages
    const stages = await this.buildLearningStages(skillGap, courses, currentSkills);

    // Create learning path
    const learningPath = new LearningPath({
      title: `${targetRole} Learning Path for ${user.name}`,
      description: `Personalized learning path to become a ${targetRole}`,
      targetRole,
      targetSkills: targetSkills.map(s => ({
        name: s.name,
        targetProficiency: s.requiredLevel
      })),
      userId: user._id,
      isPersonalized: true,
      skillGapAnalysis: {
        currentSkills: currentSkills.map(s => ({
          name: s.name,
          currentLevel: s.level
        })),
        missingSkills: skillGap.missing.map(s => ({
          name: s.name,
          importance: s.importance
        })),
        gapScore: skillGap.gapScore
      },
      stages,
      totalDuration: stages.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0),
      totalModules: stages.reduce((sum, s) => sum + (s.modules?.length || 0), 0),
      difficulty: {
        starting: stages[0]?.difficulty || 'beginner',
        ending: stages[stages.length - 1]?.difficulty || 'advanced'
      },
      adaptiveRules: this.generateAdaptiveRules(stages),
      category: targetRole,
      isPublic: false
    });

    await learningPath.save();

    // Update user's active learning path
    user.activeLearningPath = {
      pathId: learningPath._id,
      startedAt: new Date(),
      currentStage: 0,
      completedModules: [],
      estimatedCompletionDate: new Date(Date.now() + learningPath.totalDuration * 60 * 60 * 1000)
    };
    await user.save();

    return learningPath;
  }

  /**
   * Get skills required for a specific role
   */
  static async getSkillsForRole(role) {
    // Role to skills mapping
    const roleSkillsMap = {
      'frontend-developer': [
        { name: 'HTML', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'CSS', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'JavaScript', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'React', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'TypeScript', requiredLevel: 'intermediate', importance: 'nice-to-have' },
        { name: 'Git', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Responsive Design', requiredLevel: 'intermediate', importance: 'must-have' }
      ],
      'backend-developer': [
        { name: 'Node.js', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'Python', requiredLevel: 'intermediate', importance: 'nice-to-have' },
        { name: 'SQL', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'MongoDB', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'REST API', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'Git', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Docker', requiredLevel: 'beginner', importance: 'nice-to-have' }
      ],
      'full-stack-developer': [
        { name: 'JavaScript', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'React', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Node.js', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'MongoDB', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'SQL', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Git', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Docker', requiredLevel: 'beginner', importance: 'nice-to-have' }
      ],
      'data-scientist': [
        { name: 'Python', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'Machine Learning', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'SQL', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Pandas', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'Statistics', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'TensorFlow', requiredLevel: 'beginner', importance: 'nice-to-have' }
      ],
      'devops-engineer': [
        { name: 'Linux', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'Docker', requiredLevel: 'advanced', importance: 'must-have' },
        { name: 'Kubernetes', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'AWS', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'CI/CD', requiredLevel: 'intermediate', importance: 'must-have' },
        { name: 'Python', requiredLevel: 'intermediate', importance: 'nice-to-have' }
      ]
    };

    return roleSkillsMap[role.toLowerCase()] || roleSkillsMap['full-stack-developer'];
  }

  /**
   * Analyze skill gap between current and target skills
   */
  static analyzeSkillGap(currentSkills, targetSkills) {
    const levels = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
    
    const result = {
      matching: [],
      partial: [],
      missing: [],
      gapScore: 0
    };

    let totalWeight = 0;
    let achievedWeight = 0;

    for (const target of targetSkills) {
      const current = currentSkills.find(s => 
        s.name.toLowerCase() === target.name.toLowerCase()
      );
      
      const weight = target.importance === 'must-have' ? 2 : 1;
      totalWeight += weight;

      if (current) {
        const currentLevel = levels[current.level] || 1;
        const requiredLevel = levels[target.requiredLevel] || 2;

        if (currentLevel >= requiredLevel) {
          result.matching.push({ ...target, currentLevel: current.level });
          achievedWeight += weight;
        } else {
          result.partial.push({
            ...target,
            currentLevel: current.level,
            gapLevels: requiredLevel - currentLevel
          });
          achievedWeight += weight * (currentLevel / requiredLevel);
        }
      } else {
        result.missing.push(target);
      }
    }

    result.gapScore = Math.round((1 - achievedWeight / totalWeight) * 100);

    return result;
  }

  /**
   * Build learning stages from beginner to advanced
   */
  static async buildLearningStages(skillGap, courses, currentSkills) {
    const stages = [];

    // Stage 1: Foundation (Beginner)
    const beginnerSkills = [
      ...skillGap.missing.filter(s => s.importance === 'must-have'),
      ...skillGap.partial.filter(s => s.gapLevels >= 2)
    ].slice(0, 3);

    if (beginnerSkills.length > 0) {
      stages.push(await this.createStage(
        1,
        'Foundation',
        'beginner',
        beginnerSkills,
        courses
      ));
    }

    // Stage 2: Core Skills (Intermediate)
    const intermediateSkills = [
      ...skillGap.missing.filter(s => s.importance === 'nice-to-have'),
      ...skillGap.partial.filter(s => s.gapLevels === 1)
    ].slice(0, 4);

    if (intermediateSkills.length > 0) {
      stages.push(await this.createStage(
        2,
        'Core Development',
        'intermediate',
        intermediateSkills,
        courses
      ));
    }

    // Stage 3: Advanced (Advanced)
    const advancedSkills = skillGap.partial.filter(s => 
      s.requiredLevel === 'advanced' || s.requiredLevel === 'expert'
    ).slice(0, 3);

    if (advancedSkills.length > 0 || stages.length < 2) {
      stages.push(await this.createStage(
        3,
        'Advanced Mastery',
        'advanced',
        advancedSkills.length > 0 ? advancedSkills : beginnerSkills,
        courses
      ));
    }

    return stages;
  }

  /**
   * Create a learning stage with modules
   */
  static async createStage(order, title, difficulty, skills, courses) {
    const modules = [];
    let totalDuration = 0;

    for (const skill of skills) {
      // Find matching course
      const matchingCourse = courses.find(c => 
        (c.skills || c.skillsTaught || []).some(s => 
          s.name.toLowerCase().includes(skill.name.toLowerCase()) ||
          skill.name.toLowerCase().includes(s.name.toLowerCase())
        ) && (c.level || c.difficulty) === difficulty
      ) || courses.find(c =>
        (c.skills || c.skillsTaught || []).some(s => 
          s.name.toLowerCase().includes(skill.name.toLowerCase())
        )
      );

      if (matchingCourse) {
        modules.push({
          order: modules.length + 1,
          type: 'course',
          referenceId: matchingCourse._id,
          title: matchingCourse.title,
          description: matchingCourse.shortDescription || matchingCourse.description?.substring(0, 200),
          duration: matchingCourse.duration?.total || 10,
          isOptional: skill.importance !== 'must-have',
          skillsCovered: [{ name: skill.name, proficiencyGain: 25 }],
          completionCriteria: {
            type: 'completion',
            minimumScore: 70
          }
        });
        totalDuration += matchingCourse.duration?.total || 10;
      }

      // Add practice project
      modules.push({
        order: modules.length + 1,
        type: 'project',
        title: `${skill.name} Practice Project`,
        description: `Build a practical project using ${skill.name}`,
        duration: 5,
        isOptional: false,
        skillsCovered: [{ name: skill.name, proficiencyGain: 15 }],
        completionCriteria: {
          type: 'project-submission'
        }
      });
      totalDuration += 5;
    }

    return {
      order,
      title,
      description: `${title} - ${difficulty} level modules`,
      difficulty,
      estimatedDuration: totalDuration,
      modules,
      milestone: {
        badge: `${difficulty}-${order}`,
        skillsUnlocked: skills.map(s => s.name)
      }
    };
  }

  /**
   * Generate adaptive rules for the learning path
   */
  static generateAdaptiveRules(stages) {
    return [
      {
        condition: 'score < 50',
        action: 'recommend_additional_resources',
        additionalResources: [
          { title: 'Review fundamentals', type: 'article' },
          { title: 'Practice exercises', type: 'practice' }
        ]
      },
      {
        condition: 'score > 90',
        action: 'skip_to_next_stage'
      },
      {
        condition: 'attempts > 3 && score < 60',
        action: 'suggest_mentor_help'
      }
    ];
  }

  /**
   * Update progress on learning path
   */
  static async updateProgress(userId, moduleId, score) {
    const user = await User.findById(userId);
    if (!user?.activeLearningPath?.pathId) {
      throw new Error('No active learning path found');
    }

    const path = await LearningPath.findById(user.activeLearningPath.pathId);
    if (!path) throw new Error('Learning path not found');

    // Add to completed modules
    if (!user.activeLearningPath.completedModules.includes(moduleId)) {
      user.activeLearningPath.completedModules.push(moduleId);
    }

    // Check if current stage is complete
    const currentStage = path.stages[user.activeLearningPath.currentStage];
    const stageModuleIds = currentStage.modules.map(m => m._id?.toString());
    const completedInStage = user.activeLearningPath.completedModules
      .filter(m => stageModuleIds.includes(m.toString())).length;

    if (completedInStage >= currentStage.modules.length) {
      // Move to next stage
      user.activeLearningPath.currentStage++;
    }

    // Update skill readiness score
    await user.updateSkillReadinessScore();
    await user.save();

    return {
      currentStage: user.activeLearningPath.currentStage,
      completedModules: user.activeLearningPath.completedModules.length,
      totalModules: path.totalModules,
      progress: Math.round((user.activeLearningPath.completedModules.length / path.totalModules) * 100)
    };
  }

  /**
   * Get available learning path templates
   */
  static async getTemplates() {
    const templates = await LearningPath.find({ isPublic: true, isActive: true })
      .select('title targetRole description totalDuration totalModules difficulty successMetrics')
      .sort({ 'successMetrics.completions': -1 })
      .limit(10);

    return templates;
  }
}

module.exports = LearningPathService;
