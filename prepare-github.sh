#!/bin/bash
# GitHub Preparation Script
# This script prepares the repository for GitHub commit

echo "🔍 Checking repository status..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "⚠️  Git not initialized. Initializing now..."
    git init
fi

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
    
    # Check if .env is in .gitignore
    if grep -q "^\.env$" .gitignore; then
        echo "✅ .env is properly ignored"
    else
        echo "⚠️  WARNING: .env is NOT in .gitignore!"
        echo "   Adding .env to .gitignore..."
        echo "" >> .gitignore
        echo "# Environment - NEVER COMMIT" >> .gitignore
        echo ".env" >> .gitignore
    fi
else
    echo "ℹ️  .env file not found (ok if using .env.example)"
fi

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "⚠️  .env.example not found. Creating from template..."
    cat > .env.example << 'EOF'
# Environment Variables Example
# Copy this file to .env and fill in your actual values
# DO NOT COMMIT .env FILE TO GIT

VITE_API_URL=http://localhost:3000/api
VITE_API_KEY=your-api-key-here
EOF
    echo "✅ Created .env.example"
fi

# Check for secrets in code
echo "🔍 Scanning for potential secrets in code..."
if grep -r "password\|secret\|api_key\|apikey" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ apps/ 2>/dev/null | grep -v "example\|Example\|EXAMPLE\|process.env\|import.meta.env" | head -5; then
    echo "⚠️  WARNING: Potential secrets found in code!"
    echo "   Please review before committing"
else
    echo "✅ No obvious secrets found in code"
fi

# Show what will be committed
echo ""
echo "📦 Files to be committed:"
git status --short | head -20

# Show ignored files count
echo ""
echo "🚫 Ignored files (node_modules, .env, etc.):"
echo "   $(find . -name "node_modules" -type d 2>/dev/null | wc -l | xargs) node_modules directories"
echo "   $(find . -name ".env*" -not -name ".env.example" 2>/dev/null | wc -l | xargs) .env files"

echo ""
echo "✅ Repository is ready for GitHub!"
echo ""
echo "Next steps:"
echo "1. Review the files above"
echo "2. git add ."
echo "3. git commit -m 'Initial commit: Farm Visit App MVP'"
echo "4. Create GitHub repository (public)"
echo "5. git remote add origin https://github.com/YOUR_USERNAME/farm-visit-app.git"
echo "6. git push -u origin main"
echo ""
echo "📚 See GITHUB_SETUP.md for detailed instructions"


