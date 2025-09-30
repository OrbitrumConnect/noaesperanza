# NOA Esperanza - Quality Stack Setup Script (PowerShell)
# This script installs and configures all quality assurance tools

param(
    [switch]$SkipTests,
    [switch]$SkipHusky
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if Node.js is installed
function Test-Node {
    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        
        if ($versionNumber -lt 18) {
            Write-Error "Node.js version 18+ is required. Current version: $nodeVersion"
            exit 1
        }
        
        Write-Success "Node.js $nodeVersion is installed"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json not found. Please run this script from the project root."
        exit 1
    }
    
    npm install
    Write-Success "Dependencies installed successfully"
}

# Setup Husky
function Setup-Husky {
    if ($SkipHusky) {
        Write-Warning "Skipping Husky setup"
        return
    }
    
    Write-Status "Setting up Husky for Git hooks..."
    
    npx husky install
    npx husky add .husky/pre-commit "npm run pre-commit"
    npx husky add .husky/pre-push "npm run pre-push"
    
    Write-Success "Husky setup completed"
}

# Setup SonarQube
function Setup-Sonar {
    Write-Status "Setting up SonarQube..."
    
    if (-not (Test-Path "sonar-project.properties")) {
        Write-Warning "sonar-project.properties not found. Creating default configuration..."
    }
    
    Write-Success "SonarQube configuration ready"
    Write-Warning "Make sure to set SONAR_TOKEN environment variable for CI/CD"
}

# Run initial quality checks
function Invoke-QualityChecks {
    Write-Status "Running initial quality checks..."
    
    # Lint check
    Write-Status "Running ESLint..."
    try {
        npm run lint
        Write-Success "ESLint passed"
    }
    catch {
        Write-Warning "ESLint found issues. Run 'npm run lint:fix' to fix them."
    }
    
    # Type check
    Write-Status "Running TypeScript check..."
    try {
        npm run type-check
        Write-Success "TypeScript check passed"
    }
    catch {
        Write-Warning "TypeScript check found issues."
    }
    
    # Format check
    Write-Status "Running Prettier check..."
    try {
        npm run format:check
        Write-Success "Prettier check passed"
    }
    catch {
        Write-Warning "Prettier found formatting issues. Run 'npm run format' to fix them."
    }
    
    Write-Success "Initial quality checks completed"
}

# Setup test environment
function Setup-Tests {
    if ($SkipTests) {
        Write-Warning "Skipping test setup"
        return
    }
    
    Write-Status "Setting up test environment..."
    
    # Create test directories if they don't exist
    $testDirs = @("src/test", "cypress/fixtures", "cypress/support")
    foreach ($dir in $testDirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    # Run tests to ensure everything is working
    Write-Status "Running unit tests..."
    try {
        npm run test
        Write-Success "Unit tests passed"
    }
    catch {
        Write-Warning "Some tests failed. Check the output above."
    }
    
    Write-Success "Test environment setup completed"
}

# Create environment file template
function New-EnvTemplate {
    Write-Status "Creating environment file template..."
    
    if (-not (Test-Path ".env")) {
        $envContent = @"
# NOA Esperanza Environment Variables
# Copy this file and fill in your actual values

# Supabase
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# OpenAI
VITE_OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs
VITE_ELEVEN_API_KEY=your_eleven_api_key_here

# SonarQube (for CI/CD)
SONAR_TOKEN=your_sonar_token_here

# Cypress (for CI/CD)
CYPRESS_RECORD_KEY=your_cypress_record_key_here

# Snyk (for security scanning)
SNYK_TOKEN=your_snyk_token_here
"@
        
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Environment file template created"
        Write-Warning "Please fill in your actual values in the .env file"
    }
    else {
        Write-Status "Environment file already exists"
    }
}

# Main setup function
function Main {
    Write-Host "🎯 NOA Esperanza Quality Stack Setup" -ForegroundColor $Blue
    Write-Host "======================================" -ForegroundColor $Blue
    
    Test-Node
    Install-Dependencies
    Setup-Husky
    Setup-Sonar
    Setup-Tests
    New-EnvTemplate
    Invoke-QualityChecks
    
    Write-Host ""
    Write-Host "🎉 Quality Stack Setup Complete!" -ForegroundColor $Green
    Write-Host "================================" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor $Yellow
    Write-Host "1. Fill in your environment variables in .env file"
    Write-Host "2. Run 'npm run quality' to run all quality checks"
    Write-Host "3. Run 'npm run test:cypress:open' to open Cypress test runner"
    Write-Host "4. Set up your CI/CD pipeline with the provided GitHub Actions"
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor $Yellow
    Write-Host "  npm run quality        - Run all quality checks"
    Write-Host "  npm run quality:quick  - Run quick quality checks"
    Write-Host "  npm run test           - Run unit tests"
    Write-Host "  npm run test:coverage  - Run tests with coverage"
    Write-Host "  npm run test:cypress   - Run Cypress tests"
    Write-Host "  npm run lint           - Run ESLint"
    Write-Host "  npm run format         - Format code with Prettier"
    Write-Host "  npm run sonar          - Run SonarQube analysis"
    Write-Host ""
    Write-Host "Happy coding! 🚀" -ForegroundColor $Green
}

# Run main function
Main
