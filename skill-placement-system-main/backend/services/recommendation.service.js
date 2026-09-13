/**
 * ⭐ UNIQUE FEATURE 2: Personalized Placement Recommendation Engine
 * Recommends suitable jobs, internships, and courses
 * Based on student performance, interests, and application history
 * Powered by Google Gemini
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Course = require('../models/Course');
const Skill = require('../models/Skill');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

class RecommendationService {
  /**
   * Get personalized job recommendations for a user
   */
  static async getJobRecommendations(userId, options = {}) {
    const { limit = 10, includeInternships = true } = options;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const userProfile = {
      skills: user.skills.map(s => s.name),
      interests: (user.interests || []).map(i => i.domain),
      preferredLocations: user.careerPreferences?.preferredLocations || [],
      preferredRoles: user.careerPreferences?.preferredRoles || [],
      studentYear: user.studentProfile?.year || new Date().getFullYear(),
    };

    let jobQuery = { status: 'active', isActive: true };
    if (!includeInternships) {
      jobQuery.jobType = { $ne: 'internship' };
    }

    const jobs = await Job.find(jobQuery).limit(50); // Reduced to 50 to save context tokens

    if (jobs.length === 0) return [];

    const jobsPayload = jobs.map(j => ({
      id: j._id,
      title: j.title,
      requiredSkills: j.skills ? j.skills.map(s => s.name) : [],
      categories: j.categories,
      location: j.location,
      workMode: j.workMode,
      experienceRequired: j.experience?.minimum || 0
    }));

    const prompt = `You are an expert career counselor AI. 
Evaluate the following user profile against the provided jobs. 
Return a JSON array of the top ${limit} best matching jobs.
For each matching job, provide:
- "jobId": The ID of the job.
- "matchScore": A number from 0 to 100 indicating the match quality.
- "matchReason": A short explanation of why this job is a good fit.

User Profile:
${JSON.stringify(userProfile)}

Available Jobs:
${JSON.stringify(jobsPayload)}
`;

    try {
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        jobId: { type: SchemaType.STRING },
                        matchScore: { type: SchemaType.NUMBER },
                        matchReason: { type: SchemaType.STRING },
                    },
                    required: ["jobId", "matchScore", "matchReason"],
                }
            }
        }
      });

      const text = response.response.text();
      const geminiRecs = JSON.parse(text);

      // Map back to original job data
      const recommendations = geminiRecs.map(rec => {
        const job = jobs.find(j => j._id.toString() === rec.jobId);
        if (!job) return null;
        return {
          ...job.toObject(),
          matchScore: rec.matchScore,
          matchReason: rec.matchReason
        };
      }).filter(r => r !== null);

      return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
    } catch (error) {
      console.error("Gemini API Error in getJobRecommendations:", error);
      return [];
    }
  }

  /**
   * Get personalized course recommendations
   */
  static async getCourseRecommendations(userId, options = {}) {
    const { limit = 10 } = options;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const userSkills = user.skills.map(s => ({
      name: s.name,
      level: s.proficiencyLevel
    }));

    const courses = await Course.find({ isActive: true }).limit(50);

    if (courses.length === 0) return [];

    const coursesPayload = courses.map(c => ({
      id: c._id,
      title: c.title,
      skillsTaught: c.skillsTaught.map(s => s.name),
      difficulty: c.difficulty,
      rating: c.ratings?.average
    }));

    const prompt = `You are an expert educational counselor AI.
Evaluate the user's current skills and recommend courses that fill skill gaps and are appropriate for their level.
Return a JSON array of the top ${limit} recommended courses.
For each recommendation, provide:
- "courseId": The ID of the course.
- "matchScore": A number from 0 to 100.
- "matchReason": A short explanation of why this course is recommended for them.

User Current Skills:
${JSON.stringify(userSkills)}

Available Courses:
${JSON.stringify(coursesPayload)}
`;

    try {
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        courseId: { type: SchemaType.STRING },
                        matchScore: { type: SchemaType.NUMBER },
                        matchReason: { type: SchemaType.STRING },
                    },
                    required: ["courseId", "matchScore", "matchReason"],
                }
            }
        }
      });

      const geminiRecs = JSON.parse(response.response.text());

      const recommendations = geminiRecs.map(rec => {
        const course = courses.find(c => c._id.toString() === rec.courseId);
        if (!course) return null;
        return {
          courseId: course._id,
          title: course.title,
          provider: course.provider,
          skillsTaught: course.skillsTaught.map(s => s.name),
          difficulty: course.difficulty,
          duration: course.duration,
          pricing: course.pricing,
          rating: course.ratings?.average,
          matchScore: rec.matchScore,
          matchReason: rec.matchReason
        };
      }).filter(r => r !== null);

      return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
    } catch (error) {
      console.error("Gemini API Error in getCourseRecommendations:", error);
      return [];
    }
  }

  /**
   * Get skill recommendations (what to learn next)
   */
  static async getSkillRecommendations(userId, options = {}) {
    const { limit = 10 } = options;
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const userSkills = user.skills.map(s => s.name);

    const trendingSkills = await Skill.find({ 
      isActive: true,
      'industryDemand.trend': { $in: ['rising', 'stable'] }
    }).sort({ 'industryDemand.score': -1 }).limit(50);

    const skillsPayload = trendingSkills
        .filter(s => !userSkills.includes(s.name))
        .map(s => ({
            id: s._id,
            name: s.name,
            category: s.category,
            demandScore: s.industryDemand?.score,
            trend: s.industryDemand?.trend
        }));

    const prompt = `You are an expert career counselor AI.
Recommend the top ${limit} skills this user should learn next, considering their current skills and the provided trending skills.
Return a JSON array where each object has:
- "skillId": The ID of the skill.
- "score": A number from 0 to 100.
- "reason": A short reason why they should learn it.

User Current Skills:
${JSON.stringify(userSkills)}

Trending/Available Skills:
${JSON.stringify(skillsPayload)}
`;

    try {
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.ARRAY,
                items: {
                    type: SchemaType.OBJECT,
                    properties: {
                        skillId: { type: SchemaType.STRING },
                        score: { type: SchemaType.NUMBER },
                        reason: { type: SchemaType.STRING },
                    },
                    required: ["skillId", "score", "reason"],
                }
            }
        }
      });

      const geminiRecs = JSON.parse(response.response.text());

      const recommendations = geminiRecs.map(rec => {
        const skill = trendingSkills.find(s => s._id.toString() === rec.skillId);
        if (!skill) return null;
        return {
          skillId: skill._id,
          name: skill.name,
          category: skill.category,
          demandScore: skill.industryDemand?.score,
          trend: skill.industryDemand?.trend,
          score: rec.score,
          reason: rec.reason
        };
      }).filter(r => r !== null);

      return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
        console.error("Gemini API Error in getSkillRecommendations:", error);
        return [];
    }
  }
}

module.exports = RecommendationService;
