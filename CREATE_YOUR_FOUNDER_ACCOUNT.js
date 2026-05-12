/**
 *  Create YOUR Founder Account
 * Personalized founder account setup
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jamiilink')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const User = require('./src/models/User');

// ===== YOUR Configuration =====
const YOUR_FOUNDER_CONFIG = {
  username: 'kimiti4',  // Your GitHub username
  email: 'amos.kimiti@jamiilink.ke',  // YOUR email
  password: 'Kimiti@2026!Founder#MFA',  // CHANGE THIS!
  role: 'founder',
  isFounder: true,
  profile: {
    bio: 'Amos Kimiti - Platform Founder & Creator | Building community-powered solutions for Kenya 🇰🇪 | Full Stack Developer',
    location: {
      county: 'Nairobi',
      settlement: 'Your Location'
    },
    skills: ['Full Stack Development', 'Community Building', 'Social Innovation', 'Mobile Apps'],
    avatarIcon: '👑'  // Crown - for founder
  },
  verification: {
    isVerified: true,
    badgeLevel: 'diamond',
    verificationType: 'manual',
    verifiedAt: new Date(),
    verificationNotes: 'Platform founder & creator - Diamond tier (highest level)',
    badgeColor: '#FFD700'  // Gold color for founder
  }
};

// ===== Helper Functions =====

function generateTOTPSecret() {
  return crypto.randomBytes(32).toString('base32');
}

function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

function setupHeavyMFA() {
  const totpSecret = generateTOTPSecret();
  const backupCodes = generateBackupCodes(10);
  
  return {
    enabled: true,
    methods: [
      {
        type: 'totp',
        verified: true,
        primary: true,
        secret: totpSecret,
        backupCodes: backupCodes,
        addedAt: new Date()
      },
      {
        type: 'email',
        verified: true,
        primary: false,
        email: YOUR_FOUNDER_CONFIG.email,
        backupCodes: generateBackupCodes(5),
        addedAt: new Date()
      },
      {
        type: 'sms',
        verified: false,
        primary: false,
        backupCodes: generateBackupCodes(5),
        addedAt: new Date()
      }
    ],
    requireAllMethods: true,
    lastVerified: new Date(),
    failedAttempts: 0
  };
}

async function createFounderAccount() {
  try {
    console.log('\n🔍 Checking for existing founder account...\n');
    
    const existingFounder = await User.findOne({ 
      $or: [
        { email: YOUR_FOUNDER_CONFIG.email },
        { username: YOUR_FOUNDER_CONFIG.username },
        { isFounder: true }
      ]
    });
    
    if (existingFounder) {
      console.log('⚠️  Founder account already exists!');
      console.log(`   Email: ${existingFounder.email}`);
      console.log(`   Username: ${existingFounder.username}`);
      console.log(`   Created: ${existingFounder.createdAt}`);
      console.log('\n💡 To reset, delete the account first or use a different email.\n');
      await mongoose.disconnect();
      return;
    }
    
    console.log('✨ Creating YOUR founder account...\n');
    
    const mfaConfig = setupHeavyMFA();
    
    const founder = await User.create({
      ...YOUR_FOUNDER_CONFIG,
      mfa: mfaConfig
    });
    
    console.log('\n✅ YOUR Founder Account Created Successfully!\n');
    console.log('📋 YOUR Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Username: ${founder.username}`);
    console.log(`   Email: ${founder.email}`);
    console.log(`   Role: ${founder.role}`);
    console.log(`   Badge: ${founder.verification.badgeLevel} 💎`);
    console.log(`   Avatar Icon: ${founder.profile.avatarIcon}`);
    console.log('');
    console.log('🔐 YOUR MFA Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   MFA Enabled: ${founder.mfa.enabled ? 'YES ✓' : 'NO ✗'}`);
    console.log(`   Methods Configured: ${founder.mfa.methods.length}`);
    console.log(`   Require All Methods: ${founder.mfa.requireAllMethods ? 'YES' : 'NO'}`);
    console.log('');
    console.log('   📱 Method 1: TOTP (Authenticator App) - PRIMARY');
    console.log(`   Secret: ${founder.mfa.methods[0].secret}`);
    console.log('   Backup Codes:');
    founder.mfa.methods[0].backupCodes.forEach((code, idx) => {
      console.log(`     ${idx + 1}. ${code}`);
    });
    console.log('');
    console.log('   📧 Method 2: Email Verification');
    console.log(`   Email: ${founder.mfa.methods[1].email}`);
    console.log('');
    console.log('   📲 Method 3: SMS (Add phone number in settings)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('️  YOUR SECURITY CHECKLIST:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. ✅ Save these backup codes in a secure location');
    console.log('   2. ✅ Scan the TOTP secret with Google Authenticator/Authy');
    console.log('   3. ✅ Change the default password immediately');
    console.log('   4. ✅ Add your phone number for SMS verification');
    console.log('   5. ✅ Consider adding hardware key (YubiKey) for extra security');
    console.log('   6. ✅ Never share these credentials with anyone');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('🚀 HOW TO LOGIN AS FOUNDER:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Go to: http://localhost:5173/login');
    console.log('   2. Enter your email and password');
    console.log('   3. You\'ll be prompted for MFA verification');
    console.log('   4. Use Google Authenticator or backup codes');
    console.log('   5. Access founder dashboard at: /admin/founder');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await mongoose.disconnect();
    console.log('✅ Done! YOUR founder account is ready.\n');
    
  } catch (error) {
    console.error('❌ Error creating founder account:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createFounderAccount();
