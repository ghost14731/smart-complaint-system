#!/bin/bash

# Simple script to run the Smart Complaint Management System
# This script tries different approaches to start the application

echo "🚀 Starting Smart Complaint Management System..."
echo "=================================================="

cd "$(dirname "$0")"

# Set Java 17
export JAVA_HOME=~/.sdkman/candidates/java/current
export PATH=$JAVA_HOME/bin:$PATH

echo "📋 Checking Java version..."
java -version
echo ""

# Try to run with Maven (if dependencies are cached)
echo "🔨 Attempting to run with Maven..."
if mvn --version > /dev/null 2>&1; then
    echo "Maven found. Trying to run application..."
    timeout 30 mvn spring-boot:run -q -Dspring-boot.run.arguments="--logging.level.root=INFO" 2>/dev/null &
    MAVEN_PID=$!
    sleep 5

    if kill -0 $MAVEN_PID 2>/dev/null; then
        echo "✅ Application started successfully with Maven!"
        echo "🌐 Access the application at: http://localhost:8080"
        echo "📊 H2 Console available at: http://localhost:8080/h2-console"
        echo ""
        echo "Sample accounts:"
        echo "  Admin: admin@scms.com / password"
        echo "  Staff: john.staff@scms.com / password"
        echo "  User:  alice@example.com / password"
        echo ""
        echo "Press Ctrl+C to stop the application"
        wait $MAVEN_PID
    else
        echo "❌ Maven startup failed. Trying alternative method..."
    fi
else
    echo "❌ Maven not found or not working properly."
fi

# Alternative: Try to run with Gradle (if available)
if command -v gradle > /dev/null 2>&1; then
    echo "🔨 Trying with Gradle..."
    # Create basic build.gradle if it doesn't exist
    if [ ! -f build.gradle ]; then
        cat > build.gradle << 'EOF'
plugins {
    id 'org.springframework.boot' version '3.2.5'
    id 'java'
}

group = 'com.scms'
version = '1.0'

java {
    sourceCompatibility = '21'
}

repositories {
    mavenCentral()
}

dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'com.h2database:h2'
    implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
}
EOF
    fi

    gradle bootRun &
    GRADLE_PID=$!
    sleep 5

    if kill -0 $GRADLE_PID 2>/dev/null; then
        echo "✅ Application started successfully with Gradle!"
        echo "🌐 Access the application at: http://localhost:8080"
        wait $GRADLE_PID
    fi
fi

# If all else fails, provide manual instructions
echo "❌ Automatic startup failed."
echo ""
echo "📋 Manual startup instructions:"
echo "1. Ensure Java 21+ is installed"
echo "2. Run: mvn spring-boot:run"
echo "3. Or: ./mvnw spring-boot:run (if Maven wrapper exists)"
echo "4. Access at: http://localhost:8080"
echo ""
echo "🔧 Troubleshooting:"
echo "- Check if port 8080 is available"
echo "- Ensure database configuration is correct"
echo "- Try: mvn clean compile first"