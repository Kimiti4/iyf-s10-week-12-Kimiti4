/**
 *  Create Founder Account via API
 * Uses native fetch (Node 18+)
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function createFounderAccount() {
  try {
    console.log('\n🔍 Creating YOUR Founder Account via API...\n');

    const founderData = {
      username: 'kimiti4',
      email: 'amos.kimiti@jamiilink.ke',
      password: 'Kimiti@2026!Founder#MFA',
      profile: {
        bio: 'Amos Kimiti - Platform Founder & Creator | Building community-powered solutions for Kenya 🇰🇪',
        location: {
          county: 'Nairobi',
          settlement: 'Westlands'
        },
        skills: ['Full Stack Development', 'Community Building', 'Social Innovation'],
        avatarIcon: '👑'
      }
    };

    console.log('📤 Sending request to create founder account...\n');

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
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
      console.log(`   Role: ${data.user.role || 'user'}`);
      console.log(`   Badge: pending upgrade to diamond 💎`);
      console.log(`   Avatar Icon: ${data.user.profile.avatarIcon}`);
      console.log('');
      console.log('⚠️  NEXT STEPS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   Your account has been created!');
      console.log('   To upgrade to FOUNDER status:');
      console.log('   1. Login at: http://localhost:5173/login');
      console.log('   2. Use MongoDB Compass or CLI to update:');
      console.log('      db.users.updateOne(');
      console.log('        { email: "amos.kimiti@jamiilink.ke" },');
      console.log('        { $set: {');
      console.log('          role: "founder",');
      console.log('          isFounder: true,');
      console.log('          verification: {');
      console.log('            isVerified: true,');
      console.log('            badgeLevel: "diamond",');
      console.log('            badgeColor: "#FFD700"');
      console.log('          }');
      console.log('        } }');
      console.log('      )');
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
      console.error(`Status: ${response.status}`);
      console.error(`Error: ${data.error || data.message || 'Unknown error'}`);
      console.error('Response:', JSON.stringify(data, null, 2));
      
      if ((data.error || data.message) && (data.error || data.message).includes('already exists')) {
        console.log('\n💡 Account already exists! Try logging in directly.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the backend is running at:', BACKEND_URL);
  }
}

createFounderAccount();
