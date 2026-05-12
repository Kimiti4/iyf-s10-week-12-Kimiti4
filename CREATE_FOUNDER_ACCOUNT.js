/**
 * 🔹 Create Founder Account with Heavy MFA
 * Run this ONCE to create the platform founder/creator account
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

// ===== Configuration =====
const FOUNDER_CONFIG = {
  username: 'JamiiLinkFounder',
  email: 'founder@jamiilink.ke',
  password: 'Founder@2026!Secure#MFA',  // CHANGE THIS BEFORE PRODUCTION
  role: 'founder',
  isFounder: true,
  profile: {
    bio: 'Platform Creator & Founder | Building community-powered solutions for Kenya 🇰🇪',
    location: {
      county: 'Nairobi',
      settlement: 'Westlands'
    },
    skills: ['Community Building', 'Technology', 'Social Impact'],
    avatarIcon: '🦁'  // Lion - symbol of leadership
  },
  verification: {
    isVerified: true,
    badgeLevel: 'diamond',
    verificationType: 'manual',
    verifiedAt: new Date(),
    verificationNotes: 'Platform founder - Diamond tier (highest level)',
    badgeColor: '#FFD700'
  }
};

// ===== Helper Functions =====

/**
 * Generate TOTP secret for authenticator apps
 */
function generateTOTPSecret() {
  return crypto.randomBytes(32).toString('base32');
}

/**
 * Generate backup codes for account recovery
 */
function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Create heavy MFA configuration for founder
 */
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
        email: FOUNDER_CONFIG.email,
        backupCodes: generateBackupCodes(5),
        addedAt: new Date()
      },
      {
        type: 'sms',
        verified: false,  // Add phone number manually
        primary: false,
        backupCodes: generateBackupCodes(5),
        addedAt: new Date()
      }
    ],
    requireAllMethods: true,  // Founder MUST use all methods
    lastVerified: new Date(),
    failedAttempts: 0
  };
}

// ===== Main Script =====

async function createFounderAccount() {
  try {
    console.log('\n🔍 Checking for existing founder account...\n');
    
    // Check if founder already exists
    const existingFounder = await User.findOne({ 
      $or: [
        { email: FOUNDER_CONFIG.email },
        { username: FOUNDER_CONFIG.username },
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
    
    console.log('✨ Creating founder account...\n');
    
    // Setup heavy MFA
    const mfaConfig = setupHeavyMFA();
    
    // Create founder user
    const founder = await User.create({
      ...FOUNDER_CONFIG,
      mfa: mfaConfig
    });
    
    console.log('✅ Founder account created successfully!\n');
    console.log('📋 Account Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Username: ${founder.username}`);
    console.log(`   Email: ${founder.email}`);
    console.log(`   Role: ${founder.role}`);
    console.log(`   Badge: ${founder.verification.badgeLevel} 💎`);
    console.log(`   Avatar Icon: ${founder.profile.avatarIcon}`);
    console.log('');
    console.log('🔐 MFA Configuration:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   MFA Enabled: ${founder.mfa.enabled ? 'YES ✓' : 'NO ✗'}`);
    console.log(`   Methods Configured: ${founder.mfa.methods.length}`);
    console.log(`   Require All Methods: ${founder.mfa.requireAllMethods ? 'YES' : 'NO'}`);
    console.log('');
    console.log('   Method 1: TOTP (Authenticator App) - PRIMARY');
    console.log(`   Secret: ${founder.mfa.methods[0].secret}`);
    console.log('   Backup Codes:');
    founder.mfa.methods[0].backupCodes.forEach((code, idx) => {
      console.log(`     ${idx + 1}. ${code}`);
    });
    console.log('');
    console.log('   Method 2: Email Verification');
    console.log(`   Email: ${founder.mfa.methods[1].email}`);
    console.log('');
    console.log('   Method 3: SMS (Add phone number in settings)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  IMPORTANT SECURITY NOTES:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   1. Save these backup codes in a secure location');
    console.log('   2. Scan the TOTP secret with Google Authenticator/Authy');
    console.log('   3. Change the default password immediately');
    console.log('   4. Add your phone number for SMS verification');
    console.log('   5. Consider adding hardware key (YubiKey) for extra security');
    console.log('   6. Never share these credentials with anyone');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await mongoose.disconnect();
    console.log('✅ Done! Founder account is ready.\n');
    
  } catch (error) {
    console.error('❌ Error creating founder account:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run the script
createFounderAccount();
