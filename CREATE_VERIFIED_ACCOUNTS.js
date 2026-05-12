/**
 * 🔹 Create First Verified Users & Organizations Script
 * Run this after deployment to seed initial verified accounts
 */

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Configuration for first verified accounts
const VERIFIED_USERS = [
  {
    email: 'admin@jamiilink.ke',
    password: 'Admin123!@#',
    username: 'JamiiLink Admin',
    role: 'admin',
    verification: {
      isVerified: true,
      badgeLevel: 'diamond',
      verificationType: 'manual',
      verificationNotes: 'Platform administrator - Diamond tier'
    }
  },
  {
    email: 'moderator@jamiilink.ke',
    password: 'Mod123!@#',
    username: 'Community Moderator',
    role: 'moderator',
    verification: {
      isVerified: true,
      badgeLevel: 'platinum',
      verificationType: 'manual',
      verificationNotes: 'Official moderator - Platinum tier'
    }
  },
  {
    email: 'partner@example.ke',
    password: 'Partner123!@#',
    username: 'Official Partner',
    role: 'user',
    verification: {
      isVerified: true,
      badgeLevel: 'gold',
      verificationType: 'document',
      verificationNotes: 'Verified partner organization representative'
    }
  }
];

const VERIFIED_ORGANIZATIONS = [
  {
    name: 'University of Nairobi',
    slug: 'uon',
    type: 'university',
    description: 'Kenya\'s premier university',
    verification: {
      isVerified: true,
      badgeLevel: 'official',
      verificationType: 'educational_institution',
      badgeColor: '#1e40af',
      badgeGradient: {
        start: '#1e40af',
        end: '#3b82f6'
      }
    }
  },
  {
    name: 'Nairobi Tech Hub',
    slug: 'nairobi-tech-hub',
    type: 'coworking',
    description: 'Technology innovation hub in Nairobi',
    verification: {
      isVerified: true,
      badgeLevel: 'partner',
      verificationType: 'business_license',
      badgeColor: '#7c3aed',
      badgeGradient: {
        start: '#7c3aed',
        end: '#a78bfa'
      }
    }
  },
  {
    name: 'Kibera Community Center',
    slug: 'kibera-community',
    type: 'community',
    description: 'Empowering Kibera community',
    verification: {
      isVerified: true,
      badgeLevel: 'verified',
      verificationType: 'official_document',
      badgeColor: '#059669',
      badgeGradient: {
        start: '#059669',
        end: '#10b981'
      }
    }
  }
];

async function loginAdmin() {
  console.log('🔐 Logging in as admin...');
  
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@jamiilink.ke',
      password: 'Admin123!@#'
    })
  });
  
  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.token;
}

async function verifyUser(token, userId, verificationData) {
  console.log(`✅ Verifying user ${userId}...`);
  
  const response = await fetch(`${API_URL}/verification/users/${userId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(verificationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to verify user ${userId}:`, error);
    return false;
  }
  
  const result = await response.json();
  console.log(`✓ User verified successfully:`, result.data.badgeLevel);
  return true;
}

async function verifyOrganization(token, orgId, verificationData) {
  console.log(`🏢 Verifying organization ${orgId}...`);
  
  const response = await fetch(`${API_URL}/verification/organizations/${orgId}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(verificationData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error(`Failed to verify organization ${orgId}:`, error);
    return false;
  }
  
  const result = await response.json();
  console.log(`✓ Organization verified successfully:`, result.data.badgeLevel);
  return true;
}

async function main() {
  console.log('🚀 Starting verification setup...\n');
  
  try {
    // Step 1: Login as admin
    const token = await loginAdmin();
    console.log('✓ Admin login successful\n');
    
    // Step 2: Verify users (you'll need to get their IDs after creation)
    console.log('📝 To verify users:');
    console.log('1. Create user accounts first');
    console.log('2. Get user IDs from database or API');
    console.log('3. Run verification for each user:\n');
    
    VERIFIED_USERS.forEach((user, index) => {
      console.log(`   User ${index + 1}: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Badge Level: ${user.verification.badgeLevel}`);
      console.log(`   Command: curl -X POST ${API_URL}/verification/users/{USER_ID}/verify \\`);
      console.log(`     -H "Authorization: Bearer ${token}" \\`);
      console.log(`     -H "Content-Type: application/json" \\`);
      console.log(`     -d '${JSON.stringify(user.verification)}'\n`);
    });
    
    // Step 3: Verify organizations
    console.log('\n📝 To verify organizations:');
    console.log('1. Create organization accounts first');
    console.log('2. Get organization IDs from database or API');
    console.log('3. Run verification for each organization:\n');
    
    VERIFIED_ORGANIZATIONS.forEach((org, index) => {
      console.log(`   Org ${index + 1}: ${org.name}`);
      console.log(`   Slug: ${org.slug}`);
      console.log(`   Badge Level: ${org.verification.badgeLevel}`);
      console.log(`   Command: curl -X POST ${API_URL}/verification/organizations/{ORG_ID}/verify \\`);
      console.log(`     -H "Authorization: Bearer ${token}" \\`);
      console.log(`     -H "Content-Type: application/json" \\`);
      console.log(`     -d '${JSON.stringify(org.verification)}'\n`);
    });
    
    console.log('\n✨ Verification setup complete!');
    console.log('\n💡 Next steps:');
    console.log('1. Deploy backend to Railway');
    console.log('2. Deploy frontend to Vercel');
    console.log('3. Create user accounts via signup page');
    console.log('4. Use the commands above to verify them');
    console.log('5. Test badge animations on different devices');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
