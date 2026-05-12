# 🐘 PostgreSQL Integration Guide for JamiiLink KE

## Overview

You have PostgreSQL installed on your PC! This guide will help you migrate from MongoDB to PostgreSQL for better scalability and relational data management.

---

## Why PostgreSQL?

✅ **Relational Data** - Better for complex relationships (users, posts, organizations)  
✅ **ACID Compliance** - Ensures data integrity  
✅ **Scalability** - Handles millions of records efficiently  
✅ **Advanced Queries** - Powerful SQL capabilities  
✅ **Local Development** - Runs on your PC, no cloud dependency  
✅ **Free & Open Source** - No licensing costs  

---

## Step 1: Install PostgreSQL Dependencies

### Backend (iyf-s10-week-11-Kimiti4)

```bash
cd iyf-s10-week-11-Kimiti4
npm install pg pg-hstore sequelize
```

**Packages:**
- `pg` - PostgreSQL client for Node.js
- `pg-hstore` - HSTORE data type support
- `sequelize` - ORM for PostgreSQL (optional but recommended)

---

## Step 2: Create PostgreSQL Database

### Option A: Using psql Command Line

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE jamiilink_db;

# Create user (optional)
CREATE USER jamiilink_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE jamiilink_db TO jamiilink_user;

# Exit
\q
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin 4
2. Right-click "Databases" → "Create" → "Database"
3. Name: `jamiilink_db`
4. Owner: `postgres` (or your user)
5. Click "Save"

---

## Step 3: Update Environment Variables

Update `.env` file in `iyf-s10-week-11-Kimiti4`:

```env
# Remove or comment out MongoDB URI
# MONGODB_URI=mongodb+srv://...

# Add PostgreSQL connection string
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/jamiilink_db

# Or if you created a separate user:
# DATABASE_URL=postgresql://jamiilink_user:your_password@localhost:5432/jamiilink_db

# Keep other variables
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Default PostgreSQL port: **5432**

---

## Step 4: Create Database Models

Replace Mongoose models with Sequelize models or use raw SQL queries.

### Example: User Model with Sequelize

```javascript
// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'founder'),
    defaultValue: 'user'
  },
  isFounder: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  profile: {
    type: DataTypes.JSONB,  // PostgreSQL JSONB for flexible profile data
    defaultValue: {}
  },
  verification: {
    type: DataTypes.JSONB,
    defaultValue: {
      isVerified: false,
      badgeLevel: 'bronze'
    }
  },
  mfa: {
    type: DataTypes.JSONB,
    defaultValue: {
      enabled: false,
      methods: []
    }
  }
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;
```

### Database Configuration

```javascript
// src/config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected Successfully');
  } catch (error) {
    console.error('❌ Unable to connect to PostgreSQL:', error);
  }
}

testConnection();

module.exports = sequelize;
```

---

## Step 5: Database Migrations

Create migration scripts to set up tables:

```javascript
// src/migrations/001-create-users.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

async function up() {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      is_founder BOOLEAN DEFAULT false,
      profile JSONB DEFAULT '{}',
      verification JSONB DEFAULT '{"isVerified": false, "badgeLevel": "bronze"}',
      mfa JSONB DEFAULT '{"enabled": false, "methods": []}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX idx_users_email ON users(email);
    CREATE INDEX idx_users_username ON users(username);
  `);
  
  console.log('✅ Users table created');
}

async function down() {
  await sequelize.query('DROP TABLE IF EXISTS users CASCADE');
  console.log('⚠️  Users table dropped');
}

module.exports = { up, down };
```

Run migrations:
```bash
node src/migrations/001-create-users.js
```

---

## Step 6: Update Controllers

Replace Mongoose queries with Sequelize or raw SQL:

### Before (MongoDB/Mongoose):
```javascript
const User = require('../models/User');

const register = async (req, res) => {
  const user = await User.create({
    username,
    email,
    password
  });
};
```

### After (PostgreSQL/Sequelize):
```javascript
const User = require('../models/User');

const register = async (req, res) => {
  const user = await User.create({
    username,
    email,
    password
  });
};

// Or with raw SQL:
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const register = async (req, res) => {
  const result = await pool.query(
    'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
    [username, email, hashedPassword]
  );
  const user = result.rows[0];
};
```

---

## Step 7: Seed Founder Account

Create a seed script to add your founder account:

```javascript
// src/seeds/founder.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedFounder() {
  try {
    const hashedPassword = await bcrypt.hash('Kimiti@2026!Founder#MFA', 10);
    
    await pool.query(`
      INSERT INTO users (
        username, 
        email, 
        password, 
        role, 
        is_founder,
        profile,
        verification
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `, [
      'kimiti4',
      'amos.kimiti@jamiilink.ke',
      hashedPassword,
      'founder',
      true,
      JSON.stringify({
        bio: 'Amos Kimiti - Platform Founder & Creator',
        avatarIcon: '👑',
        location: { county: 'Nairobi', settlement: 'Westlands' },
        skills: ['Full Stack Development', 'Community Building']
      }),
      JSON.stringify({
        isVerified: true,
        badgeLevel: 'diamond',
        badgeColor: '#FFD700'
      })
    ]);
    
    console.log('✅ Founder account seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding founder:', error);
  } finally {
    await pool.end();
  }
}

seedFounder();
```

Run it:
```bash
node src/seeds/founder.js
```

---

## Step 8: Test Connection

Create a simple test script:

```javascript
// test-postgres.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function test() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL is working!', result.rows[0]);
    
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tables.rows);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

test();
```

---

## Migration Checklist

- [ ] Install PostgreSQL dependencies (`pg`, `sequelize`)
- [ ] Create PostgreSQL database (`jamiilink_db`)
- [ ] Update `.env` with `DATABASE_URL`
- [ ] Create Sequelize models or raw SQL queries
- [ ] Write migration scripts for all tables
- [ ] Update controllers to use PostgreSQL
- [ ] Seed founder account
- [ ] Test all API endpoints
- [ ] Remove MongoDB dependencies
- [ ] Update deployment configuration

---

## Tables to Create

Based on your current features:

1. **users** - User accounts with profiles
2. **posts** - Community posts
3. **organizations** - Community organizations
4. **events** - Community events
5. **alerts** - Emergency alerts
6. **reactions** - Post reactions (likes, emojis)
7. **polls** - Interactive polls
8. **poll_votes** - Poll voting records
9. **comments** - Post comments
10. **notifications** - User notifications
11. **verification_requests** - Badge verification requests
12. **tiannara_logs** - AI interaction logs

---

## Advantages Over MongoDB

| Feature | MongoDB | PostgreSQL |
|---------|---------|------------|
| **Data Integrity** | eventual consistency | ACID transactions |
| **Joins** | limited ($lookup) | powerful JOINs |
| **Complex Queries** | aggregation pipeline | advanced SQL |
| **Scalability** | horizontal sharding | vertical + read replicas |
| **Local Dev** | requires MongoDB Atlas | runs on your PC |
| **Cost** | free tier limits | completely free |
| **Relationships** | document references | foreign keys |
| **JSON Support** | native | JSONB (excellent) |

---

## Hybrid Approach (Optional)

You can use **both** databases:
- **PostgreSQL** for structured data (users, posts, transactions)
- **MongoDB** for unstructured data (logs, analytics, Tiannara conversations)

This gives you the best of both worlds!

---

## Quick Start Commands

```bash
# 1. Start PostgreSQL service
# Windows: Services → PostgreSQL → Start
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# 2. Create database
psql -U postgres -c "CREATE DATABASE jamiilink_db;"

# 3. Install dependencies
cd iyf-s10-week-11-Kimiti4
npm install pg sequelize

# 4. Update .env
# Add DATABASE_URL=postgresql://postgres:@localhost:5432/jamiilink_db

# 5. Run migrations
node src/migrations/001-create-users.js

# 6. Seed founder
node src/seeds/founder.js

# 7. Start backend
npm run dev
```

---

## Need Help?

- PostgreSQL Docs: https://www.postgresql.org/docs/
- Sequelize Docs: https://sequelize.org/
- pg Module: https://node-postgres.com/

---

**Ready to migrate?** Start with Step 1 and work through each step. The founder dashboard UI is already built and ready to use once the database is connected! 🚀
