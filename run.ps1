param (
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "test", "e2e", "build", "install", "start")]
    [string]$Action = "dev"
)

# Luôn chạy trong thư mục chứa script này
Set-Location $PSScriptRoot

$ErrorActionPreference = "Stop"

Write-Host "Action: $Action" -ForegroundColor Cyan

switch ($Action) {
    "install" {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    "dev" {
        Write-Host "Starting Next.js Dev Server..." -ForegroundColor Green
        npm run dev
    }
    "test" {
        Write-Host "Running Unit Tests (Vitest)..." -ForegroundColor Yellow
        npm run test:run
    }
    "e2e" {
        Write-Host "Running E2E Tests (Playwright)..." -ForegroundColor Magenta
        npx playwright test
    }
    "build" {
        Write-Host "Building for production..." -ForegroundColor Blue
        npm run build
    }
    "start" {
        Write-Host "Starting Production Server..." -ForegroundColor Green
        npm run start
    }
}
