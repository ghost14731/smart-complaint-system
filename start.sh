#!/bin/bash

# Smart Complaint Management System - Direct Java Runner
# This script downloads dependencies and runs the application without Maven plugins

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Smart Complaint Management System"
echo "===================================="
echo ""

# Ensure target/classes exists
mkdir -p target/classes target/lib

# Download dependencies using Maven offline
echo "📦 Resolving dependencies..."
mvn -q dependency:copy-dependencies -DoutputDirectory=target/lib -DskipTests 2>/dev/null || {
    echo "⚠️  Could not download dependencies with Maven"
    echo "Attempting alternative method..."
}

# Compile the source code
echo "🔨 Compiling source code..."
CLASSPATH="target/classes"
for jar in target/lib/*.jar; do
    if [ -f "$jar" ]; then
        CLASSPATH="$CLASSPATH:$jar"
    fi
done

# Find and compile all Java files
find src/main/java -name "*.java" -print0 | xargs -0 timeout 30 javac -cp "$CLASSPATH" -d target/classes -encoding UTF-8 2>/dev/null || {
    echo "⚠️  Compilation with full classpath failed, trying simpler approach..."
    find src/main/java -name "*.java" | head -1 | xargs javac -d target/classes 2>&1 | head -20
}

# Copy resources
echo "📝 Copying resources..."
cp -r src/main/resources/* target/classes/ 2>/dev/null || true

# Run the application
echo "🌐 Starting application..."
echo "   Access at http://localhost:8080"
echo ""

java -cp "$CLASSPATH" \
    -Dspring.profiles.active=default \
    org.springframework.boot.loader.JarLauncher "$@" 2>/dev/null || \
java -cp "$CLASSPATH" \
    com.scms.SmartComplaintSystemApplication "$@" || \
{
    echo "❌ Failed to start application"
    echo "Please run with Maven: mvn spring-boot:run"
    exit 1
}