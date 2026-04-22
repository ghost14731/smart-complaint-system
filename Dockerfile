FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy only necessary files first (better caching)

COPY pom.xml .
RUN mvn -B -q -e -DskipTests dependency:go-offline

# Now copy source

COPY src ./src

RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim

WORKDIR /app

COPY --from=build /app/target/smart-complaint-system-1.0.0.jar app.jar

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]
