FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

# Copy source files
COPY src /app/src
COPY pom.xml /app/
COPY application.properties /app/src/main/resources/

# Install Maven
RUN apt-get update && apt-get install -y maven && apt-get clean

# Build the application
RUN mvn clean package -DskipTests -q || mvn clean compile -q

# Run the application
CMD ["java", "-cp", "target/classes:${MAVEN_HOME}/lib/*", "com.scms.SmartComplaintSystemApplication"]

EXPOSE 8080
