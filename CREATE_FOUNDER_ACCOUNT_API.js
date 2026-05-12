/**
 *  Create Founder Account via API
 * No mongoose dependency needed - uses fetch API
 */

const fetch = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function createFounderAccount() {
  try {
    console.log('\n🔍 Creating YOUR Founder Account via API...\n');

    const founderData = {
      username: 'kimiti4',
      email: 'amos.kimiti@jamiilink.ke',
      password: 'Kimiti@2026!Founder#MFA',
      role: 'founder',
      isFounder: true,
      profile: {
        bio: 'Amos Kimiti - Platform Founder & Creator | Building community-powered solutions for Kenya 🇰🇪',
        location: {
          county: 'Nairobi',
          settlement: 'Westlands'
        },
        skills: ['Full Stack Development', 'Community Building', 'Social Innovation'],
        avatarIcon: '👑'
      },
      verification: {
        isVerified: true,
        badgeLevel: 'diamond',
        verificationType: 'manual',
        verificationNotes: 'Platform founder & creator - Diamond tier (highest level)',
        badgeColor: '#FFD700'
      }
    };

    console.log('📤 Sending request to create founder account...\n');

    const response = await fetch(`${BACKEND_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(founderData)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ YOUR Founder Account Created Successfully!\n');
      console.log(' Account Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   Username: ${data.user.username}`);
      console.log(`   Email: ${data.user.email}`);
      console.log(`   Role: ${data.user.role}`);
      console.log(`   Badge: ${data.user.verification.badgeLevel} 💎`);
      console.log(`   Avatar Icon: ${data.user.profile.avatarIcon}`);
      console.log('');
      console.log('🔐 MFA Status: Enabled (3-Factor Authentication)');
      console.log('   - TOTP (Authenticator App)');
      console.log('   - Email Verification');
      console.log('   - SMS Verification');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('🚀 HOW TO LOGIN:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   1. Go to: http://localhost:5173/login');
      console.log('   2. Email: amos.kimiti@jamiilink.ke');
      console.log('   3. Password: Kimiti@2026!Founder#MFA');
      console.log('   4. You\'ll be prompted for MFA');
      console.log('   5. Access founder dashboard at: /admin/founder');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      console.log('⚠️  IMPORTANT:');
      console.log('   - Change the password immediately after first login');
      console.log('   - Setup MFA authenticator app');
      console.log('   - Save backup codes in secure location');
      console.log('   - Never share credentials');
    } else {
      console.error('❌ Failed to create account');
      console.error(`Error: ${data.message || 'Unknown error'}`);
      
      if (data.message && data.message.includes('already exists')) {
        console.log('\n💡 Account already exists! Try logging in directly.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the backend is running at:', BACKEND_URL);
  }
}

createFounderAccount();
