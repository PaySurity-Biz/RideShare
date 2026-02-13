@echo off
REM pre-commit hook wrapper (Windows)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0pre-commit.ps1"
exit /b %ERRORLEVEL%
