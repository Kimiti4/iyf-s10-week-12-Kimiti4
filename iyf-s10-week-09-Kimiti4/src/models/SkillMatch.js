/**
 * 🎯 Skill Matching Model - Smart Skill Barter
 */

// Skill categories for JamiiLink
export const SKILL_CATEGORIES = [
  { id: 'dev', label: 'Development', emoji: '💻' },
  { id: 'design', label: 'Design', emoji: '🎨' },
  { id: 'farm', label: 'Farming', emoji: '🌱' },
  { id: 'tutor', label: 'Tutoring', emoji: '📚' },
  { id: 'craft', label: 'Crafts', emoji: '🛠️' },
  { id: 'biz', label: 'Business', emoji: '📈' },
  { id: 'health', label: 'Healthcare', emoji: '🏥' }
]

// Mock skill profiles
export const mockSkillProfiles = [
  {
    userId: '1',
    offering: [
      { skill: 'React Development', proficiency: 5, category: 'dev' }
    ],
    seeking: [
      { skill: 'Graphic Design', proficiency: 2, category: 'design' }
    ],
    matchScore: 0.89,
    testimonials: 3
  },
  {
    userId: '2',
    offering: [
      { skill: 'Mobile App Dev', proficiency: 4, category: 'dev' }
    ],
    seeking: [
      { skill: 'UI/UX Design', proficiency: 3, category: 'design' }
    ],
    matchScore: 0.75,
    testimonials: 5
  }
]

// Get skill matches for a user
export const getSkillMatches = async (userId) => {
  // In production: query database for complementary skills
  return mockSkillProfiles
}

// Create skill profile
export const createSkillProfile = async (profile) => {
  // In production: save to database
  return { success: true, profile }
}

// Complete a skill exchange with review
export const completeExchange = async (matchId, rating, testimonial) => {
  // In production: update match status and add review
  return { success: true }
}

export default {
  SKILL_CATEGORIES,
  mockSkillProfiles,
  getSkillMatches,
  createSkillProfile,
  completeExchange
}