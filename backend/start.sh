#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

echo "PORT environment variable: ${PORT}"
echo "Python version: $(python --version)"

echo "Starting uvicorn..."
python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
