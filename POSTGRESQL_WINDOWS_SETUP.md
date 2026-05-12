# 🐘 PostgreSQL Setup for Windows - Step by Step

## Quick Fix for Your Issues

You have 3 problems:
1. ❌ Port 3000 already in use
2. ❌ PostgreSQL password not configured  
3. ❌ Database doesn't exist

Let's fix them all!

---

## Step 1: Stop the Running Server (Port 3000)

### Option A: Use Task Manager
1. Press `Ctrl + Shift + Esc` to open Task Manager
2. Find "Node.js" or "node.exe" processes
3. Right-click → End Task
4. Close all terminals running the backend

### Option B: Use Command Line
Open PowerShell as Administrator and run:
```powershell
Get-Process -Name node | Stop-Process -Force
```

---

## Step 2: Find PostgreSQL Installation

PostgreSQL is installed but the command-line tools aren't in your PATH.

### Find PostgreSQL Bin Folder:

1. Open File Explorer
2. Navigate to: `C:\Program Files\PostgreSQL\`
3. You'll see a folder like `15`, `16`, or `17` (version number)
4. Inside, find the `bin` folder
5. Full path will be something like:
   ```
   C:\Program Files\PostgreSQL\16\bin
   ```

### Add to PATH (Permanent Solution):

1. Press `Win + R`, type `sysdm.cpl`, press Enter
2. Click "Advanced" tab → "Environment Variables"
3. Under "System variables", find "Path" → Click "Edit"
4. Click "New"
5. Add: `C:\Program Files\PostgreSQL\XX\bin` (replace XX with your version)
6. Click OK on all dialogs
7. **Restart your terminal** (close and reopen Git Bash)

### Test It Works:
```bash
psql --version
```

Should show: `psql (PostgreSQL) XX.X`

---

## Step 3: Create Database Manually

Now that psql is in PATH, create the database:

```bash
# Connect to PostgreSQL (will prompt for password)
psql -U postgres

# If it asks for password, enter the one you set during installation
# Common passwords: postgres, password, or leave blank

# Once connected, you'll see: postgres=#

# Create the database
CREATE DATABASE jamiilink_db;

# Verify it was created
\l

# Exit psql
\q
```

### Alternative One-Liner:
```bash
psql -U postgres -c "CREATE DATABASE jamiilink_db;"
```

If it asks for password, use `-W` flag:
```bash
psql -U postgres -W -c "CREATE DATABASE jamiilink_db;"
```

---

## Step 4: Update .env File

Open `iyf-s10-week-11-Kimiti4/.env` and update:

```env
# If NO password for postgres user:
DATABASE_URL=postgresql://postgres:@localhost:5432/jamiilink_db

# If you SET a password (replace 'your_password'):
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/jamiilink_db
```

---

## Step 5: Run Setup Scripts

Now run the setup scripts in order:

```bash
cd iyf-s10-week-11-Kimiti4

# Install dependencies if not done yet
npm install pg bcryptjs dotenv

# Run database setup (creates tables)
node src/seeds/setup-database.js

# Create founder account
node src/seeds/founder-postgres.js
```

---

## Step 6: Start Servers

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend (new terminal)
cd ../iyf-s10-week-09-Kimiti4
npm run dev
```

---

## Troubleshooting

### Problem: "psql: command not found"

**Solution:** PostgreSQL bin folder not in PATH

1. Find PostgreSQL bin folder (see Step 2)
2. Either:
   - Add to PATH permanently (recommended), OR
   - Use full path each time:
     ```bash
     "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres
     ```

### Problem: "password authentication failed"

**Solution:** Wrong password

1. Try common passwords: `postgres`, `password`, or blank
2. If you forgot the password:
   - Reinstall PostgreSQL and remember the password
   - OR reset it (advanced - see PostgreSQL docs)

### Problem: "could not connect to server"

**Solution:** PostgreSQL service not running

1. Press `Win + R`, type `services.msc`
2. Find "postgresql-x64-XX" service
3. Right-click → Start
4. Try connecting again

### Problem: "database already exists"

**Solution:** Database was already created

This is fine! Just continue to Step 5.

If you want to start fresh:
```bash
psql -U postgres -c "DROP DATABASE jamiilink_db;"
psql -U postgres -c "CREATE DATABASE jamiilink_db;"
```

---

## Easier Alternative: Use the Batch Script

I created a Windows batch file that automates everything:

```bash
cd iyf-s10-week-11-Kimiti4
setup-postgres.bat
```

This will:
1. Check if PostgreSQL is installed
2. Create the database
3. Run setup scripts
4. Create founder account

---

## Verify Everything Works

### Check PostgreSQL is Running:
```bash
psql -U postgres -c "SELECT version();"
```

### Check Database Exists:
```bash
psql -U postgres -l | findstr jamiilink
```

### Check Tables Created:
```bash
psql -U postgres -d jamiilink_db -c "\dt"
```

### Check Founder Account:
```bash
psql -U postgres -d jamiilink_db -c "SELECT username, email, role FROM users;"
```

Should show:
```
 username |          email           |  role   
----------+--------------------------+---------
 Snooz3   | kimiti.kariuki75@gmail.com | founder
```

---

## Your Founder Credentials

After setup completes:

- **Username:** Snooz3
- **Email:** kimiti.kariuki75@gmail.com
- **Password:** #gunzNroz3z_6G1GWY#
- **Badge:** Diamond 💎
- **Avatar:** 👑

**Login at:** http://localhost:5173/login

---

## Quick Reference Commands

### Start PostgreSQL Service:
```
Services app → postgresql-x64-XX → Start
```

### Connect to Database:
```bash
psql -U postgres -d jamiilink_db
```

### List Tables:
```sql
\dt
```

### View Users:
```sql
SELECT * FROM users;
```

### Exit psql:
```sql
\q
```

---

## Need More Help?

1. Check PostgreSQL logs: `C:\Program Files\PostgreSQL\XX\data\log`
2. Verify service is running in Services app
3. Make sure port 5432 is not blocked by firewall
4. Try reinstalling PostgreSQL if nothing works

---

**Once PostgreSQL is working, you're all set!** 🚀
