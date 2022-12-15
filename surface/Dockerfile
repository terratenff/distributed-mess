# Build stage.
FROM maven:3.6.3-jdk-11-slim AS build
COPY src /app/src
COPY pom.xml /app
RUN mvn -f /app/pom.xml clean package

# Package stage.
FROM eclipse-temurin:11
RUN curl -fsSL https://deb.nodesource.com/setup_19.x | bash - &&\
    apt-get install -y nodejs
RUN npm install -g babel-cli
COPY --from=build /app/target/surface-1.0-SNAPSHOT.jar /usr/local/lib/surface.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/usr/local/lib/surface.jar"]
