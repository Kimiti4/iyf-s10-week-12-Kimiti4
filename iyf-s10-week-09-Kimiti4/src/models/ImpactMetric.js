/**
 * 📊 Impact Meter Model - Track community contributions
 */

// Mock data structure for impact tracking
const ImpactMetric = {
  id: 'impact_1',
  userId: 'user_123',
  eventType: 'request_fulfilled', // help/money/time
  impactValue: 5, // 1-10 multiplier
  referenceId: 'post_456',
  description: 'Helped neighbor with farming tips',
  timestamp: Date.now()
}

const UserImpactScore = {
  userId: 'user_123',
  totalImpact: 247,
  helpingOthers: 120,
  exchangeValue: 5200,
  timeSaved: 42,
  peopleHelped: 23,
  lastUpdated: Date.now()
}

// Impact categories
export const IMPACT_CATEGORIES = {
  HELP_PROVIDED: { emoji: '🤝', label: 'Helping Others', value: 1 },
  EXCHANGE_MONEY: { emoji: '💰', label: 'Value Exchanged', value: 2 },
  TIME_SAVED: { emoji: '⏰', label: 'Time Saved', value: 1.5 },
  REQUEST_FULFILLED: { emoji: '✅', label: 'Requests Fulfilled', value: 3 },
  EVENT_HOSTED: { emoji: '🎪', label: 'Events Hosted', value: 4 },
  MENTORSHIP_HOUR: { emoji: '👨‍🏫', label: 'Mentorship Hours', value: 2 }
}

// Mock impact data for development
export const mockImpacts = [
  { id: 1, type: 'help', description: 'Answered community question', points: 5 },
  { id: 2, type: 'money', description: 'Sold farm produce', points: 10 },
  { id: 3, type: 'time', description: 'Connected two neighbors', points: 3 },
  { id: 4, type: 'help', description: 'Volunteered skills', points: 8 }
]

export const getUserImpact = (userId) => ({
  monthlyImpact: 247,
  impactRank: '#12 in Nairobi',
  badges: ['bronze', 'silver'],
  breakdown: {
    helpProvided: 120,
    exchangeValue: 5200,
    timeSaved: 42,
    peopleHelped: 23
  }
})

export default {
  ImpactMetric,
  UserImpactScore,
  IMPACT_CATEGORIES,
  mockImpacts,
  getUserImpact
}