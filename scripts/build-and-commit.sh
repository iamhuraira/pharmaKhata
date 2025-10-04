#!/bin/bash

# Build and Commit Workflow Script
# This script builds the project and automatically commits successful builds

set -e  # Exit on any error

echo "🚀 Starting Build and Commit Workflow"
echo "======================================"

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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository!"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected"
    git status --short
else
    print_status "No uncommitted changes"
fi

# Check if we're on main/master branch
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
    print_warning "You're on the main branch. Consider creating a feature branch."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Build cancelled"
        exit 0
    fi
fi

# Run the build
print_status "Starting build process..."
if npm run build; then
    print_success "Build completed successfully!"
    
    # Check if there are changes to commit
    if [ -n "$(git status --porcelain)" ]; then
        print_status "Changes detected, preparing to commit..."
        
        # Add all changes
        git add .
        
        # Create commit message
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        COMMIT_MSG="build: successful build at $TIMESTAMP on $CURRENT_BRANCH"
        
        # Commit
        if git commit -m "$COMMIT_MSG"; then
            print_success "Code committed successfully!"
            print_status "Commit message: $COMMIT_MSG"
            print_status "Commit hash: $(git rev-parse --short HEAD)"
            
            # Show recent commits
            echo
            print_status "Recent commits:"
            git log --oneline -5
        else
            print_error "Failed to commit changes"
            exit 1
        fi
    else
        print_status "No changes to commit after build"
    fi
    
    print_success "Build and commit workflow completed successfully!"
    
else
    print_error "Build failed!"
    exit 1
fi
