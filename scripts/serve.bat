@echo off
cd /d "%~dp0.."
SET PORT=8000
echo ===========================================
echo   r/anhedonia - Local Development Server
echo ===========================================
echo.
echo Starting server on http://localhost:%PORT%
echo This allows you to test the search feature without CORS issues.
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your PATH.
    echo Please install Python from https://www.python.org/
    echo.
    exit /b
)

:: Open the browser after a short delay
start http://localhost:%PORT%/index.html

:: Run Python's built-in HTTP server
python -m http.server %PORT%

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start the server.
    echo Ensure port %PORT% is not already in use.
)
