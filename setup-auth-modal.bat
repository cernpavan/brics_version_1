@echo off
REM BRICS Connect - Authentication Modal Database Migration (Windows)
REM This script applies the necessary database changes for the authentication modal

echo ==================================
echo BRICS Connect - Auth Modal Setup
echo ==================================
echo.

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI not found!
    echo Please install it first:
    echo npm install -g supabase
    exit /b 1
)

echo ✅ Supabase CLI found
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found
    echo Please run this script from the project root directory
    exit /b 1
)

echo ✅ Project root directory confirmed
echo.

REM Check if Supabase is initialized
if not exist "supabase" (
    echo ❌ Error: supabase directory not found
    echo Please run 'supabase init' first
    exit /b 1
)

echo ✅ Supabase directory found
echo.

REM Check if .env file exists
if not exist ".env" if not exist ".env.local" (
    echo ⚠️  Warning: No .env file found
    echo Make sure you have configured:
    echo   - VITE_SUPABASE_URL
    echo   - VITE_SUPABASE_PUBLISHABLE_KEY
    echo.
)

echo 🔄 Applying database migrations...
echo.

REM Apply migrations
supabase db push

if %errorlevel% equ 0 (
    echo.
    echo ==================================
    echo ✅ Migration successful!
    echo ==================================
    echo.
    echo Changes applied:
    echo   ✅ Added 'is_admin' field to profiles table
    echo   ✅ Created index on 'is_admin' field
    echo.
    echo Next steps:
    echo   1. Enable Google OAuth in Supabase Dashboard (optional^)
    echo      → https://supabase.com/dashboard/project/_/auth/providers
    echo.
    echo   2. Configure Google OAuth credentials (optional^)
    echo      → Client ID
    echo      → Client Secret
    echo      → Authorized redirect URIs
    echo.
    echo   3. Run the development server:
    echo      npm run dev
    echo.
    echo   4. Test the authentication modal:
    echo      → Click 'Sign In' or 'Get Started' buttons
    echo      → Try Sign Up with all fields
    echo      → Test Google Sign-In (if configured^)
    echo.
    echo ==================================
    echo 🎉 Setup complete!
    echo ==================================
) else (
    echo.
    echo ==================================
    echo ❌ Migration failed!
    echo ==================================
    echo.
    echo Troubleshooting:
    echo   1. Check if Supabase is running:
    echo      supabase start
    echo.
    echo   2. Check your Supabase connection
    echo.
    echo   3. Verify migration file exists:
    echo      supabase/migrations/20251220000000_add_admin_field.sql
    echo.
    echo   4. Check Supabase logs:
    echo      supabase logs
    echo.
    exit /b 1
)

