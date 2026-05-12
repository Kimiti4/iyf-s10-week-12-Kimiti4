/**
 * Create Founder Account in MongoDB
 * Since backend uses MongoDB, we need to create the account there
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const FOUNDER_DATA = {
  username: 'Snooz3',
  email: 'kimiti.kariuki75@gmail.com',
  password: '#gunzNroz3z_6G1GWY#',
  role: 'founder',
  isFounder: true,
  profile: {
    bio: 'Snoz# - Platform Founder & Creator | Building community-powered solutions for Kenya 🇰🇪',
    location: {
      county: 'Nairobi',
      settlement: 'Westlands'
    },
    skills: ['Full Stack Development', 'Community Building', 'Social Innovation', 'Mobile Apps'],
    avatarIcon: '👑'
  },
  verification: {
    isVerified: true,
    badgeLevel: 'diamond',
    verificationType: 'manual',
    verifiedAt: new Date(),
    verificationNotes: 'Platform founder & creator - Diamond tier (highest level)',
    badgeColor: '#FFD700'
  }
};

async function createFounderInMongoDB() {
  try {
    console.log('\n Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import User model
    const User = require('./src/models/User');

    // Check if user already exists
    const existingUser = await User.findOne({ email: FOUNDER_DATA.email });
    if (existingUser) {
      console.log('ℹ️  User already exists!');
      console.log('\n📋 Account Details:');
      console.log('   Username:', existingUser.username);
      console.log('   Email:', existingUser.email);
      console.log('   Role:', existingUser.role);
      console.log('   Is Founder:', existingUser.isFounder);
      console.log('\n🚀 LOGIN:');
      console.log('   URL: http://localhost:5174/login');
      console.log('   Email:', FOUNDER_DATA.email);
      console.log('   Password:', FOUNDER_DATA.password);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(FOUNDER_DATA.password, salt);
    console.log('✅ Password hashed\n');

    // Create user
    console.log('📝 Creating founder account...');
    const user = new User({
      username: FOUNDER_DATA.username,
      email: FOUNDER_DATA.email,
      password: hashedPassword,
      role: FOUNDER_DATA.role,
      isFounder: FOUNDER_DATA.isFounder,
      profile: FOUNDER_DATA.profile,
      verification: FOUNDER_DATA.verification,
      createdAt: new Date()
    });

    await user.save();
    console.log('\n✅ Founder Account Created Successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Account Details:');
    console.log('   ID:', user._id);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Is Founder:', user.isFounder);
    console.log('\n Profile Features:');
    console.log('   Avatar Icon:', user.profile.avatarIcon);
    console.log('   Badge Level:', user.verification.badgeLevel, '💎');
    console.log('   Badge Color:', user.verification.badgeColor);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🚀 HOW TO LOGIN:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Frontend is running at: http://localhost:5174');
    console.log('   2. Go to: http://localhost:5174/login');
    console.log('   3. Email:', FOUNDER_DATA.email);
    console.log('   4. Password:', FOUNDER_DATA.password);
    console.log('   5. Click "👑 Founder" button in navbar');
    console.log('   6. Access dashboard at: /admin/founder');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   - Change password immediately after first login');
    console.log('   - Save credentials in secure location');
    console.log('   - Never share credentials with anyone');
    console.log('\n🔌 Database connection closed.\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createFounderInMongoDB();
