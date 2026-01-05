@echo off
REM Start script for ZField backend (Windows)

REM Change to root directory (where pyproject.toml is)
cd /d "%~dp0.."

REM Check if virtual environment exists
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

REM Activate virtual environment
call .venv\Scripts\activate.bat

REM Install dependencies (from root where pyproject.toml is)
echo Installing dependencies...
pip install -e .[windows]

REM Start the server
echo Starting ZField backend server...
python -m app.startup

