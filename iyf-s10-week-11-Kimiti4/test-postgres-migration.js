/**
 * 🧪 PostgreSQL Migration Test Script
 * Tests all core API endpoints to verify migration success
 */
const axios = require('axios');
require('dotenv').config();

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000/api';

// Test results
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function
const test = async (name, fn) => {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, status: '✅ PASSED' });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: '❌ FAILED', error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
};

// Store tokens
let testUserToken = null;
let testUserId = null;
let testOrgId = null;
let testPostId = null;
let testCommentId = null;

async function runTests() {
  console.log('\n Starting PostgreSQL Migration Tests...\n');
  console.log(`📡 API URL: ${BASE_URL}\n`);

  // ============================================
  // TEST 1: Register New User
  // ============================================
  await test('Register new user', async () => {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'testuser_pg',
      email: 'testuser@example.com',
      password: 'TestPass123!',
      profile: {
        bio: 'Test user for PostgreSQL migration',
        location: { county: 'Nairobi' }
      }
    });

    if (!response.data.success) {
      throw new Error('Registration failed');
    }
    if (!response.data.data.token) {
      throw new Error('No token returned');
    }

    console.log('   User registered successfully');
  });

  // ============================================
  // TEST 2: Login with Test User
  // ============================================
  await test('Login with test user', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'testuser@example.com',
      password: 'TestPass123!'
    });

    if (!response.data.success) {
      throw new Error('Login failed');
    }

    testUserToken = response.data.data.token;
    console.log('   Login successful');
  });

  // ============================================
  // TEST 3: Get Current User Profile
  // ============================================
  await test('Get current user profile', async () => {
    const response = await axios.get(`${BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });

    if (!response.data.success) {
      throw new Error('Failed to get profile');
    }

    console.log('   Profile retrieved successfully');
  });

  // ============================================
  // TEST 4: Update User Profile
  // ============================================
  await test('Update user profile', async () => {
    const response = await axios.put(`${BASE_URL}/users/profile`, {
      bio: 'Updated bio for PostgreSQL test',
      location_county: 'Mombasa'
    }, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });

    if (!response.data.success) {
      throw new Error('Profile update failed');
    }

    console.log('   Profile updated successfully');
  });

  // ============================================
  // TEST 5: Create Organization
  // ============================================
  await test('Create organization', async () => {
    const response = await axios.post(`${BASE_URL}/organizations`, {
      name: 'Test University',
      slug: 'test-university',
      type: 'university',
      description: 'Test organization for PostgreSQL migration',
      contact: {
        email: 'info@testuni.edu',
        county: 'Nairobi'
      }
    }, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });

    if (!response.data.success) {
      throw new Error('Organization creation failed');
    }

    testOrgId = response.data.data.id;
    console.log(`   Organization created: ${testOrgId}`);
  });

  // ============================================
  // TEST 6: Get All Organizations
  // ============================================
  await test('Get all organizations', async () => {
    const response = await axios.get(`${BASE_URL}/organizations`);

    if (!response.data.success) {
      throw new Error('Failed to get organizations');
    }

    console.log(`   Found ${response.data.data.length} organizations`);
  });

  // ============================================
  // TEST 7: Join Organization
  // ============================================
  await test('Join organization', async () => {
    const response = await axios.post(
      `${BASE_URL}/organizations/${testOrgId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${testUserToken}` }
      }
    );

    if (!response.data.success) {
      throw new Error('Failed to join organization');
    }

    console.log('   Successfully joined organization');
  });

  // ============================================
  // TEST 8: Create Post
  // ============================================
  await test('Create post', async () => {
    const response = await axios.post(`${BASE_URL}/posts`, {
      title: 'Test Post - PostgreSQL Migration',
      content: 'This is a test post to verify PostgreSQL migration is working correctly.',
      category: 'mtaani',
      organization: testOrgId,
      location: {
        county: 'Nairobi',
        settlement: 'Westlands'
      }
    }, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });

    if (!response.data.success) {
      throw new Error('Post creation failed');
    }

    testPostId = response.data.data.id;
    console.log(`   Post created: ${testPostId}`);
  });

  // ============================================
  // TEST 9: Get Posts
  // ============================================
  await test('Get all posts', async () => {
    const response = await axios.get(`${BASE_URL}/posts`);

    if (!response.data.success) {
      throw new Error('Failed to get posts');
    }

    console.log(`   Found ${response.data.data.length} posts`);
  });

  // ============================================
  // TEST 10: Create Comment
  // ============================================
  await test('Create comment', async () => {
    const response = await axios.post(
      `${BASE_URL}/posts/${testPostId}/comments`,
      {
        content: 'This is a test comment on the post'
      },
      {
        headers: { Authorization: `Bearer ${testUserToken}` }
      }
    );

    if (!response.data.success) {
      throw new Error('Comment creation failed');
    }

    testCommentId = response.data.data.id;
    console.log(`   Comment created: ${testCommentId}`);
  });

  // ============================================
  // TEST 11: Get Comments
  // ============================================
  await test('Get comments for post', async () => {
    const response = await axios.get(`${BASE_URL}/posts/${testPostId}/comments`);

    if (!response.data.success) {
      throw new Error('Failed to get comments');
    }

    console.log(`   Found ${response.data.count} comments`);
  });

  // ============================================
  // TEST 12: Get User Statistics
  // ============================================
  await test('Get user statistics', async () => {
    const response = await axios.get(`${BASE_URL}/users/stats`, {
      headers: { Authorization: `Bearer ${testUserToken}` }
    });

    if (!response.data.success) {
      throw new Error('Failed to get stats');
    }

    console.log('   User stats retrieved successfully');
  });

  // ============================================
  // TEST 13: Get Members
  // ============================================
  await test('Get organization members', async () => {
    const response = await axios.get(`${BASE_URL}/organizations/${testOrgId}/members`);

    if (!response.data.success) {
      throw new Error('Failed to get members');
    }

    console.log(`   Found ${response.data.count} members`);
  });

  // ============================================
  // TEST 14: Leave Organization
  // ============================================
  await test('Leave organization', async () => {
    const response = await axios.post(
      `${BASE_URL}/organizations/${testOrgId}/leave`,
      {},
      {
        headers: { Authorization: `Bearer ${testUserToken}` }
      }
    );

    if (!response.data.success) {
      throw new Error('Failed to leave organization');
    }

    console.log('   Successfully left organization');
  });

  // ============================================
  // TEST 15: Delete Comment
  // ============================================
  await test('Delete comment', async () => {
    const response = await axios.delete(
      `${BASE_URL}/posts/${testPostId}/comments/${testCommentId}`,
      {
        headers: { Authorization: `Bearer ${testUserToken}` }
      }
    );

    if (response.status !== 204) {
      throw new Error('Failed to delete comment');
    }

    console.log('   Comment deleted successfully');
  });

  // ============================================
  // Summary
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log(' TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📝 Total:  ${results.passed + results.failed}`);
  console.log('='.repeat(60) + '\n');

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! PostgreSQL migration is successful!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
