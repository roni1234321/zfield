#!/bin/bash
# Start script for ZField backend

# Change to root directory (where pyproject.toml is)
cd "$(dirname "$0")/.."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install dependencies (from root where pyproject.toml is)
echo "Installing dependencies..."
pip install -e .[linux]

# Change to backend directory to run the server
cd backend

# Start the server
echo "Starting ZField backend server..."
python -m app.startup

