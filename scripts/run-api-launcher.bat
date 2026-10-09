@echo off
REM Launcher for the HCR API on Windows.
REM Invokes scripts/start-api.bat via cmd.exe so the .bat runs in the
REM native Windows command interpreter (not PowerShell).
cmd.exe /c "%~dp0..\scripts\start-api.bat" hcr-platform
