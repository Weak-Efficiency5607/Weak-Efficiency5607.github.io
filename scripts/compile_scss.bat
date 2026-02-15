@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."
echo Compiling SCSS to CSS...

:: Run sass compiler
call npx sass style.scss style.css --style compressed --no-source-map

if !errorlevel! equ 0 (
    echo.
    echo [SUCCESS] style.scss compiled to style.css (minified^)
) else (
    echo.
    echo [ERROR] SCSS compilation failed with code !errorlevel!
)
