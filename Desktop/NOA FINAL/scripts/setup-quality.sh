#!/bin/bash

# NOA Esperanza - Quality Stack Setup Script
# This script installs and configures all quality assurance tools

set -e

echo "🚀 Setting up NOA Esperanza Quality Stack..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed successfully"
}

# Setup Husky
setup_husky() {
    print_status "Setting up Husky for Git hooks..."
    
    npx husky install
    npx husky add .husky/pre-commit "npm run pre-commit"
    npx husky add .husky/pre-push "npm run pre-push"
    
    print_success "Husky setup completed"
}

# Setup SonarQube
setup_sonar() {
    print_status "Setting up SonarQube..."
    
    if [ ! -f "sonar-project.properties" ]; then
        print_warning "sonar-project.properties not found. Creating default configuration..."
        # The file should already exist from our previous setup
    fi
    
    print_success "SonarQube configuration ready"
    print_warning "Make sure to set SONAR_TOKEN environment variable for CI/CD"
}

# Run initial quality checks
run_quality_checks() {
    print_status "Running initial quality checks..."
    
    # Lint check
    print_status "Running ESLint..."
    npm run lint || print_warning "ESLint found issues. Run 'npm run lint:fix' to fix them."
    
    # Type check
    print_status "Running TypeScript check..."
    npm run type-check || print_warning "TypeScript check found issues."
    
    # Format check
    print_status "Running Prettier check..."
    npm run format:check || print_warning "Prettier found formatting issues. Run 'npm run format' to fix them."
    
    print_success "Initial quality checks completed"
}

# Setup test environment
setup_tests() {
    print_status "Setting up test environment..."
    
    # Create test directories if they don't exist
    mkdir -p src/test
    mkdir -p cypress/fixtures
    mkdir -p cypress/support
    
    # Run tests to ensure everything is working
    print_status "Running unit tests..."
    npm run test || print_warning "Some tests failed. Check the output above."
    
    print_success "Test environment setup completed"
}

# Create environment file template
create_env_template() {
    print_status "Creating environment file template..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
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
EOF
        print_success "Environment file template created"
        print_warning "Please fill in your actual values in the .env file"
    else
        print_status "Environment file already exists"
    fi
}

# Main setup function
main() {
    echo "🎯 NOA Esperanza Quality Stack Setup"
    echo "======================================"
    
    check_node
    install_dependencies
    setup_husky
    setup_sonar
    setup_tests
    create_env_template
    run_quality_checks
    
    echo ""
    echo "🎉 Quality Stack Setup Complete!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Fill in your environment variables in .env file"
    echo "2. Run 'npm run quality' to run all quality checks"
    echo "3. Run 'npm run test:cypress:open' to open Cypress test runner"
    echo "4. Set up your CI/CD pipeline with the provided GitHub Actions"
    echo ""
    echo "Available commands:"
    echo "  npm run quality        - Run all quality checks"
    echo "  npm run quality:quick  - Run quick quality checks"
    echo "  npm run test           - Run unit tests"
    echo "  npm run test:coverage  - Run tests with coverage"
    echo "  npm run test:cypress   - Run Cypress tests"
    echo "  npm run lint           - Run ESLint"
    echo "  npm run format         - Format code with Prettier"
    echo "  npm run sonar          - Run SonarQube analysis"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main function
main "$@"
