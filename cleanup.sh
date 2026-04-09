#!/bin/bash
# Bash script to clean and reinstall dependencies

echo "🧹 Cleaning up node_modules and package-lock.json..."

# Remove node_modules
if [ -d "node_modules" ]; then
    echo "Removing node_modules..."
    rm -rf node_modules
    if [ -d "node_modules" ]; then
        echo "⚠️  Could not delete node_modules. Please:"
        echo "   1. Close VS Code and all terminals"
        echo "   2. Run with sudo: sudo ./cleanup.sh"
        echo "   3. Or manually delete the node_modules folder"
        exit 1
    fi
    echo "✅ node_modules removed"
else
    echo "✅ node_modules already removed"
fi

# Remove package-lock.json
if [ -f "package-lock.json" ]; then
    echo "Removing package-lock.json..."
    rm -f package-lock.json
    echo "✅ package-lock.json removed"
else
    echo "✅ package-lock.json already removed"
fi

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🚀 You can now run: npm run dev"
else
    echo "❌ Installation failed. Please check the errors above."
fi
