@echo off
echo ====================================
echo PostgreSQL Setup for JamiiLink KE
echo ====================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL command-line tools not found in PATH
    echo.
    echo Please add PostgreSQL bin directory to your PATH:
    echo C:\Program Files\PostgreSQL\XX\bin
    echo.
    pause
    exit /b 1
)

echo Step 1: Creating database...
psql -U postgres -c "CREATE DATABASE jamiilink_db;" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Database created successfully
) else (
    echo ℹ Database might already exist or connection failed
    echo Trying to connect with different credentials...
    
    REM Try with password prompt
    psql -U postgres -W -c "CREATE DATABASE jamiilink_db;" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ✗ Failed to create database
        echo.
        echo Please ensure:
        echo 1. PostgreSQL service is running
        echo 2. You know the postgres user password
        echo 3. PostgreSQL bin folder is in PATH
        pause
        exit /b 1
    )
)

echo.
echo Step 2: Running database setup script...
node src/seeds/setup-database.js
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Database setup failed
    pause
    exit /b 1
)

echo.
echo Step 3: Creating founder account...
node src/seeds/founder-postgres.js
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Founder account creation failed
    pause
    exit /b 1
)

echo.
echo ====================================
echo ✓ SETUP COMPLETE!
echo ====================================
echo.
echo You can now:
echo 1. Start backend: npm run dev
echo 2. Start frontend: cd ..\iyf-s10-week-09-Kimiti4 ^&^& npm run dev
echo 3. Login with founder credentials
echo.
pause
