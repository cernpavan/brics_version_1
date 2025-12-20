@echo off
echo ================================================
echo BRICS Connect - New Database Setup Wizard
echo ================================================
echo.
echo Your new Supabase project: zgiefiogqmlzqnefsqlj
echo.
echo ================================================
echo Step 1: Get Your API Key
echo ================================================
echo.
echo 1. Open this URL in your browser:
echo    https://supabase.com/dashboard/project/zgiefiogqmlzqnefsqlj/settings/api
echo.
echo 2. Find the "anon" "public" key (long JWT token)
echo.
echo 3. Copy the key
echo.
pause
echo.
echo Now paste your API key here and press Enter:
set /p API_KEY="API Key: "
echo.

if "%API_KEY%"=="" (
    echo ERROR: API key cannot be empty!
    pause
    exit /b 1
)

echo Updating .env file...
echo.

(
echo # Updated Supabase Configuration
echo # Project: zgiefiogqmlzqnefsqlj
echo # Database Password: Pavang1234@
echo.
echo VITE_SUPABASE_PROJECT_ID="zgiefiogqmlzqnefsqlj"
echo VITE_SUPABASE_URL="https://zgiefiogqmlzqnefsqlj.supabase.co"
echo VITE_SUPABASE_PUBLISHABLE_KEY="%API_KEY%"
) > .env

echo ✅ .env file updated successfully!
echo.
echo ================================================
echo Step 2: Run Database Migrations
echo ================================================
echo.
echo This will create all necessary tables in your database.
echo.
pause
echo.
echo Running migrations...
echo.

npx supabase db push --db-url "postgresql://postgres:Pavang1234@@db.zgiefiogqmlzqnefsqlj.supabase.co:5432/postgres"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Migrations completed successfully!
) else (
    echo.
    echo ⚠️  Migration failed. You may need to run them manually.
    echo    See NEW_DATABASE_SETUP.md for manual setup instructions.
)

echo.
echo ================================================
echo Step 3: Enable Authentication
echo ================================================
echo.
echo 1. Open this URL in your browser:
echo    https://supabase.com/dashboard/project/zgiefiogqmlzqnefsqlj/auth/providers
echo.
echo 2. Make sure "Email" provider is ENABLED
echo.
echo 3. (Optional) Enable "Google" provider for OAuth
echo.
pause
echo.
echo ================================================
echo Step 4: Test Your Setup
echo ================================================
echo.
echo Starting development server...
echo.

npm run dev

echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo If you see any errors, check NEW_DATABASE_SETUP.md
echo.
pause

