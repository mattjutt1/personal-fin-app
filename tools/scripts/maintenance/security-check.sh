#!/bin/bash
# Personal Finance App - Security Check Script
# Run this before every commit to ensure no secrets are exposed

set -e

echo "🔒 Running Security Checks..."

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Initialize counters
ISSUES=0

echo "🔍 Checking for secrets in code..."

# Define comprehensive exclusions for false positives
EXCLUDE_COMMON="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=venv --exclude-dir=.venv --exclude-dir=env --exclude-dir=ENV --exclude-dir=target --exclude-dir=__pycache__ --exclude-dir=.pytest_cache --exclude-dir=site-packages --exclude-dir=lib --exclude-dir=lib64 --exclude=*.example.* --exclude=*.template.* --exclude=security-check.sh --exclude-dir=tools/environments"

# Check for common secret patterns (basic check) - only in source code areas
SOURCE_DIRS="apps/ docs/ packages/ data/schemas/"

echo "🔍 Scanning source code directories: $SOURCE_DIRS"

# Check for API key patterns in source code only
if grep -r -i "api[_-]key\s*[:=]\s*['\"][a-zA-Z0-9-_]{20,}['\"]" $SOURCE_DIRS 2>/dev/null | grep -v "example\|template\|test\|mock\|placeholder" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found potential real API keys in source code${NC}"
    grep -r -i "api[_-]key\s*[:=]\s*['\"][a-zA-Z0-9-_]{20,}['\"]" $SOURCE_DIRS 2>/dev/null | grep -v "example\|template\|test\|mock\|placeholder"
    ISSUES=$((ISSUES + 1))
fi

# Check for password patterns in source code only
if grep -r -i "password\s*[:=]\s*['\"][^'\"]{8,}['\"]" $SOURCE_DIRS 2>/dev/null | grep -v "example\|template\|test\|mock\|placeholder\|your-password" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found potential real passwords in source code${NC}"
    grep -r -i "password\s*[:=]\s*['\"][^'\"]{8,}['\"]" $SOURCE_DIRS 2>/dev/null | grep -v "example\|template\|test\|mock\|placeholder\|your-password"
    ISSUES=$((ISSUES + 1))
fi

# Check for secret key patterns in source code only
if grep -r -i "secret[_-]key\s*[:=]\s*['\"][a-zA-Z0-9-_]{20,}['\"]" $SOURCE_DIRS 2>/dev/null | grep -v "example\|template\|test\|mock\|placeholder" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found potential real secret keys in source code${NC}"
    grep -r -i "secret[_-]key\s*[:=]\s*['\"][a-zA-Z0-9-_]{20,}['\"]" $SOURCE_DIRS 2>/dev/null | grep -v "example\|template\|test\|mock\|placeholder"
    ISSUES=$((ISSUES + 1))
fi

# Check for .env files that might be committed
echo "📁 Checking for .env files..."
if find . -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" | grep -v ".env.example" | grep -v ".env.template" > /dev/null 2>&1; then
    echo -e "${RED}❌ Found .env files that might contain secrets${NC}"
    find . -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" | grep -v ".env.example" | grep -v ".env.template"
    echo -e "${YELLOW}⚠️  Make sure these are in .gitignore${NC}"
    ISSUES=$((ISSUES + 1))
fi

# Check if .gitignore exists and contains basic patterns
echo "📋 Checking .gitignore..."
if [ ! -f ".gitignore" ]; then
    echo -e "${RED}❌ .gitignore file is missing${NC}"
    ISSUES=$((ISSUES + 1))
else
    # Check for essential patterns
    if ! grep -q "\.env" .gitignore; then
        echo -e "${RED}❌ .gitignore missing .env pattern${NC}"
        ISSUES=$((ISSUES + 1))
    fi
    
    if ! grep -q "\*\.key" .gitignore; then
        echo -e "${RED}❌ .gitignore missing *.key pattern${NC}"
        ISSUES=$((ISSUES + 1))
    fi
    
    if ! grep -q "\*secret\*" .gitignore; then
        echo -e "${RED}❌ .gitignore missing *secret* pattern${NC}"
        ISSUES=$((ISSUES + 1))
    fi
fi

# Check for environment variable templates
echo "📝 Checking environment templates..."
if [ ! -f "apps/frontend/.env.local.example" ]; then
    echo -e "${YELLOW}⚠️  Missing apps/frontend/.env.local.example template${NC}"
fi

if [ ! -f "apps/backend/.env.example" ]; then
    echo -e "${YELLOW}⚠️  Missing apps/backend/.env.example template${NC}"
fi

# Check for TODO markers indicating security work needed in source code (excluding node_modules)
echo "📌 Checking for security TODOs in source code..."
if grep -r -i "TODO.*security\|FIXME.*security\|XXX.*security" $SOURCE_DIRS --exclude-dir=node_modules 2>/dev/null > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Found security-related TODOs in source code:${NC}"
    grep -r -i "TODO.*security\|FIXME.*security\|XXX.*security" $SOURCE_DIRS --exclude-dir=node_modules 2>/dev/null
fi

# Advanced check: detect-secrets if available
if command -v detect-secrets &> /dev/null; then
    echo "🔍 Running detect-secrets scan..."
    if detect-secrets scan --baseline .secrets.baseline > /dev/null 2>&1; then
        echo -e "${GREEN}✅ detect-secrets scan passed${NC}"
    else
        echo -e "${RED}❌ detect-secrets found new potential secrets${NC}"
        echo "Run: detect-secrets scan --update .secrets.baseline"
        ISSUES=$((ISSUES + 1))
    fi
else
    echo -e "${YELLOW}⚠️  detect-secrets not installed. Install with: pip install detect-secrets${NC}"
fi

# Summary
echo ""
echo "📊 Security Check Summary:"
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    echo -e "${GREEN}🔒 Safe to commit${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ISSUES security issues${NC}"
    echo -e "${RED}🚫 Do not commit until issues are resolved${NC}"
    echo ""
    echo "📚 See docs/SECURITY.md for guidance"
    exit 1
fi