# 🐘 PostgreSQL Quick Setup Guide

## Step-by-Step Instructions to Set Up PostgreSQL for JamiiLink

---

## Prerequisites

✅ PostgreSQL installed on your PC  
✅ Node.js installed  
✅ Backend code in `iyf-s10-week-11-Kimiti4`  

---

## Step 1: Start PostgreSQL Service

### Windows:
1. Press `Win + R`, type `services.msc`, press Enter
2. Find "postgresql-x64-XX" (XX is version number)
3. Right-click → Start (or Restart if already running)

### Mac:
```bash
brew services start postgresql
```

### Linux:
```bash
sudo systemctl start postgresql
```

---

## Step 2: Install Backend Dependencies

```bash
cd iyf-s10-week-11-Kimiti4
npm install pg bcryptjs dotenv
```

**Packages:**
- `pg` - PostgreSQL client for Node.js
- `bcryptjs` - Password hashing
- `dotenv` - Environment variables

---

## Step 3: Update .env File

Open `iyf-s10-week-11-Kimiti4/.env` and add:

```env
# PostgreSQL Database
DATABASE_URL=postgresql://postgres:@localhost:5432/jamiilink_db

# Comment out MongoDB (optional)
# MONGODB_URI=mongodb+srv://...

# Keep other variables
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

**Note:** If you set a password for PostgreSQL user, use:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/jamiilink_db
```

---

## Step 4: Run Database Setup Script

This creates the database and all tables:

```bash
node src/seeds/setup-database.js
```

**What it does:**
- ✅ Creates `jamiilink_db` database
- ✅ Creates 9 tables (users, posts, organizations, events, alerts, reactions, polls, poll_votes, comments)
- ✅ Sets up indexes for performance
- ✅ Configures foreign keys and constraints

**Expected Output:**
```
🗄️  Starting PostgreSQL Database Setup...

✅ Connected to PostgreSQL

📦 Creating database: jamiilink_db...
✅ Database created successfully

✅ Connected to jamiilink_db database

📋 Creating users table...
✅ Users table created

... (more tables)

✅ DATABASE SETUP COMPLETE!
```

---

## Step 5: Create Founder Account

Run the seed script to create your founder account:

```bash
node src/seeds/founder-postgres.js
```

**What it creates:**
- Username: `kimiti4`
- Email: `amos.kimiti@jamiilink.ke`
- Password: `Kimiti@2026!Founder#MFA` (hashed)
- Role: `founder`
- Badge: Diamond 💎
- Avatar: Crown 👑
- MFA: 3-Factor enabled

**Expected Output:**
```
🌱 Starting Founder Account Seed...

✅ Connected to PostgreSQL database

🔐 Hashing password...
✅ Password hashed successfully

📝 Creating founder account...

✅ Founder Account Created Successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Account Details:
   Username: kimiti4
   Email: amos.kimiti@jamiilink.ke
   Role: founder
   Is Founder: true
   ...

🚀 HOW TO LOGIN:
   1. Start frontend: cd iyf-s10-week-09-Kimiti4 && npm run dev
   2. Go to: http://localhost:5173/login
   3. Email: amos.kimiti@jamiilink.ke
   4. Password: Kimiti@2026!Founder#MFA
   5. Click "👑 Founder" button in navbar
   6. Access dashboard at: /admin/founder
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 6: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
🚀 Jamii Link KE API running in production mode
🌐 Server: http://localhost:3000
📊 Health: http://localhost:3000/api/health
✅ PostgreSQL Connected Successfully
```

---

## Step 7: Start Frontend

Open a **new terminal**:

```bash
cd iyf-s10-week-09-Kimiti4
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## Step 8: Login & Access Dashboard

1. Open browser: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `amos.kimiti@jamiilink.ke`
   - Password: `Kimiti@2026!Founder#MFA`
3. Click Login
4. You'll see **"👑 Founder"** button in navbar (golden, animated)
5. Click it to access founder dashboard at `/admin/founder`

---

## Troubleshooting

### Error: "ECONNREFUSED"
**Problem:** PostgreSQL is not running  
**Solution:** Start PostgreSQL service (see Step 1)

### Error: "database does not exist"
**Problem:** Database wasn't created  
**Solution:** Run setup script again:
```bash
node src/seeds/setup-database.js
```

### Error: "relation 'users' does not exist"
**Problem:** Tables weren't created  
**Solution:** Run setup script again

### Error: "duplicate key value violates unique constraint"
**Problem:** Founder account already exists  
**Solution:** Delete existing user first:
```bash
psql -U postgres -d jamiilink_db -c "DELETE FROM users WHERE email = 'amos.kimiti@jamiilink.ke';"
```
Then run seed script again

### Can't connect to PostgreSQL?
**Check:**
1. PostgreSQL service is running
2. Port 5432 is not blocked by firewall
3. Username/password in DATABASE_URL is correct
4. Database name is `jamiilink_db`

---

## Verify Setup

### Check if PostgreSQL is running:
```bash
# Windows
pg_ctl status

# Mac/Linux
pg_lsclusters
```

### Connect to database manually:
```bash
psql -U postgres -d jamiilink_db
```

### List tables:
```sql
\dt
```

### Check founder account:
```sql
SELECT username, email, role, is_founder FROM users WHERE email = 'amos.kimiti@jamiilink.ke';
```

Expected output:
```
 username |          email           |  role   | is_founder 
----------+--------------------------+---------+------------
 kimiti4  | amos.kimiti@jamiilink.ke | founder | t
```

Exit psql:
```sql
\q
```

---

## Database Management Commands

### View all users:
```bash
psql -U postgres -d jamiilink_db -c "SELECT username, email, role FROM users;"
```

### Count posts:
```bash
psql -U postgres -d jamiilink_db -c "SELECT COUNT(*) FROM posts;"
```

### Drop database (WARNING: Deletes everything!):
```bash
psql -U postgres -c "DROP DATABASE jamiilink_db;"
```

Then recreate:
```bash
node src/seeds/setup-database.js
node src/seeds/founder-postgres.js
```

---

## Backup & Restore

### Backup database:
```bash
pg_dump -U postgres jamiilink_db > backup.sql
```

### Restore database:
```bash
psql -U postgres jamiilink_db < backup.sql
```

---

## Next Steps

✅ Database is set up  
✅ Founder account created  
✅ Backend running on port 3000  
✅ Frontend running on port 5173  

**You're ready to use JamiiLink!** 🎉

Explore features:
- `/tiannara` - AI assistant
- `/events` - Community events
- `/alerts` - Emergency alerts
- `/admin/founder` - Founder dashboard

---

## Need Help?

- PostgreSQL Docs: https://www.postgresql.org/docs/
- pg Module: https://node-postgres.com/
- Check logs in terminal for error messages

---

**Happy coding!** 🚀
