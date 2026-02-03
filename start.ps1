# Due Diligence Agent - Startup Script
# This script starts all required services for the application

Write-Host "Starting Due Diligence Agent..." -ForegroundColor Green

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Terminal 1 - ChromaDB
Write-Host "Starting ChromaDB..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; python start_chroma.py"

# Wait for ChromaDB to initialize
Start-Sleep -Seconds 3

# Terminal 2 - Backend Server
Write-Host "Starting Backend Server..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend-node'; npm start"

# Wait for backend to start
Start-Sleep -Seconds 3

# Terminal 3 - Worker Process
Write-Host "Starting Worker Process..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\backend-node'; npm run worker"

# Terminal 4 - Frontend
Write-Host "Starting Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir\frontend'; npm run dev"

Write-Host "`nAll services started successfully!" -ForegroundColor Green
Write-Host "Backend API: http://localhost:5000/api" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "`nTo stop all services, close each terminal window individually." -ForegroundColor Yellow
