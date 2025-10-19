@echo off
REM Vercel Build Script for Windows
REM Prepares frontend for Vercel deployment

echo Building ROMGON for Vercel...

REM Create public directory if it doesn't exist
if not exist "public" mkdir public

REM Copy frontend files to public directory
xcopy /E /I /Y frontend\* public\

echo.
echo ✅ Frontend prepared for deployment
