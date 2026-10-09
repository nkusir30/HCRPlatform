@echo off
REM Start the HCR API in the background, detached on Windows.
REM Resolves the API root from the script's directory (scripts/), never from CWD.
REM This avoids the CWD-relative double-path bug on Windows.

setlocal

set SCRIPT_DIR=%~dp0
set REPO_ROOT=%SCRIPT_DIR%..\
set API_ROOT=%REPO_ROOT%\apps\api
set LOG_FILE=%~2
if "%LOG_FILE%"=="" set LOG_FILE=%REPO_ROOT%\tmp\api.log

rem Create the log directory if needed.
mkdir "%REPO_ROOT%\tmp" 2>nul

rem Start the API detached, redirecting stdout+stderr to the log.
start "" /b node "%API_ROOT%\dist\main" >> "%LOG_FILE%" 2>&1

echo Started API writing to %LOG_FILE%
