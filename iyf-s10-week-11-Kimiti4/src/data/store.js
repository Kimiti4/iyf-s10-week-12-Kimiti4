/**
 * 🔹 In-Memory Data Store
 * Structured for easy MongoDB migration
 * Supports: Mtaani + Skills + Farm + Gigs
 */

// Unified posts (core content)
const posts = [
  {
    id: 1,
    category: 'mtaani',
    title: 'Water Interruption in Soweto Zone 3',
    content: 'Water will be off tomorrow 8AM-4PM for pipe repairs.',
    author: 'Kibera Chief Office',
    location: { settlement: 'kibera', zone: 'soweto-zone-3', county: 'Nairobi' },
    urgency: 'high',
    tags: ['water', 'alert', 'soweto'],
    metadata: { affectedHouseholds: 200, alternativeSource: 'Borehole near market' },
    createdAt: '2026-04-20T08:00:00Z',
    likes: 24,
    upvotes: 18
  },
  {
    id: 2,
    category: 'skill',
    title: 'React Developer offering 2-hour tutorial',
    content: 'I can teach React basics in exchange for phone repair help.',
    author: 'Alice Wanjiku',
    location: { settlement: 'mathare', county: 'Nairobi' },
    tags: ['react', 'webdev', 'tutorial'],
    metadata: { offeredSkill: 'React Development', offeredHours: 2, requestedSkill: 'Phone Repair' },
    createdAt: '2026-04-19T14:00:00Z',
    likes: 15,
    exchanges: 3
  },
  {
    id: 3,
    category: 'farm',
    title: 'Fresh Tomatoes - Kiambu Farm',
    content: '100kg hybrid tomatoes ready for harvest. Fair price, direct from farm.',
    author: 'John Kamau',
    location: { county: 'Kiambu', ward: 'Githurai', coordinates: [-1.2921, 36.8219] },
    tags: ['tomatoes', 'organic', 'wholesale'],
    metadata: { crop: 'Tomatoes', variety: 'Hybrid', quantity: 100, unit: 'kg', pricePerUnit: 50, harvestDate: '2026-04-25' },
    createdAt: '2026-04-18T10:00:00Z',
    likes: 31,
    views: 120
  },
  {
    id: 4,
    category: 'gig',
    title: 'Need Fundi for Kitchen Cabinets - Urgent',
    content: 'Looking for carpenter to install cabinets in Githurai. Pay: KES 3,000.',
    author: 'Mary Achieng',
    location: { county: 'Nairobi', ward: 'Githurai' },
    tags: ['carpentry', 'urgent', 'githurai'],
    metadata: { gigType: 'Carpentry', budget: 3000, currency: 'KES', deadline: '2026-04-22' },
    createdAt: '2026-04-21T09:00:00Z',
    likes: 8,
    applicants: 5
  }
];

// Users (with skills/farm profiles)
const users = [
  {
    id: 1,
    name: 'Alice Wanjiku',
    email: 'alice@example.com',
    role: 'member',
    skills: ['React Development', 'Graphic Design'],
    farmProfile: null,
    location: { county: 'Nairobi', settlement: 'mathare' },
    rating: 4.8,
    completedExchanges: 12
  },
  {
    id: 2,
    name: 'John Kamau',
    email: 'john@example.com',
    role: 'farmer',
    skills: [],
    farmProfile: {
      farmName: 'Kamau Organic Farm',
      county: 'Kiambu',
      crops: ['Tomatoes', 'Kale', 'Onions'],
      certification: 'Organic'
    },
    location: { county: 'Kiambu', ward: 'Githurai' },
    rating: 4.9,
    totalSales: 45
  }
];

// Market prices (for FarmLink price transparency)
const marketPrices = [
  { crop: 'Tomatoes', county: 'Nairobi', pricePerKg: 80, source: 'City Market', updatedAt: '2026-04-21T06:00:00Z' },
  { crop: 'Tomatoes', county: 'Kiambu', pricePerKg: 50, source: 'Farm Gate', updatedAt: '2026-04-21T06:00:00Z' },
  { crop: 'Kale', county: 'Nairobi', pricePerKg: 30, source: 'City Market', updatedAt: '2026-04-21T06:00:00Z' },
  { crop: 'Kale', county: 'Kiambu', pricePerKg: 15, source: 'Farm Gate', updatedAt: '2026-04-21T06:00:00Z' }
];

// Locations (for geo-filtering)
const locations = {
  settlements: [
    { id: 'kibera', name: 'Kibera', county: 'Nairobi', zones: ['soweto-zone-1', 'soweto-zone-2', 'soweto-zone-3', 'lindi'] },
    { id: 'mathare', name: 'Mathare', county: 'Nairobi', zones: ['mathare-4a', 'mathare-3b'] },
    { id: 'mukuru', name: 'Mukuru', county: 'Nairobi', zones: ['kwa-reuben', 'kwa-njenga'] }
  ],
  counties: ['Nairobi', 'Kiambu', 'Machakos', 'Kajiado', 'Murang\'a']
};

// Counters for ID generation
let nextPostId = 5;
let nextUserId = 3;

// Comments for Daily Challenge Day 5
const comments = [
  { id: 1, postId: 1, content: 'Will the borehole water be safe?', author: 'Resident1', createdAt: '2026-04-20T08:30:00Z' },
  { id: 2, postId: 1, content: 'Yes, it is treated', author: 'Kibera Chief Office', createdAt: '2026-04-20T08:35:00Z' }
];

module.exports = {
  posts,
  users,
  marketPrices,
  locations,
  comments,
  nextPostId: () => nextPostId++,
  nextUserId: () => nextUserId++
};
